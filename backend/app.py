import os
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="Credit Card Risk Analysis API",
    description="An API serving default risk predictions with trained features.",
    version="1.0.0"
)

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'model', 'model.pkl')

model = joblib.load(MODEL_PATH)

class PredictionRequest(BaseModel):
    LIMIT_BAL: float = Field(..., ge=0)
    SEX: int = Field(..., ge=1, le=2)
    EDUCATION: int = Field(..., ge=0, le=6)
    MARRIAGE: int = Field(..., ge=0, le=3)
    AGE: int = Field(..., ge=18, le=100)
    
    PAY_0: int = Field()
    PAY_2: int = Field()
    PAY_3: int = Field()
    PAY_4: int = Field()
    PAY_5: int = Field()
    PAY_6: int = Field()
    
    BILL_AMT1: float = Field()
    BILL_AMT2: float = Field()
    BILL_AMT3: float = Field()
    BILL_AMT4: float = Field()
    BILL_AMT5: float = Field()
    BILL_AMT6: float = Field()
    
    PAY_AMT1: float = Field(..., ge=0,)
    PAY_AMT2: float = Field(..., ge=0)
    PAY_AMT3: float = Field(..., ge=0)
    PAY_AMT4: float = Field(..., ge=0)
    PAY_AMT5: float = Field(..., ge=0)
    PAY_AMT6: float = Field(..., ge=0)


def preprocess_features(input_dict: dict) -> pd.DataFrame:
    
    df = pd.DataFrame([input_dict])
    df['EDUCATION'] = df['EDUCATION'].replace({0: 4, 5: 4, 6: 4})
    df['MARRIAGE'] = df['MARRIAGE'].replace({0: 3})
    
    bill_cols = ['BILL_AMT1', 'BILL_AMT2', 'BILL_AMT3', 'BILL_AMT4', 'BILL_AMT5', 'BILL_AMT6']
    df['AVG_UTIL_RATE'] = df[bill_cols].div(df['LIMIT_BAL'], axis=0).mean(axis=1)
    
    pay_delay_cols_6m = ['PAY_0', 'PAY_2', 'PAY_3', 'PAY_4', 'PAY_5', 'PAY_6']
    df['TOTAL_DELAY_MONTHS'] = df[pay_delay_cols_6m].gt(0).sum(axis=1)
    
    pay_amt_cols = ['PAY_AMT1', 'PAY_AMT2', 'PAY_AMT3', 'PAY_AMT4', 'PAY_AMT5', 'PAY_AMT6']
    bill_values = df[bill_cols].replace(0, np.nan).to_numpy()
    pay_values = df[pay_amt_cols].to_numpy()
    pay_ratio = pay_values / bill_values
    df['AVG_PAY_RATIO'] = np.nanmean(pay_ratio, axis=1)
    df['AVG_PAY_RATIO'] = df['AVG_PAY_RATIO'].fillna(0)
    
    # 5. Moving Average features
    bill_cols_3m = ['BILL_AMT1', 'BILL_AMT2', 'BILL_AMT3']
    df['BILL_AMT_AVG_3M'] = df[bill_cols_3m].mean(axis=1)
    df['BILL_AMT_AVG_6M'] = df[bill_cols].mean(axis=1)
    df['BILL_TREND_UP'] = (df['BILL_AMT_AVG_3M'] > df['BILL_AMT_AVG_6M']).astype(int)
    
    # Standard deviation of payments (fill NaN with 0)
    df['PAY_AMT_STD'] = df[pay_amt_cols].astype(float).std(axis=1).fillna(0.0)
    
    # 6. Exponentially Weighted Moving Averages (EWMA)
    weights = np.array([0.5**i for i in range(6)])
    weights /= weights.sum() # Normalize weights
    
    pay_values_arr = df[pay_amt_cols].to_numpy()
    df['PAY_AMT_EWMA'] = np.dot(pay_values_arr, weights)
    
    bill_values_arr = df[bill_cols].to_numpy()
    df['BILL_AMT_EWMA'] = np.dot(bill_values_arr, weights)
    
    delay_values_arr = df[pay_delay_cols_6m].to_numpy()
    df['PAY_DELAY_EWMA'] = np.dot(delay_values_arr, weights)
    
    pay_delay_cols_3m = ['PAY_0', 'PAY_2', 'PAY_3']
    df['PAY_DELAY_AVG_3M'] = df[pay_delay_cols_3m].mean(axis=1)
    df['PAY_DELAY_AVG_6M'] = df[pay_delay_cols_6m].mean(axis=1)
    df['PAY_DELAY_TREND_UP'] = (df['PAY_DELAY_AVG_3M'] > df['PAY_DELAY_AVG_6M']).astype(int)
    
    # 8. Payment Moving Averages and Trend
    pay_cols_3m = ['PAY_AMT1', 'PAY_AMT2', 'PAY_AMT3']
    df['PAY_AMT_AVG_3M'] = df[pay_cols_3m].mean(axis=1)
    df['PAY_AMT_AVG_6M'] = df[pay_amt_cols].mean(axis=1)
    df['PAY_TREND_UP'] = (df['PAY_AMT_AVG_3M'] > df['PAY_AMT_AVG_6M']).astype(int)
    
    # 9. Time Series Linear Trend Slope and Forecast for October (Month 7)
    t_coeffs = np.array([-2.5, -1.5, -0.5, 0.5, 1.5, 2.5])
    
    # Sequences in chronological order (April to September: x6, x5, x4, x3, x2, x0/x1)
    bill_seq = df[['BILL_AMT6', 'BILL_AMT5', 'BILL_AMT4', 'BILL_AMT3', 'BILL_AMT2', 'BILL_AMT1']].to_numpy()
    pay_seq = df[['PAY_AMT6', 'PAY_AMT5', 'PAY_AMT4', 'PAY_AMT3', 'PAY_AMT2', 'PAY_AMT1']].to_numpy()
    delay_seq = df[['PAY_6', 'PAY_5', 'PAY_4', 'PAY_3', 'PAY_2', 'PAY_0']].to_numpy()
    
    df['BILL_AMT_SLOPE'] = np.dot(bill_seq, t_coeffs) / 17.5
    df['PAY_AMT_SLOPE'] = np.dot(pay_seq, t_coeffs) / 17.5
    df['PAY_DELAY_SLOPE'] = np.dot(delay_seq, t_coeffs) / 17.5
    
    df['BILL_AMT_PRED_OCT'] = bill_seq.mean(axis=1) + 3.5 * df['BILL_AMT_SLOPE']
    df['PAY_AMT_PRED_OCT'] = pay_seq.mean(axis=1) + 3.5 * df['PAY_AMT_SLOPE']
    df['PAY_DELAY_PRED_OCT'] = delay_seq.mean(axis=1) + 3.5 * df['PAY_DELAY_SLOPE']
    
    # 10. First Differences
    df['BILL_AMT_DIFF1'] = df['BILL_AMT1'] - df['BILL_AMT2']
    df['PAY_AMT_DIFF1'] = df['PAY_AMT1'] - df['PAY_AMT2']
    df['PAY_DELAY_DIFF1'] = df['PAY_0'] - df['PAY_2']
    
    # Order columns exactly matching (train.py X)
    feature_order = [
        'LIMIT_BAL', 'SEX', 'EDUCATION', 'MARRIAGE', 'AGE',
        'PAY_0', 'PAY_2', 'PAY_3', 'PAY_4', 'PAY_5', 'PAY_6',
        'BILL_AMT1', 'BILL_AMT2', 'BILL_AMT3', 'BILL_AMT4', 'BILL_AMT5', 'BILL_AMT6',
        'PAY_AMT1', 'PAY_AMT2', 'PAY_AMT3', 'PAY_AMT4', 'PAY_AMT5', 'PAY_AMT6',
        'AVG_UTIL_RATE', 'TOTAL_DELAY_MONTHS', 'AVG_PAY_RATIO',
        'BILL_AMT_AVG_3M', 'BILL_AMT_AVG_6M', 'BILL_TREND_UP',
        'PAY_AMT_STD', 'PAY_AMT_EWMA', 'BILL_AMT_EWMA', 'PAY_DELAY_EWMA',
        'PAY_DELAY_AVG_3M', 'PAY_DELAY_AVG_6M', 'PAY_DELAY_TREND_UP',
        'PAY_AMT_AVG_3M', 'PAY_AMT_AVG_6M', 'PAY_TREND_UP',
        'BILL_AMT_SLOPE', 'PAY_AMT_SLOPE', 'PAY_DELAY_SLOPE',
        'BILL_AMT_PRED_OCT', 'PAY_AMT_PRED_OCT', 'PAY_DELAY_PRED_OCT',
        'BILL_AMT_DIFF1', 'PAY_AMT_DIFF1', 'PAY_DELAY_DIFF1'
    ]
    
    return df[feature_order]


@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Credit Card Default Prediction Service is active.",
        "model_loaded": True
    }


@app.post("/predict")
def predict_risk(req: PredictionRequest):
    try:
        input_data = req.model_dump()
        features_df = preprocess_features(input_data)
        
        prob = model.predict_proba(features_df)[0, 1]
        prediction = int(model.predict(features_df)[0])
        
        if prob < 0.25:
            risk_class = "Low"
        elif prob < 0.55:
            risk_class = "Medium"
        else:
            risk_class = "High"
            
        metrics = {
            "avg_utilization_rate": float(features_df["AVG_UTIL_RATE"].iloc[0]),
            "total_delay_months": int(features_df["TOTAL_DELAY_MONTHS"].iloc[0]),
            "avg_pay_ratio": float(features_df["AVG_PAY_RATIO"].iloc[0]),
            "bill_trend_up": bool(features_df["BILL_TREND_UP"].iloc[0]),
            "pay_delay_ewma": float(features_df["PAY_DELAY_EWMA"].iloc[0]),
            "bill_amt_ewma": float(features_df["BILL_AMT_EWMA"].iloc[0]),
        }
        
        return {
            "default_probability": round(float(prob), 4),
            "risk_classification": risk_class,
            "prediction": prediction,
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
