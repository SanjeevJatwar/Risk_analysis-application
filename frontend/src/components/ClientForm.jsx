import React from 'react';

export default function ClientForm({
  formData,
  handleInputChange,
  loadProfile,
  handlePredict,
  loading,
  MONTH_LABELS,
  profiles
}) {
  return (
    <section className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-blue)" strokeWidth="2.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Client Information Profile
        </h2>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={() => loadProfile(profiles.LOW)} className="btn btn-secondary btn-emerald" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            Load Low-Risk
          </button>
          <button type="button" onClick={() => loadProfile(profiles.MEDIUM)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'rgba(245,158,11,0.2)', color: '#fde68a' }}>
            Load Med-Risk
          </button>
          <button type="button" onClick={() => loadProfile(profiles.HIGH)} className="btn btn-secondary btn-rose" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            Load High-Risk
          </button>
        </div>
      </div>

      <form onSubmit={handlePredict} className="flex-col gap-md">
        {/* Section A: Demographics */}
        <div>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', textAlign: 'left' }}>
            Demographics & Credit limit
          </h3>
          <div className="grid-cols-3">
            <div>
              <label className="form-label">Credit Limit (NTD)</label>
              <input 
                type="number" 
                value={formData.LIMIT_BAL}
                onChange={(e) => handleInputChange('LIMIT_BAL', e.target.value)}
                className="form-input" 
                required 
              />
            </div>
            <div>
              <label className="form-label">Age</label>
              <input 
                type="number" 
                value={formData.AGE}
                onChange={(e) => handleInputChange('AGE', e.target.value)}
                className="form-input" 
                required 
              />
            </div>
            <div>
              <label className="form-label">Gender</label>
              <select 
                value={formData.SEX} 
                onChange={(e) => handleInputChange('SEX', e.target.value)}
                className="form-select"
              >
                <option value="1">Male</option>
                <option value="2">Female</option>
              </select>
            </div>
          </div>

          <div className="grid-cols-2 mt-md">
            <div>
              <label className="form-label">Education</label>
              <select 
                value={formData.EDUCATION} 
                onChange={(e) => handleInputChange('EDUCATION', e.target.value)}
                className="form-select"
              >
                <option value="1">Graduate School</option>
                <option value="2">University</option>
                <option value="3">High School</option>
                <option value="4">Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Marital Status</label>
              <select 
                value={formData.MARRIAGE} 
                onChange={(e) => handleInputChange('MARRIAGE', e.target.value)}
                className="form-select"
              >
                <option value="1">Married</option>
                <option value="2">Single</option>
                <option value="3">Other</option>
              </select>
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderBottom: '1px solid var(--border-glass)', margin: '8px 0' }} />

        {/* Section B: Repayment Delays */}
        <div>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', textAlign: 'left' }}>
            Repayment Delays (Sept - April 2005)
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px', textAlign: 'left' }}>
            -1 = Paid full, 0 = Revolving credit, 1-6 = Months of payment delay
          </p>
          <div className="grid-cols-3" style={{ gap: '10px' }}>
            {MONTH_LABELS.map((m, idx) => (
              <div key={m.key}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>{m.label}</label>
                <select
                  value={formData[`PAY_${idx === 0 ? 0 : idx + 1}`]}
                  onChange={(e) => handleInputChange(`PAY_${idx === 0 ? 0 : idx + 1}`, e.target.value)}
                  className="form-select"
                  style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                >
                  <option value="-2">No consumption (-2)</option>
                  <option value="-1">Paid in full (-1)</option>
                  <option value="0">Revolving (0)</option>
                  <option value="1">1 month late</option>
                  <option value="2">2 months late</option>
                  <option value="3">3 months late</option>
                  <option value="4">4+ months late</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <hr style={{ border: 'none', borderBottom: '1px solid var(--border-glass)', margin: '8px 0' }} />

        {/* Section C: Bill Statements & Previous Payments */}
        <div>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', textAlign: 'left' }}>
            Bill Statements vs Payments
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {MONTH_LABELS.map((m, idx) => {
              const billKey = `BILL_AMT${idx + 1}`;
              const payKey = `PAY_AMT${idx + 1}`;
              return (
                <div key={m.key} className="grid-cols-3" style={{ alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'left', fontWeight: '500' }}>
                    {m.label.split(' ')[0]} {m.label.includes('Recent') ? '(Sept)' : ''}
                  </span>
                  <div>
                    <input
                      type="number"
                      placeholder="Bill statement"
                      value={formData[billKey]}
                      onChange={(e) => handleInputChange(billKey, e.target.value)}
                      className="form-input"
                      style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Amount paid"
                      value={formData[payKey]}
                      onChange={(e) => handleInputChange(payKey, e.target.value)}
                      className="form-input"
                      style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px' }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'logo-spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
                  <path d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor"></path>
                </svg>
                Calculating Default Risk...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                Assess Credit Default Risk
              </span>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
