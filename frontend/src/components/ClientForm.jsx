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
    <form onSubmit={handlePredict} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
        <h3>Client Profile</h3>
        <div>
          <button type="button" onClick={() => loadProfile(profiles.LOW)}>Low Risk</button>{' '}
          <button type="button" onClick={() => loadProfile(profiles.MEDIUM)}>Med Risk</button>{' '}
          <button type="button" onClick={() => loadProfile(profiles.HIGH)}>High Risk</button>
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Credit Limit: </label>
        <input type="number" value={formData.LIMIT_BAL} onChange={(e) => handleInputChange('LIMIT_BAL', e.target.value)} required style={{ marginRight: '15px' }} />
        
        <label>Age: </label>
        <input type="number" value={formData.AGE} onChange={(e) => handleInputChange('AGE', e.target.value)} required />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Gender: </label>
        <select value={formData.SEX} onChange={(e) => handleInputChange('SEX', e.target.value)} style={{ marginRight: '15px' }}>
          <option value="1">Male</option>
          <option value="2">Female</option>
        </select>

        <label>Education: </label>
        <select value={formData.EDUCATION} onChange={(e) => handleInputChange('EDUCATION', e.target.value)} style={{ marginRight: '15px' }}>
          <option value="1">Grad School</option>
          <option value="2">University</option>
          <option value="3">High School</option>
          <option value="4">Other</option>
        </select>

        <label>Marriage: </label>
        <select value={formData.MARRIAGE} onChange={(e) => handleInputChange('MARRIAGE', e.target.value)}>
          <option value="1">Married</option>
          <option value="2">Single</option>
          <option value="3">Other</option>
        </select>
      </div>

      <hr style={{ margin: '15px 0', borderColor: '#eee' }} />

      <h4>Repayment Delays</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '15px' }}>
        {MONTH_LABELS.map((m, idx) => (
          <div key={m.key}>
            <label style={{ fontSize: '0.8rem', display: 'block' }}>{m.label.split(' ')[0]}: </label>
            <select
              value={formData[`PAY_${idx === 0 ? 0 : idx + 1}`]}
              onChange={(e) => handleInputChange(`PAY_${idx === 0 ? 0 : idx + 1}`, e.target.value)}
            >
              <option value="-2">No consumption</option>
              <option value="-1">Paid in full</option>
              <option value="0">Revolving</option>
              <option value="1">1 mo late</option>
              <option value="2">2 mo late</option>
              <option value="3">3+ mo late</option>
            </select>
          </div>
        ))}
      </div>

      <hr style={{ margin: '15px 0', borderColor: '#eee' }} />

      <h4>Bills vs Previous Payments</h4>
      {MONTH_LABELS.map((m, idx) => {
        const billKey = `BILL_AMT${idx + 1}`;
        const payKey = `PAY_AMT${idx + 1}`;
        return (
          <div key={m.key} style={{ display: 'flex', gap: '10px', marginBottom: '5px', alignItems: 'center' }}>
            <span style={{ minWidth: '80px', fontSize: '0.85rem' }}>{m.label.split(' ')[0]}:</span>
            <input
              type="number"
              placeholder="Bill Amt"
              value={formData[billKey]}
              onChange={(e) => handleInputChange(billKey, e.target.value)}
              style={{ width: '100px' }}
            />
            <input
              type="number"
              placeholder="Amt Paid"
              value={formData[payKey]}
              onChange={(e) => handleInputChange(payKey, e.target.value)}
              style={{ width: '100px' }}
            />
          </div>
        );
      })}

      <button type="submit" disabled={loading} style={{ marginTop: '15px', width: '100%', padding: '10px', fontWeight: 'bold' }}>
        {loading ? 'Evaluating...' : 'Assess Credit Default Risk'}
      </button>
    </form>
  );
}
