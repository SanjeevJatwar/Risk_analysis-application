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
      const response = await fetch('http://127.0.0.1:8000/predict', {
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
    <div className="fade-in">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <h1 style={{ margin: 0, textAlign: 'left' }}>Aegis Risk</h1>
              <p style={{margin: 0, textAlign: 'left' }}>Credit Default Machine Learning System</p>
            </div>
          </div>

          <div className="tabs-container">
            <button className={`tab-btn ${activeTab === 'evaluator' ? 'active' : ''}`} onClick={() => setActiveTab('evaluator')}>
              Evaluator Dashboard
            </button>
            <button className={`tab-btn ${activeTab === 'technical' ? 'active' : ''}`} onClick={() => setActiveTab('technical')}>
              Technical Things
            </button>
          </div>
        </header>
        {activeTab === 'evaluator' ? (
          <div className="dashboard-grid">
            <ClientForm 
              formData={formData} 
              handleInputChange={handleInputChange} 
              loadProfile={loadProfile} 
              handlePredict={handlePredict} 
              loading={loading} 
              MONTH_LABELS={MONTH_LABELS} 
              profiles={PROFILES} 
            />
            <div className="flex-col gap-lg">
              <RiskGauge predictionResult={predictionResult} loading={loading} />
              {predictionResult && <RiskMetrics predictionResult={predictionResult} />}
            </div>
          </div>
          ) : (
          <div className="glass-panel p-lg">
            <h2 className="text-xl font-bold mb-md text-primary" style={{ textAlign: 'left' }}>Model Architecture Deep Dive</h2>
            <p className="text-text-secondary mb-sm" style={{ textAlign: 'left' }}>
              This dashboard demonstrates a real-world application of machine learning in risk assessment. Below is the technical architecture and model behavior.
            </p>
            <hr className="border-border-glass mb-md" />

            <div className="mb-md">
              <h3 className="text-lg font-semibold mb-sm text-accent-emerald" style={{ textAlign: 'left' }}>Model Overview</h3>
              <p className="text-text-secondary mb-xs" style={{ textAlign: 'left' }}>
                The system uses a Logistic Regression model trained on the UCI Credit Card Default dataset. It predicts the probability of a customer defaulting on their credit card bill.
              </p>
              <ul className="text-sm text-text-muted list-disc pl-5" style={{ textAlign: 'left' }}>
                <li><strong>Algorithm:</strong> Logistic Regression</li>
                <li><strong>Dataset:</strong> 30,000 credit card holders</li>
                <li><strong>Objective:</strong> Predict default in the next billing cycle</li>
              </ul>
            </div>

            <div className="mb-md">
              <h3 className="text-lg font-semibold mb-sm text-accent-amber" style={{ textAlign: 'left' }}>Feature Importance</h3>
              <p className="text-text-secondary mb-xs" style={{ textAlign: 'left' }}>
                The model relies on specific features to make predictions. These are the most influential factors:
              </p>
              <div className="grid grid-cols-1 gap-2" style={{ textAlign: 'left' }}>
                <div className="bg-bg-secondary p-2 rounded border border-border-glass">
                  <p className="text-sm text-text-primary"><strong>PAY_0 (Overdue Status):</strong> The most critical factor. Shows the status of the previous month's bill.</p>
                </div>
                <div className="bg-bg-secondary p-2 rounded border border-border-glass">
                  <p className="text-sm text-text-primary"><strong>BILL_AMT1-6 (Bill Amounts):</strong> Recent bill amounts significantly impact risk assessment.</p>
                </div>
                <div className="bg-bg-secondary p-2 rounded border border-border-glass">
                  <p className="text-sm text-text-primary"><strong>LIMIT_BAL (Credit Limit):</strong> The total credit line available to the customer.</p>
                </div>
              </div>
            </div>

            <div className="mb-md">
              <h3 className="text-lg font-semibold mb-sm text-accent-rose" style={{ textAlign: 'left' }}>Performance Metrics</h3>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm text-text-muted">Accuracy</p>
                  <p className="text-xl text-text-primary">82%</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">F1 Score (Balanced)</p>
                  <p className="text-xl text-text-primary">72%</p>
                </div>
              </div>
            </div>

            <div className="text-center" style={{ textAlign: 'center' }}>
              <a href="https://www.kaggle.com/datasets/uciml/credit-card-customers-prediction" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                Explore Dataset on Kaggle
              </a>
            </div>
          </div>
        )}
    </div>
    </div >
  );
}

export default App;
