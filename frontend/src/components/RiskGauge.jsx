import React from 'react';

export default function RiskGauge({ predictionResult, loading }) {
  if (loading) return <p>Calculating Default Risk...</p>;
  if (!predictionResult) return <p>Awaiting risk assessment. Fill the form and submit.</p>;

  const prob = predictionResult.default_probability;
  const riskClass = predictionResult.risk_classification;

  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', textAlign: 'center', marginTop: '10px' }}>
      <h3>Default Probability: {(prob * 100).toFixed(1)}%</h3>
      <p style={{ fontWeight: 'bold' }}>Risk Classification: {riskClass}</p>
    </div>
  );
}
