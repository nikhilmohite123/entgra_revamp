import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, Upload, Plus, Trash2, Edit2, Check, X, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import tableStyles from '../styles/WccTables.module.css';
import {
  INITIAL_HO_ROW,
  formatAmount,
  parseIndianNumber,
} from '../constants/wccConstants';
import { useWcc } from '../context/useWcc';

export default function WccAssetManagementTable({
  items = [],
  setItems,
  cwipTotalSum = 0,
  isVerified = false,
  setIsVerified,
  isEditable = true,
}) {
  const { showToast } = useWcc();
  const [newRow, setNewRow] = useState(INITIAL_HO_ROW);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editRowData, setEditRowData] = useState(null);

  const handleNewInputChange = (field, value) => {
    if (field === 'residualValue') {
      const num = Number(value);
      if (num > 100) value = '100';
    }
    setNewRow((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddRow = () => {
    if (
      !newRow.assetNumber ||
      !newRow.assetSubNumber ||
      !newRow.assetsDescription ||
      !newRow.assetClass ||
      !newRow.capitalizationDate ||
      !newRow.postingDocNumber ||
      newRow.residualValue === '' ||
      newRow.usefulLife === ''
    ) {
      showToast('Please fill all required asset details', 'error');
      return;
    }

    const rowToAdd = {
      ...newRow,
      totalAssetValue: Number(newRow.totalAssetValue) || 0,
      residualValue: Number(newRow.residualValue) || 0,
      usefulLife: Number(newRow.usefulLife) || 0,
    };

    setItems([...items, rowToAdd]);
    setNewRow(INITIAL_HO_ROW);
    setIsVerified(false); // require re-verification when items change
    showToast('Asset item added', 'info');
  };

  const handleDeleteRow = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    setIsVerified(false);
  };

  const handleStartEdit = (index) => {
    setEditingIndex(index);
    setEditRowData({ ...items[index] });
  };

  const handleEditChange = (field, value) => {
    if (field === 'residualValue') {
      const num = Number(value);
      if (num > 100) value = '100';
    }
    setEditRowData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = (index) => {
    const updated = [...items];
    updated[index] = {
      ...editRowData,
      totalAssetValue: parseIndianNumber(editRowData.totalAssetValue),
      residualValue: parseIndianNumber(editRowData.residualValue),
      usefulLife: parseIndianNumber(editRowData.usefulLife),
    };
    setItems(updated);
    setEditingIndex(null);
    setEditRowData(null);
    setIsVerified(false);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditRowData(null);
  };

  // Excel Upload
  const handleExcelUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const parsedRows = jsonData.map((row) => ({
          assetNumber: row['Asset Number'] ?? '',
          assetSubNumber: row['Asset Sub Number'] ?? '',
          assetsDescription: row['Assets Description'] ?? '',
          assetClass: row['Asset Class'] ?? '',
          postingDocNumber: row['Posting Document Number'] ?? '',
          capitalizationDate: row['Date of Capitalization'] ?? '',
          totalAssetValue: parseIndianNumber(row['Total Asset Value']),
          residualValue: parseIndianNumber(row['Residual Value']),
          usefulLife: parseIndianNumber(row['Useful Life']),
        }));

        setItems((prev) => [...prev, ...parsedRows]);
        setIsVerified(false);
        showToast(`Imported ${parsedRows.length} asset records!`, 'success');
      } catch (err) {
        console.error('Error importing HO assets:', err);
        showToast('Failed to parse Excel file.', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // Export Table
  const handleExportExcel = () => {
    if (items.length === 0) {
      showToast('No asset records to export', 'error');
      return;
    }

    const exportData = items.map((item) => ({
      'Asset Number': item.assetNumber,
      'Asset Sub Number': item.assetSubNumber,
      'Assets Description': item.assetsDescription,
      'Asset Class': item.assetClass,
      'Posting Document Number': item.postingDocNumber,
      'Date of Capitalization': item.capitalizationDate,
      'Total Asset Value': item.totalAssetValue,
      'Residual Value': item.residualValue,
      'Useful Life': item.usefulLife,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asset Management');
    XLSX.writeFile(workbook, `WCC_Asset_Management_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Checksum validation
  const handleVerifyChecksum = () => {
    const totalHoValue = items.reduce((sum, item) => {
      return sum + (Number(item.totalAssetValue) || 0);
    }, 0);

    const diff = Math.abs(totalHoValue - cwipTotalSum);

    if (items.length > 0 && diff < 0.01) {
      setIsVerified(true);
      showToast('Total amounts match! Asset details saved successfully.', 'success');
    } else {
      setIsVerified(false);
      showToast(
        `The total amount in the asset details (₹${formatAmount(totalHoValue)}) does not match CWIP Total (₹${formatAmount(cwipTotalSum)}). Please check your entries.`,
        'error'
      );
    }
  };

  const totalHoValue = items.reduce((sum, item) => sum + (Number(item.totalAssetValue) || 0), 0);

  return (
    <div
      style={{
        marginTop: '1.5rem',
        padding: '1.2rem',
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#c53030', margin: 0 }}>
          Asset Management Form (HO Accounts)
        </h4>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <a
            href="/WorkCompletion/wcc_assets_upload.xlsx"
            download
            className="btn btn-sm btn-info"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: '#0284c7',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Download size={14} /> Download Sample Data
          </a>

          <button
            type="button"
            onClick={handleExportExcel}
            className="btn btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: '#475569',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <FileSpreadsheet size={14} /> Export Table
          </button>

          {isEditable && (
            <>
              <label
                htmlFor="hoAssetExcelInput"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: '#16a34a',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Upload size={14} /> Upload Excel
              </label>
              <input
                id="hoAssetExcelInput"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleExcelUpload}
                style={{ display: 'none' }}
              />
            </>
          )}
        </div>
      </div>

      {/* HO Table */}
      <div className={tableStyles.tableResponsive}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th className={tableStyles.redTh}>Asset Number</th>
              <th className={tableStyles.redTh}>Asset Sub Number</th>
              <th className={tableStyles.redTh}>Assets Description</th>
              <th className={tableStyles.redTh}>Asset Class</th>
              <th className={tableStyles.redTh}>Posting Document Number</th>
              <th className={tableStyles.redTh}>Date Of Capitalization</th>
              <th className={tableStyles.redTh}>Total Asset Value</th>
              <th className={tableStyles.redTh}>Residual Value(%)</th>
              <th className={tableStyles.redTh}>Useful Life</th>
              {isEditable && <th className={tableStyles.redTh}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {/* Input Row for adding HO item */}
            {isEditable && (
              <tr style={{ background: '#fff5f5' }}>
                <td>
                  <input
                    type="number"
                    className={tableStyles.tableInput}
                    placeholder="8 digits"
                    value={newRow.assetNumber}
                    onChange={(e) => handleNewInputChange('assetNumber', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className={tableStyles.tableInput}
                    placeholder="2 digits"
                    value={newRow.assetSubNumber}
                    onChange={(e) => handleNewInputChange('assetSubNumber', e.target.value)}
                  />
                </td>
                <td>
                  <textarea
                    className={tableStyles.tableTextarea}
                    placeholder="Max 100"
                    maxLength={100}
                    value={newRow.assetsDescription}
                    onChange={(e) => handleNewInputChange('assetsDescription', e.target.value)}
                  />
                </td>
                <td>
                  <textarea
                    className={tableStyles.tableTextarea}
                    placeholder="Max 100"
                    maxLength={100}
                    value={newRow.assetClass}
                    onChange={(e) => handleNewInputChange('assetClass', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className={tableStyles.tableInput}
                    placeholder="Doc No"
                    value={newRow.postingDocNumber}
                    onChange={(e) => handleNewInputChange('postingDocNumber', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="date"
                    className={tableStyles.tableInput}
                    value={newRow.capitalizationDate}
                    onChange={(e) => handleNewInputChange('capitalizationDate', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className={tableStyles.tableInput}
                    placeholder="Asset Value"
                    value={newRow.totalAssetValue}
                    onChange={(e) => handleNewInputChange('totalAssetValue', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className={tableStyles.tableInput}
                    placeholder="%"
                    value={newRow.residualValue}
                    onChange={(e) => handleNewInputChange('residualValue', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className={tableStyles.tableInput}
                    placeholder="3 digits"
                    value={newRow.usefulLife}
                    onChange={(e) => handleNewInputChange('usefulLife', e.target.value)}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="btn btn-sm btn-success"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} /> Add
                  </button>
                </td>
              </tr>
            )}

            {items.length === 0 && !isEditable && (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', color: '#94a3b8', padding: '1.5rem' }}>
                  No HO asset management items recorded.
                </td>
              </tr>
            )}

            {items.map((row, index) => {
              const isEditing = editingIndex === index;

              if (isEditing) {
                return (
                  <tr key={index} style={{ background: '#fef9c3' }}>
                    <td>
                      <input
                        type="number"
                        className={tableStyles.tableInput}
                        value={editRowData.assetNumber}
                        onChange={(e) => handleEditChange('assetNumber', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className={tableStyles.tableInput}
                        value={editRowData.assetSubNumber}
                        onChange={(e) => handleEditChange('assetSubNumber', e.target.value)}
                      />
                    </td>
                    <td>
                      <textarea
                        className={tableStyles.tableTextarea}
                        value={editRowData.assetsDescription}
                        onChange={(e) => handleEditChange('assetsDescription', e.target.value)}
                      />
                    </td>
                    <td>
                      <textarea
                        className={tableStyles.tableTextarea}
                        value={editRowData.assetClass}
                        onChange={(e) => handleEditChange('assetClass', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className={tableStyles.tableInput}
                        value={editRowData.postingDocNumber}
                        onChange={(e) => handleEditChange('postingDocNumber', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        className={tableStyles.tableInput}
                        value={editRowData.capitalizationDate}
                        onChange={(e) => handleEditChange('capitalizationDate', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className={tableStyles.tableInput}
                        value={editRowData.totalAssetValue}
                        onChange={(e) => handleEditChange('totalAssetValue', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className={tableStyles.tableInput}
                        value={editRowData.residualValue}
                        onChange={(e) => handleEditChange('residualValue', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className={tableStyles.tableInput}
                        value={editRowData.usefulLife}
                        onChange={(e) => handleEditChange('usefulLife', e.target.value)}
                      />
                    </td>
                    <td>
                      <div className={tableStyles.actionsCell}>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(index)}
                          className={`${tableStyles.btnAction} ${tableStyles.edit}`}
                          title="Save"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className={`${tableStyles.btnAction} ${tableStyles.delete}`}
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={index}>
                  <td>{row.assetNumber}</td>
                  <td>{row.assetSubNumber}</td>
                  <td>{row.assetsDescription}</td>
                  <td>{row.assetClass}</td>
                  <td>{row.postingDocNumber}</td>
                  <td>{row.capitalizationDate}</td>
                  <td style={{ fontWeight: 700 }}>{formatAmount(row.totalAssetValue)}</td>
                  <td>{row.residualValue}%</td>
                  <td>{row.usefulLife}</td>
                  {isEditable && (
                    <td>
                      <div className={tableStyles.actionsCell}>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(index)}
                          className={`${tableStyles.btnAction} ${tableStyles.edit}`}
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(index)}
                          className={`${tableStyles.btnAction} ${tableStyles.delete}`}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr className={tableStyles.totalRow}>
              <td colSpan={6} style={{ textAlign: 'right', fontWeight: 700 }}>
                Total Asset Value:
              </td>
              <td style={{ fontWeight: 800, color: '#c53030' }}>
                {formatAmount(totalHoValue)}
              </td>
              <td colSpan={isEditable ? 3 : 2}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Save / Verify Button */}
      {isEditable && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
          {isVerified ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 700 }}>
              <CheckCircle2 size={20} />
              <span>Asset Balance Verified & Saved</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleVerifyChecksum}
              style={{
                backgroundColor: '#2b6cb0',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 24px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(43, 108, 176, 0.25)',
              }}
            >
              Verify & Save Asset Totals
            </button>
          )}
        </div>
      )}
    </div>
  );
}
