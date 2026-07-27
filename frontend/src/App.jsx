import React, { useState } from 'react';
import ClientForm from './components/ClientForm';
import RiskGauge from './components/RiskGauge';
import RiskMetrics from './components/RiskMetrics';

const LOW_RISK_PROFILE = {
  LIMIT_BAL: 250000,
  SEX: 2,
  EDUCATION: 1,
  MARRIAGE: 2,
  AGE: 31,
  PAY_0: 0, PAY_2: 0, PAY_3: 0, PAY_4: 0, PAY_5: 0, PAY_6: 0,
  BILL_AMT1: 15200, BILL_AMT2: 14800, BILL_AMT3: 15000, BILL_AMT4: 12500, BILL_AMT5: 11000, BILL_AMT6: 9500,
  PAY_AMT1: 15200, PAY_AMT2: 15000, PAY_AMT3: 12500, PAY_AMT4: 11000, PAY_AMT5: 9500, PAY_AMT6: 9000
};

const MEDIUM_RISK_PROFILE = {
  LIMIT_BAL: 80000,
  SEX: 1,
  EDUCATION: 3,
  MARRIAGE: 2,
  AGE: 34,
  PAY_0: 1, PAY_2: 0, PAY_3: 0, PAY_4: 0, PAY_5: 0, PAY_6: 0,
  BILL_AMT1: 45000, BILL_AMT2: 43000, BILL_AMT3: 12000, BILL_AMT4: 15000, BILL_AMT5: 14000, BILL_AMT6: 13500,
  PAY_AMT1: 1500, PAY_AMT2: 1500, PAY_AMT3: 12000, PAY_AMT4: 1000, PAY_AMT5: 1000, PAY_AMT6: 1000
};

const HIGH_RISK_PROFILE = {
  LIMIT_BAL: 30000,
  SEX: 1,
  EDUCATION: 2,
  MARRIAGE: 1,
  AGE: 45,
  PAY_0: 2, PAY_2: 2, PAY_3: 2, PAY_4: 2, PAY_5: 2, PAY_6: 2,
  BILL_AMT1: 29000, BILL_AMT2: 28500, BILL_AMT3: 29000, BILL_AMT4: 29000, BILL_AMT5: 28000, BILL_AMT6: 27500,
  PAY_AMT1: 0, PAY_AMT2: 500, PAY_AMT3: 0, PAY_AMT4: 1000, PAY_AMT5: 0, PAY_AMT6: 500
};

const MONTH_LABELS = [
  { key: '1', label: 'Sept 2005 (Recent)' },
  { key: '2', label: 'Aug 2005' },
  { key: '3', label: 'July 2005' },
  { key: '4', label: 'June 2005' },
  { key: '5', label: 'May 2005' },
  { key: '6', label: 'April 2005' }
];

const PROFILES = {
  LOW: LOW_RISK_PROFILE,
  MEDIUM: MEDIUM_RISK_PROFILE,
  HIGH: HIGH_RISK_PROFILE
};

function App() {
  const [formData, setFormData] = useState({ ...LOW_RISK_PROFILE });
  const [activeTab, setActiveTab] = useState('evaluator');
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: parseFloat(val) || 0 }));
  };

  const loadProfile = (profile) => {
    setFormData({ ...profile });
    setPredictionResult(null);
    setError(null);
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {};
    const numericKeys = [
      'LIMIT_BAL', 'BILL_AMT1', 'BILL_AMT2', 'BILL_AMT3',
      'BILL_AMT4', 'BILL_AMT5', 'BILL_AMT6',
      'PAY_AMT1', 'PAY_AMT2', 'PAY_AMT3', 'PAY_AMT4', 'PAY_AMT5', 'PAY_AMT6'
    ];
    for (const key in formData) {
      payload[key] = numericKeys.includes(key) ? parseFloat(formData[key]) : parseInt(formData[key]);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`Server returned code ${response.status}`);
      const result = await response.json();
      setPredictionResult(result);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to connect to prediction server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Default Risk Assessment</h2>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#888' }}>XGBoost Classifier Prediction Pipeline</p>
        </div>
        <div>
          <button onClick={() => setActiveTab('evaluator')} style={{ marginRight: '10px', padding: '6px 12px', fontWeight: activeTab === 'evaluator' ? 'bold' : 'normal' }}>Evaluator</button>
          <button onClick={() => setActiveTab('technical')} style={{ padding: '6px 12px', fontWeight: activeTab === 'technical' ? 'bold' : 'normal' }}>Model Info</button>
        </div>
      </header>

      {error && (
        <div style={{ color: 'red', border: '1px solid red', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {activeTab === 'evaluator' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
          <ClientForm
            formData={formData}
            handleInputChange={handleInputChange}
            loadProfile={loadProfile}
            handlePredict={handlePredict}
            loading={loading}
            MONTH_LABELS={MONTH_LABELS}
            profiles={PROFILES}
          />
          <div>
            <RiskGauge predictionResult={predictionResult} loading={loading} />
            <RiskMetrics predictionResult={predictionResult} />
          </div>
        </div>
      ) : (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', textAlign: 'left' }}>
          <h3>Model Architecture & Performance</h3>
          <p>This application implements an end-to-end machine learning pipeline deploying a supervised classifier for default risk estimation.</p>

          <h4>1. Model Pipeline Specs</h4>
          <ul>
            <li><strong>Model Algorithm:</strong> XGBoost Classifier</li>
            <li><strong>Performance:</strong> Evaluated using Stratified 5-Fold Cross-Validation, achieving a <strong>0.7619 AUC-ROC</strong>.</li>
            <li><strong>Training Dataset:</strong> UCI Credit Card Default database (30,000 clients).</li>
          </ul>

          <h4>2. Feature Engineering Logic</h4>
          <p>Prior to inference, the server transforms the 23 raw parameters into 48 features, including:</p>
          <ul>
            <li><strong>EWMA metrics:</strong> Exponentially Weighted Moving Averages to prioritize recent billing and repayment trends.</li>
            <li><strong>Least Squares Trend:</strong> Computes the linear delay/debt trend slope to forecast next month's indicators.</li>
            <li><strong>Utilization & Payment Ratios:</strong> Calculates revolving debt exposure and repayment consistency relative to bill size.</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
