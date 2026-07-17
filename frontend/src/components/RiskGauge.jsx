import React from 'react';

const getRiskColor = (prob) => {
  if (prob < 0.25) return '#10b981'; // Green
  if (prob < 0.55) return '#f59e0b'; // Amber
  return '#f43f5e'; // Rose
};

const getRiskGlow = (prob) => {
  if (prob < 0.25) return 'rgba(16, 185, 129, 0.2)';
  if (prob < 0.55) return 'rgba(245, 158, 11, 0.2)';
  return 'rgba(244, 63, 94, 0.2)';
};

export default function RiskGauge({ predictionResult, loading }) {
  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', minHeight: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ padding: '40px 20px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '4px solid rgba(255,255,255,0.06)',
            borderTopColor: '#3b82f6',
            animation: 'logo-spin 1s linear infinite',
            margin: '0 auto 20px auto'
          }}></div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Extracting features & evaluating...</h3>
        </div>
      </div>
    );
  }

  if (!predictionResult) {
    return (
      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', minHeight: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ padding: '40px 20px', color: 'var(--text-muted)' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: 0.4 }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>Awaiting Risk Assessment</h3>
        </div>
      </div>
    );
  }

  const pVal = predictionResult.default_probability;
  const strokeRadius = 45;
  const strokeCircumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = strokeCircumference - (pVal * strokeCircumference);

  return (
    <div className="glass-panel fade-in" style={{ padding: '24px', textAlign: 'center', minHeight: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>Assessment Outcome</h3>
      
      {/* SVG Gauge Chart */}
      <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto 24px auto' }}>
        <svg width="180" height="180" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={strokeRadius}
            fill="transparent"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={strokeRadius}
            fill="transparent"
            stroke={getRiskColor(pVal)}
            strokeWidth="8"
            strokeDasharray={strokeCircumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="circle-progress"
            transform="rotate(-90 50 50)"
            style={{
              filter: `drop-shadow(0 0 6px ${getRiskGlow(pVal)})`
            }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color: 'white' }}>
            {Math.round(pVal * 100)}%
          </span>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: getRiskColor(pVal)
          }}>
            Risk Score
          </span>
        </div>
      </div>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 18px',
        borderRadius: '30px',
        background: `${getRiskGlow(pVal)}`,
        border: `1px solid ${getRiskColor(pVal)}30`,
        marginBottom: '24px'
      }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getRiskColor(pVal) }}></div>
        <span style={{
          fontWeight: 700,
          fontSize: '0.9rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'white'
        }}>
          {predictionResult.risk_classification} Risk Profile
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '340px', margin: '0 auto' }}>
        The XGBoost classifier predicts a <strong>{(pVal * 100).toFixed(1)}% probability</strong> that this client will default on their credit payment next month.
      </p>
    </div>
  );
}
