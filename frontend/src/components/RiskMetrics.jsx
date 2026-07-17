import React from 'react';

export default function RiskMetrics({ predictionResult }) {
  if (!predictionResult) return null;
  
  const { metrics } = predictionResult;
  return (
    <div style={{ marginTop: '15px', border: '1px solid #ccc', padding: '15px', borderRadius: '5px', textAlign: 'left' }}>
      <h4 style={{ margin: '0 0 10px 0' }}>Engineered Features</h4>
      <p style={{ margin: '5px 0' }}><strong>Credit Utilization:</strong> {(metrics.avg_utilization_rate * 100).toFixed(1)}%</p>
      <p style={{ margin: '5px 0' }}><strong>Months Delinquent:</strong> {metrics.total_delay_months} / 6 months</p>
      <p style={{ margin: '5px 0' }}><strong>Payment-to-Bill Ratio:</strong> {(metrics.avg_pay_ratio * 100).toFixed(1)}%</p>
      <p style={{ margin: '5px 0' }}><strong>EWMA Payment Delay:</strong> {metrics.pay_delay_ewma.toFixed(2)}</p>
    </div>
  );
}
