import React from 'react';

export default function RiskMetrics({ predictionResult }) {
  if (!predictionResult) return null;

  return (
    <div className="glass-panel fade-in" style={{ padding: '20px' }}>
      <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', margin: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-blue)" strokeWidth="2.5">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
        Real-time Engineered Features (Talking Points)
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avg. Credit Utilization</span>
          <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
            {(predictionResult.metrics.avg_utilization_rate * 100).toFixed(1)}%
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Months in Delinquency (&gt;0)</span>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: predictionResult.metrics.total_delay_months > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
            {predictionResult.metrics.total_delay_months} / 6 months
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Payment-to-Bill Ratio</span>
          <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
            {(predictionResult.metrics.avg_pay_ratio * 100).toFixed(1)}%
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Recent Repayment Delay (EWMA)</span>
          <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
            {predictionResult.metrics.pay_delay_ewma.toFixed(2)}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Debt Escalation (3M &gt; 6M Avg)</span>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: '600',
            color: predictionResult.metrics.bill_trend_up ? 'var(--accent-rose)' : 'var(--accent-emerald)'
          }}>
            {predictionResult.metrics.bill_trend_up ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
    </div>
  );
}
