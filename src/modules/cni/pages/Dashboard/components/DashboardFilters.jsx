import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import styles from '../../../styles/cni-premium.module.css';

export function DashboardFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    s_type_doc: 'REG',
    type: [],
    optics: [],
    moistture: '', 
    oxygenBarr: '', 
    sustCert: []
  });

  const handleSingleToggle = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: prev[name] === value ? '' : value
    }));
  };

  const handleArrayToggle = (name, value) => {
    setFilters(prev => {
      const arr = prev[name];
      if (arr.includes(value)) {
        return { ...prev, [name]: arr.filter(v => v !== value) };
      } else {
        return { ...prev, [name]: [...arr, value] };
      }
    });
  };

  useEffect(() => {
    const hasFilter = filters.type.length > 0 || filters.optics.length > 0 || 
                      filters.moistture !== '' || filters.oxygenBarr !== '' || 
                      filters.sustCert.length > 0;
    
    if (hasFilter) {
      onFilterChange(filters);
    } else {
      onFilterChange(null);
    }
  }, [filters, onFilterChange]);

  return (
    <div className={styles.surface} style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <Filter size={18} color="var(--primary)" />
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--primary)' }}>Filters</h3>
      </div>
      
      <div className={styles.gridCards} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
        
        {/* Category */}
        <div>
          <label className={styles.formLabel} style={{ color: 'var(--text-secondary)' }}>Category</label>
          <select 
            className={styles.formControl}
            value={filters.s_type_doc} 
            onChange={e => setFilters(p => ({ ...p, s_type_doc: e.target.value }))}
          >
            <option value="REG">India Commercial Laminates</option>
          </select>
        </div>

        {/* Type */}
        <div>
          <label className={styles.formLabel} style={{ color: 'var(--text-secondary)' }}>Type</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {['ABL', 'PBL'].map(opt => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={filters.type.includes(opt)} onChange={() => handleArrayToggle('type', opt)} />
                {opt}
              </label>
            ))}
          </div>
        </div>

        {/* Appearance */}
        <div>
          <label className={styles.formLabel} style={{ color: 'var(--text-secondary)' }}>Appearance</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {['White', 'BSNPE', 'BLACK', 'TRANSPARENT', 'METTALIC'].map(opt => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={filters.optics.includes(opt)} onChange={() => handleArrayToggle('optics', opt)} />
                <span style={{ textTransform: 'capitalize' }}>{opt.toLowerCase()}</span>
              </label>
            ))}
          </div>
        </div>

        {/* H2O barrier */}
        <div>
          <label className={styles.formLabel} style={{ color: 'var(--text-secondary)' }}>H₂O barrier</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={filters.moistture === '<=_0.05'} onChange={() => handleSingleToggle('moistture', '<=_0.05')} />
              Highest (&lt;0.05)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={filters.moistture === '<=_1.00'} onChange={() => handleSingleToggle('moistture', '<=_1.00')} />
              High (&lt;1.00)
            </label>
          </div>
        </div>

        {/* O2 barrier */}
        <div>
          <label className={styles.formLabel} style={{ color: 'var(--text-secondary)' }}>O₂ barrier</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={filters.oxygenBarr === '<=_1.5'} onChange={() => handleSingleToggle('oxygenBarr', '<=_1.5')} />
              High (&lt;1.5)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={filters.oxygenBarr === '<=_100'} onChange={() => handleSingleToggle('oxygenBarr', '<=_100')} />
              Medium (&lt;100)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={filters.oxygenBarr === '>=_100'} onChange={() => handleSingleToggle('oxygenBarr', '>=_100')} />
              Low (&gt;100)
            </label>
          </div>
        </div>

        {/* Sustainable Cert */}
        <div>
          <label className={styles.formLabel} style={{ color: 'var(--text-secondary)' }}>Sustainable Cert</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={filters.sustCert.includes('yes')} onChange={() => handleArrayToggle('sustCert', 'yes')} />
              Yes
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={filters.sustCert.includes('no')} onChange={() => handleArrayToggle('sustCert', 'no')} />
              No
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
