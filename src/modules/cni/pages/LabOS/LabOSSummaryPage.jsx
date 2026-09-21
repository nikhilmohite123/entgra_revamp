import React, { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';
import { LabOSSummaryTable } from './components/LabOSSummaryTable';
import { useLabOSSummary } from '../../hooks/useLabOS';
import cniStyles from '../../styles/cni-premium.module.css';

export function LabOSSummaryPage() {
  const [selectedCategory, setSelectedCategory] = useState(1);

  // Maps strictly to legacy get_summry_report s_categories values (1 to 4)
  const categoryNames = {
    1: 'Development Laminate',
    2: 'Production / Quality Issue',
    3: 'Alternate Material',
    4: 'RAW Material'
  };

  const { data, isLoading, isError } = useLabOSSummary(selectedCategory);

  const exportToExcel = () => {
    const tableId = "tblData";
    const worksheetName = "User Details"; // Legacy used "User Details" for the worksheet name

    const tableElement = document.getElementById(tableId);
    if (!tableElement) return;

    const uri = 'data:application/vnd.ms-excel;base64,';
    
    // Legacy Excel Base64 Template
    const template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>';
    
    const base64 = function(s) { 
      return window.btoa(unescape(encodeURIComponent(s)));
    };
    
    const format = function(s, c) { 
      return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; });
    };

    const ctx = {
      worksheet: worksheetName,
      table: tableElement.innerHTML
    };

    const link = document.createElement("a");
    link.href = uri + base64(format(template, ctx));
    link.download = `Summary_Report_${categoryNames[selectedCategory].replace(/ /g, '_')}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>Summary Report</h2>

        <button 
          onClick={exportToExcel}
          disabled={isLoading || isError || !data?.data || data.data.length === 0}
          className={cniStyles.btnPrimary} 
          style={{ 
            padding: '0.5rem 1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            opacity: (isLoading || isError || !data?.data || data.data.length === 0) ? 0.5 : 1,
            cursor: (isLoading || isError || !data?.data || data.data.length === 0) ? 'not-allowed' : 'pointer'
          }}
        >
          <Download size={18} />
          Export to Excel
        </button>
      </div>

      {/* Category Toggles */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1rem' }}>
        {Object.entries(categoryNames).map(([id, name]) => (
          <button 
            key={id}
            className={Number(id) === selectedCategory ? cniStyles.btnPrimary : cniStyles.btnSecondary}
            onClick={() => setSelectedCategory(Number(id))}
            style={{ whiteSpace: 'nowrap', borderRadius: '50px', padding: '0.5rem 1.2rem' }}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Summary Table */}
      <div className={cniStyles.dashboardCard} style={{ border: 'none', boxShadow: '0 8px 30px rgba(6, 43, 103, 0.08)' }}>
        <div 
          className={cniStyles.cardHeader} 
          style={{ 
            background: 'linear-gradient(135deg, var(--primary) 0%, #0a3a8a 100%)', 
            color: 'white', 
            borderRadius: '12px 12px 0 0',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            borderBottom: 'none'
          }}
        >
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={20} color="white" />
          </div>
          <h3 className={cniStyles.cardTitle} style={{ color: 'white', margin: 0, fontSize: '1.25rem' }}>{categoryNames[selectedCategory]}</h3>
        </div>
        
        <LabOSSummaryTable 
          data={data?.data} 
          isLoading={isLoading} 
          isError={isError} 
        />
        
      </div>

    </div>
  );
}
