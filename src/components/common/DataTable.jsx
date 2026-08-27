import React, { useState } from 'react';

export default function DataTable({ 
  headers = [], 
  data = [], 
  searchPlaceholder = 'Filter items...',
  onRowClick
}) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter based on search term
  const filteredData = data.filter((row) => {
    return Object.values(row).some((val) => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Search Input bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input"
          style={{ maxWidth: '280px', fontSize: '0.85rem' }}
        />
      </div>

      {/* Table Container */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>{h.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, i) => (
                <tr 
                  key={i} 
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {headers.map((h, j) => {
                    const value = row[h.key];
                    // Special styling for status badges
                    if (h.key === 'status') {
                      const badgeClass = 
                        value === 'Active' || value === 'Optimal' ? 'badge-success' : 
                        value === 'Pending' || value === 'Checking' ? 'badge-warning' : 
                        'badge-danger';
                      return (
                        <td key={j}>
                          <span className={`badge ${badgeClass}`}>{value}</span>
                        </td>
                      );
                    }
                    return <td key={j}>{value}</td>;
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No records matching the search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
