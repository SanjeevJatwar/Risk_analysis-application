import React from 'react';

export default function TechnicalExplainer() {
  return (
    <div className="glass-panel fade-in" style={{ padding: '30px', textAlign: 'left' }}>
      <h2 style={{ fontSize: '1.4rem', marginBottom: '14px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', marginTop: 0 }}>
        Technical Portfolio Details for Interviews
      </h2>

      <p style={{ marginBottom: '20px', fontSize: '0.95rem', lineHeight: '1.6' }}>
        This project demonstrates a production-grade integration of a machine learning workflow. In interviews, you can leverage this architecture to showcase your skills in <strong>Feature Engineering</strong>, <strong>Model Deployment</strong>, and <strong>Interactive UI Design</strong>.
      </p>

      <div className="grid-cols-2" style={{ gap: '24px', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--brand-blue)', marginBottom: '8px', marginTop: 0 }}>1. Custom Feature Engineering</h3>
          <p style={{ fontSize: '0.85rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
            A model is only as good as its features. Rather than feeding raw monthly statements directly, the backend applies real-time calculations matching the training pipeline:
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <li style={{ marginBottom: '6px' }}><strong>EWMA (Exponentially Weighted Moving Average):</strong> Calculates weighted metrics for repayment delays and bills, prioritizing recent credit usage over older history.</li>
            <li style={{ marginBottom: '6px' }}><strong>Slope Forecasting:</strong> Applies ordinary least squares to past 6 months to project the next month's debt direction.</li>
            <li style={{ marginBottom: '6px' }}><strong>Utilization Rate:</strong> Measures overall revolving credit exposure relative to the allowed limit.</li>
          </ul>
        </div>

        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--brand-blue)', marginBottom: '8px', marginTop: 0 }}>2. Model & Pipeline Evaluation</h3>
          <p style={{ fontSize: '0.85rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
            The training pipeline ([train.py](file:///d:/Risk_analysis/backend/model/train.py)) processes the UCI Credit Card Dataset (30,000 observations):
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <li style={{ marginBottom: '6px' }}><strong>Baseline comparison:</strong> Compares a Logistic Regression baseline against an XGBoost Classifier pipeline.</li>
            <li style={{ marginBottom: '6px' }}><strong>Evaluation Metric:</strong> Optimizes for Stratified 5-Fold Cross-Validation AUC-ROC. XGBoost scores <strong>0.7619 AUC-ROC</strong>.</li>
            <li style={{ marginBottom: '6px' }}><strong>Key Predictors:</strong> The top features by XGBoost feature importance are <code>PAY_DELAY_EWMA</code>, <code>TOTAL_DELAY_MONTHS</code>, and <code>PAY_DELAY_AVG_3M</code>.</li>
          </ul>
        </div>
      </div>

      <h3 style={{ fontSize: '1.1rem', color: 'var(--brand-blue)', marginBottom: '8px', marginTop: 0 }}>3. Production Deployment Architecture</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
        The backend uses <strong>FastAPI</strong> to load the serialized pipeline binary (`model.pkl`) using joblib. Real-time REST endpoints parse input payloads through Pydantic models, apply vector features via pandas and numpy, and return prediction results within milliseconds.
      </p>

      <div className="code-panel">
        {`# Backend prediction workflow in app.py
@app.post("/predict")
def predict_risk(req: PredictionRequest):
    input_data = req.model_dump()
    features_df = preprocess_features(input_data) # Real-time feature engineering
    prob = model.predict_proba(features_df)[0, 1] # Model prediction
    return {
        "default_probability": round(float(prob), 4),
        "risk_classification": "High" if prob >= 0.55 else "Medium" if prob >= 0.25 else "Low",
        "metrics": { ... }
    }`}
      </div>
    </div>
  );
}
