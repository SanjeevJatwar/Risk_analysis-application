import matplotlib
matplotlib.use('Agg')
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
# Mock Jupyter display function
def display(*args, **kwargs):
    for arg in args:
        print(arg)

if __name__ == '__main__':
    import warnings
    warnings.filterwarnings('ignore')
    import pandas as pd
    import matplotlib.pyplot as plt
    import seaborn as sns
    import numpy as np
    import xgboost as xgb
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_squared_error, r2_score
    from sklearn.preprocessing import LabelEncoder
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import classification_report, confusion_matrix
    
    # Load the data
    df = pd.read_csv(r'D:\Risk_analysis\backend\model\data\UCI_Credit_Card.csv')

    df.head()

    print(df.shape)
    print(df.dtypes) # No categorical variable present in the dataset, all are numerical.
    # df.isnull().sum()  
    # # NO empty cell present in the dataset 

    df['default.payment.next.month'].value_counts()

    # Plot distributions of LIMIT_BAL, AGE, and PAY_0; flag any anomalies.
    plt.figure(figsize=(15, 5))
    
    plt.subplot(1, 3, 1)
    sns.histplot(df['LIMIT_BAL'], bins=30, kde=True)
    plt.title('Distribution of LIMIT_BAL')
    
    plt.subplot(1, 3, 2)
    sns.histplot(df['AGE'], bins=30, kde=True)
    plt.title('Distribution of AGE')
    
    plt.subplot(1, 3, 3)
    sns.histplot(df['PAY_0'], bins=30, kde=True)
    plt.title('Distribution of PAY_0')
    
    plt.show()

    # Compare default rates across SEX, EDUCATION, MARRIAGE, and AGE bands.
    
    plt.figure(figsize=(15, 10))
    plt.subplot(2, 2, 1)    
    sns.barplot(x='SEX', y='default.payment.next.month', data=df)
    plt.title('Default Rate by SEX')
    
    plt.subplot(2, 2, 2)
    sns.barplot(x='EDUCATION', y='default.payment.next.month', data=df)
    plt.title('Default Rate by EDUCATION')
    
    plt.subplot(2, 2, 3)
    sns.barplot(x='MARRIAGE', y='default.payment.next.month', data=df)
    plt.title('Default Rate by MARRIAGE')
    
    plt.subplot(2, 2, 4)
    sns.barplot(x='AGE', y='default.payment.next.month', data=df)
    plt.title('Default Rate by AGE')
    plt.tight_layout()
    
    plt.show()

    # Visualise repayment delay patterns across PAY_0 to PAY_6 by default outcome.
    
    pay_cols = ['PAY_0', 'PAY_2', 'PAY_3', 'PAY_4', 'PAY_5', 'PAY_6']
    plt.figure(figsize=(15, 10))
    for i, col in enumerate(pay_cols):
        plt.subplot(2, 3, i+1)
        sns.barplot(x='default.payment.next.month', y=col, data=df)
        plt.title(f'{col} by Default Outcome')

    # Correlation heatmap; identify top 5 features associated with default.
    plt.figure(figsize=(12, 10))
    corr = df.corr()
    sns.heatmap(corr, annot=True, fmt=".2f", cmap='coolwarm')
    plt.title('Correlation Heatmap')
    plt.show()
    print("Top 5 features most correlated with default.payment.next.month:")
    print(corr['default.payment.next.month'].abs().sort_values(ascending=False).head(6)[1:])

    # Create AVG_UTIL_RATE = mean(BILL_AMTx / LIMIT_BAL) across 6 months — measures credit utilisation.
    bill_cols = ['BILL_AMT1', 'BILL_AMT2', 'BILL_AMT3', 'BILL_AMT4', 'BILL_AMT5', 'BILL_AMT6']
    df['AVG_UTIL_RATE'] = df[bill_cols].div(df['LIMIT_BAL'], axis=0).mean(axis=1)
    
    
    
    # Create TOTAL_DELAY_MONTHS = count of PAY_x values &gt; 0 — cumulative delinquency signal.
    pay_cols = ['PAY_0', 'PAY_2', 'PAY_3', 'PAY_4', 'PAY_5', 'PAY_6']
    df['TOTAL_DELAY_MONTHS'] = df[pay_cols].gt(0).sum(axis=1)
    
    # Encode EDUCATION (merge values 0, 5, 6 into 'other') and MARRIAGE (merge 0 into 'other').
    df['EDUCATION'] = df['EDUCATION'].replace({0: 4, 5: 4, 6: 4})
    df['MARRIAGE'] = df['MARRIAGE'].replace({0: 3})


    # Create AVG_PAY_RATIO = mean(PAY_AMTx / BILL_AMTx where BILL_AMTx>0) — repayment consistency.
    
    pay_amt_cols = ['PAY_AMT1', 'PAY_AMT2', 'PAY_AMT3', 'PAY_AMT4', 'PAY_AMT5', 'PAY_AMT6']
    
    # Replace bill amounts <= 0 with NaN (div error)
    bill_values = df[bill_cols].replace(0, np.nan).to_numpy()
    
    pay_values = df[pay_amt_cols].to_numpy()
    pay_ratio = pay_values / bill_values
    
    # Row-wise average ignoring NaN
    df['AVG_PAY_RATIO'] = np.nanmean(pay_ratio, axis=1)
    df['AVG_PAY_RATIO'] = df['AVG_PAY_RATIO'].fillna(0)

    # Moving Average and Time Series Feature Engineering
    
    # 1. 3-Month vs 6-Month Bill Moving Averages
    bill_cols_3m = ['BILL_AMT1', 'BILL_AMT2', 'BILL_AMT3']
    bill_cols_6m = ['BILL_AMT1', 'BILL_AMT2', 'BILL_AMT3', 'BILL_AMT4', 'BILL_AMT5', 'BILL_AMT6']
    
    df['BILL_AMT_AVG_3M'] = df[bill_cols_3m].mean(axis=1)
    df['BILL_AMT_AVG_6M'] = df[bill_cols_6m].mean(axis=1)
    # Trend: Is debt escalating? (1 if 3M average > 6M average, else 0)
    df['BILL_TREND_UP'] = (df['BILL_AMT_AVG_3M'] > df['BILL_AMT_AVG_6M']).astype(int)
    
    # 2. Payment Volatility (Standard Deviation)
    pay_amt_cols = ['PAY_AMT1', 'PAY_AMT2', 'PAY_AMT3', 'PAY_AMT4', 'PAY_AMT5', 'PAY_AMT6']
    df['PAY_AMT_STD'] = df[pay_amt_cols].astype(float).std(axis=1)
    
    # 3. Exponentially Weighted Moving Average (EWMA) for Payments, Bills, and Delays
    # Giving more weight to recent values (index 1 / 0 is most recent: September)
    weights = np.array([0.5**i for i in range(6)])
    weights /= weights.sum() # Normalize weights
    
    pay_values = df[pay_amt_cols].to_numpy()
    df['PAY_AMT_EWMA'] = np.dot(pay_values, weights)
    
    bill_values_6m = df[bill_cols_6m].to_numpy()
    df['BILL_AMT_EWMA'] = np.dot(bill_values_6m, weights)
    
    pay_delay_cols_6m = ['PAY_0', 'PAY_2', 'PAY_3', 'PAY_4', 'PAY_5', 'PAY_6']
    delay_values = df[pay_delay_cols_6m].to_numpy()
    df['PAY_DELAY_EWMA'] = np.dot(delay_values, weights)
    
    # 4. Recent Repayment Delay Momentum (3-Month vs 6-Month average delays)
    pay_delay_cols_3m = ['PAY_0', 'PAY_2', 'PAY_3']
    df['PAY_DELAY_AVG_3M'] = df[pay_delay_cols_3m].mean(axis=1)
    df['PAY_DELAY_AVG_6M'] = df[pay_delay_cols_6m].mean(axis=1)
    # Trend: Is delinquency worsening? (3M average delay > 6M average delay)
    df['PAY_DELAY_TREND_UP'] = (df['PAY_DELAY_AVG_3M'] > df['PAY_DELAY_AVG_6M']).astype(int)
    
    # 5. Payment Moving Averages and Trend
    pay_cols_3m = ['PAY_AMT1', 'PAY_AMT2', 'PAY_AMT3']
    df['PAY_AMT_AVG_3M'] = df[pay_cols_3m].mean(axis=1)
    df['PAY_AMT_AVG_6M'] = df[pay_amt_cols].mean(axis=1)
    # Trend: Is payment amount increasing?
    df['PAY_TREND_UP'] = (df['PAY_AMT_AVG_3M'] > df['PAY_AMT_AVG_6M']).astype(int)
    
    # 6. Time Series Linear Trend Slope and Forecast for October (Month 7)
    # For time t = [1, 2, 3, 4, 5, 6] (April to September), we compute the slope and forecast at t = 7.
    # Formula for slope: slope = Sum((t - 3.5) * x) / 17.5
    # Formula for October forecast (t=7): forecast = mean(x) + 3.5 * slope
    t_coeffs = np.array([-2.5, -1.5, -0.5, 0.5, 1.5, 2.5])
    
    # Chronological order of sequences (April to September)
    bill_seq = df[['BILL_AMT6', 'BILL_AMT5', 'BILL_AMT4', 'BILL_AMT3', 'BILL_AMT2', 'BILL_AMT1']].to_numpy()
    pay_seq = df[['PAY_AMT6', 'PAY_AMT5', 'PAY_AMT4', 'PAY_AMT3', 'PAY_AMT2', 'PAY_AMT1']].to_numpy()
    delay_seq = df[['PAY_6', 'PAY_5', 'PAY_4', 'PAY_3', 'PAY_2', 'PAY_0']].to_numpy()
    
    # Slopes
    df['BILL_AMT_SLOPE'] = np.dot(bill_seq, t_coeffs) / 17.5
    df['PAY_AMT_SLOPE'] = np.dot(pay_seq, t_coeffs) / 17.5
    df['PAY_DELAY_SLOPE'] = np.dot(delay_seq, t_coeffs) / 17.5
    
    # Forecasts for October
    df['BILL_AMT_PRED_OCT'] = bill_seq.mean(axis=1) + 3.5 * df['BILL_AMT_SLOPE']
    df['PAY_AMT_PRED_OCT'] = pay_seq.mean(axis=1) + 3.5 * df['PAY_AMT_SLOPE']
    df['PAY_DELAY_PRED_OCT'] = delay_seq.mean(axis=1) + 3.5 * df['PAY_DELAY_SLOPE']
    
    # 7. First Differences (Month-over-month changes from August to September)
    df['BILL_AMT_DIFF1'] = df['BILL_AMT1'] - df['BILL_AMT2']
    df['PAY_AMT_DIFF1'] = df['PAY_AMT1'] - df['PAY_AMT2']
    df['PAY_DELAY_DIFF1'] = df['PAY_0'] - df['PAY_2']


    # Train a Logistic Regression baseline; report Precision, Recall, F1, and AUC-ROC.
    X = df.drop(columns=['ID', 'default.payment.next.month'])
    y = df['default.payment.next.month']


    
    from sklearn.pipeline import Pipeline
    from xgboost import XGBClassifier
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    log_reg = LogisticRegression(class_weight='balanced', random_state=42)
    xgb_clf = XGBClassifier(scale_pos_weight=3.5, random_state=42)
    models = {
        "LogisticRegression": Pipeline([("model", log_reg)]),
        "XGClassifier": Pipeline([("model", xgb_clf)]),
    }


    # 5-fold stratified CV (AUC-ROC)
    from sklearn.model_selection import StratifiedKFold, cross_val_score
    from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score
    
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_results = []
    
    for name, pipe in models.items():
        scores = cross_val_score(pipe, X_train, y_train, cv=cv, scoring="roc_auc", n_jobs=-1)
        cv_results.append((name, scores.mean(), scores.std()))
        print(f"{name} CV AUC-ROC: {scores.mean():.4f} ± {scores.std():.4f}")
    
    cv_df = pd.DataFrame(cv_results, columns=["Model", "CV_AUC_Mean", "CV_AUC_Std"]).sort_values("CV_AUC_Mean", ascending=False)
    display(cv_df)
    
    best_model_name = cv_df.iloc[0]["Model"]
    best_pipe = models[best_model_name]
    best_pipe.fit(X_train, y_train)
    
    # Evaluate both models on holdout test set
    eval_rows = []
    for name, pipe in models.items():
        pipe.fit(X_train, y_train)
        y_pred = pipe.predict(X_test)
        y_prob = pipe.predict_proba(X_test)[:, 1]
    
        eval_rows.append({
            "Model": name,
            "Precision": precision_score(y_test, y_pred),
            "Recall": recall_score(y_test, y_pred),
            "F1": f1_score(y_test, y_pred),
            "AUC_ROC": roc_auc_score(y_test, y_prob),
        })





    # Top 5 features from the best model (XGBoost) based on feature importance.
    if best_model_name == "XGClassifier":
        xgb_model = best_pipe.named_steps["model"]
        feature_importances = pd.Series(xgb_model.feature_importances_, index=X.columns)
        top_features = feature_importances.sort_values(ascending=False).head(5)
        print("Top 5 features from XGBoost based on feature importance:")
        print(top_features)

    from sklearn.metrics import roc_curve, ConfusionMatrixDisplay
    
    best_model_name = cv_df.iloc[0]["Model"]
    best_pipe = models[best_model_name]
    
    
    y_pred_best = best_pipe.predict(X_test)
    y_prob_best = best_pipe.predict_proba(X_test)[:, 1]
    
    # ROC
    fpr, tpr, _ = roc_curve(y_test, y_prob_best)
    plt.figure(figsize=(8, 6))
    plt.plot(fpr, tpr, label=f"{best_model_name} (AUC={roc_auc_score(y_test, y_prob_best):.3f})", lw=2)
    plt.plot([0, 1], [0, 1], "--", color="gray")
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("ROC Curve - Final Model")
    plt.legend()
    plt.tight_layout()
    plt.show()
    
    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred_best)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=["No Default", "Default"])
    disp.plot(cmap="Blues", values_format="d")
    plt.title("Confusion Matrix - Final Model")
    plt.tight_layout()
    plt.show()

    import joblib

    joblib.dump(best_pipe, "backend/model/model.pkl")
    print("Model saved as model.pkl")