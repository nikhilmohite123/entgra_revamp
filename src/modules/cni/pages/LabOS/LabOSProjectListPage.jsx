import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { LabOSTables } from './components/LabOSTables';
import { useLabOSGlobalSearch } from '../../hooks/useLabOS';
import cniStyles from '../../styles/cni-premium.module.css';

export function LabOSProjectListPage() {
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');

  const categoryNames = {
    1: 'Development Laminate',
    2: 'Production / Quality Issue',
    3: 'Alternate Material',
    4: 'RM Material',
    5: 'Benchmark'
  };

  const { 
    data: searchResults, 
    isLoading: isSearchLoading,
    isError: isSearchError,
    refetch: refetchSearch
  } = useLabOSGlobalSearch(activeSearchTerm);

  const handleSearch = () => {
    if (searchInput.trim()) {
      setActiveSearchTerm(searchInput.trim());
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveSearchTerm('');
  };

  const isSearchActive = !!activeSearchTerm;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>Project List</h2>

        {/* Global Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
          <Search size={18} color="var(--text-secondary)" style={{ marginLeft: '0.5rem' }} />
          <input 
            type="text" 
            placeholder="Global Search..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            style={{ border: 'none', background: 'transparent', outline: 'none', padding: '0.5rem', minWidth: '250px', color: 'var(--text-primary)' }}
          />
          {isSearchActive && (
            <button type="button" onClick={handleClearSearch} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0 0.5rem', fontWeight: 600 }}>
              Clear
            </button>
          )}
          <button 
            type="button"
            onClick={handleSearch}
            className={cniStyles.btnPrimary} 
            style={{ padding: '0.5rem 1.5rem' }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Category Toggles */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1rem' }}>
        {Object.entries(categoryNames).map(([id, name]) => (
          <button 
            key={id}
            className={Number(id) === selectedCategory ? cniStyles.btnPrimary : cniStyles.btnSecondary}
            onClick={() => {
              setSelectedCategory(Number(id));
              // Note: changing category shouldn't implicitly clear search in the legacy logic, 
              // but it typically updates the 3 other tables. The search results overlay Laminate List.
            }}
            style={{ whiteSpace: 'nowrap', borderRadius: '50px', padding: '0.5rem 1.2rem' }}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Tables Section */}
      <LabOSTables 
        category={selectedCategory} 
        categoryName={categoryNames[selectedCategory]} 
        searchData={searchResults?.data}
        isSearchActive={isSearchActive}
        isSearchLoading={isSearchLoading}
        isSearchError={isSearchError}
      />

    </div>
  );
}
