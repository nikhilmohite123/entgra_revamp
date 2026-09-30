import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, Upload, Plus, Trash2, Edit2, Check, X, FileSpreadsheet } from 'lucide-react';
import tableStyles from '../styles/WccTables.module.css';
import formStyles from '../styles/WccForm.module.css';
import {
  INITIAL_CWIP_ROW,
  formatAmount,
  parseIndianNumber,
} from '../constants/wccConstants';
import { useWcc } from '../context/useWcc';

export default function WccCwipTable({
  items = [],
  setItems,
  isEditable = true,
}) {
  const { showToast } = useWcc();
  const [newRow, setNewRow] = useState(INITIAL_CWIP_ROW);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editRowData, setEditRowData] = useState(null);

  // Handle New Input change
  const handleNewInputChange = (field, value) => {
    setNewRow((prev) => {
      const updated = { ...prev, [field]: value };
      const basic = Number(updated.basicAmount) || 0;
      const freight = Number(updated.freightCharges) || 0;
      const gst = Number(updated.ineligibleGst) || 0;
      updated.totalAmount = (basic + freight + gst).toFixed(2);
      return updated;
    });
  };

  // Add Row
  const handleAddRow = () => {
    const basic = Number(newRow.basicAmount) || 0;
    const freight = Number(newRow.freightCharges) || 0;
    const gst = Number(newRow.ineligibleGst) || 0;
    const total = basic + freight + gst;

    const rowToAdd = {
      ...newRow,
      basicAmount: basic,
      freightCharges: freight,
      ineligibleGst: gst,
      totalAmount: total,
    };

    setItems([...items, rowToAdd]);
    setNewRow(INITIAL_CWIP_ROW);
    showToast('CWIP item added', 'info');
  };

  // Delete Row
  const handleDeleteRow = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  // Start Edit
  const handleStartEdit = (index) => {
    setEditingIndex(index);
    setEditRowData({ ...items[index] });
  };

  // Edit Change
  const handleEditChange = (field, value) => {
    setEditRowData((prev) => {
      const updated = { ...prev, [field]: value };
      const basic = parseIndianNumber(updated.basicAmount);
      const freight = parseIndianNumber(updated.freightCharges);
      const gst = parseIndianNumber(updated.ineligibleGst);
      updated.totalAmount = basic + freight + gst;
      return updated;
    });
  };

  // Save Edit
  const handleSaveEdit = (index) => {
    const updated = [...items];
    const basic = parseIndianNumber(editRowData.basicAmount);
    const freight = parseIndianNumber(editRowData.freightCharges);
    const gst = parseIndianNumber(editRowData.ineligibleGst);

    updated[index] = {
      ...editRowData,
      basicAmount: basic,
      freightCharges: freight,
      ineligibleGst: gst,
      totalAmount: basic + freight + gst,
    };

    setItems(updated);
    setEditingIndex(null);
    setEditRowData(null);
  };

  // Cancel Edit
  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditRowData(null);
  };

  // Excel File Upload with SheetJS
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

        const parsedRows = jsonData.map((row) => {
          const basic = parseIndianNumber(row['Basic Amount']);
          const freight = parseIndianNumber(row['Freight Charges']);
          const gst = parseIndianNumber(row['Ineligible GST']);
          const totalAmount = basic + freight + gst;

          return {
            orderNumber: row['Order Number'] ?? '',
            cwipAsset: row['CWIP Asset'] ?? '',
            cwipDescription: row['CWIP Description'] ?? '',
            assetDescription: row['Asset Description'] ?? '',
            qauntity: row['Quantity'] ?? '',
            costCenter: row['Cost Center'] ?? '',
            budget: row['Budget'] ?? '',
            basicAmount: basic,
            freightCharges: freight,
            ineligibleGst: gst,
            totalAmount: totalAmount,
            units: row['Units'] ?? '',
            unitMeasurement: row['Unit Measurement'] ?? '',
            motherAsset: row['Mother Asset'] ?? '',
            subAsset: row['Sub Asset'] ?? '',
          };
        });

        setItems((prev) => [...prev, ...parsedRows]);
        showToast(`Successfully imported ${parsedRows.length} items from Excel!`, 'success');
      } catch (err) {
        console.error('Error importing Excel:', err);
        showToast('Failed to parse Excel file. Please ensure correct template format.', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = ''; // Reset input
  };

  // Export Table to Excel
  const handleExportExcel = () => {
    if (items.length === 0) {
      showToast('No items to export', 'error');
      return;
    }

    const exportData = items.map((item) => ({
      'Order Number': item.orderNumber,
      'CWIP Asset': item.cwipAsset,
      'CWIP Description': item.cwipDescription,
      'Asset Description': item.assetDescription,
      Quantity: item.qauntity,
      'Cost Center': item.costCenter,
      Budget: item.budget,
      'Basic Amount': item.basicAmount,
      'Freight Charges': item.freightCharges,
      'Ineligible GST': item.ineligibleGst,
      'Total Amount': item.totalAmount,
      Units: item.units,
      'Unit Measurement': item.unitMeasurement,
      'Mother Asset': item.motherAsset,
      'Sub Asset': item.subAsset,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'CWIP Details');
    XLSX.writeFile(workbook, `WCC_CWIP_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Grand Total Calculation
  const grandTotal = items.reduce((sum, item) => {
    const val = Number(item.totalAmount) || 0;
    return sum + val;
  }, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {/* Table Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          background: '#f8fafc',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <a
            href="/WorkCompletion/sample_wcc1_upload.xlsx"
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
        </div>

        {isEditable && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label
              htmlFor="cwipExcelInput"
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
              id="cwipExcelInput"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleExcelUpload}
              style={{ display: 'none' }}
            />
          </div>
        )}
      </div>

      {/* Responsive Table */}
      <div className={tableStyles.tableResponsive}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th>Order Number</th>
              <th>CWIP Asset</th>
              <th>CWIP Description</th>
              <th>Asset Description</th>
              <th>Quantity</th>
              <th>Cost Center</th>
              <th>Budget</th>
              <th>Basic Amount</th>
              <th>Freight Charges</th>
              <th>Ineligible GST</th>
              <th>Total Amount</th>
              <th>Number of Units</th>
              <th>Unit of Measurement</th>
              <th>Main Asset No</th>
              <th>Sub Asset No</th>
              {isEditable && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {/* Input Row for adding new line item */}
            {isEditable && (
              <tr style={{ background: '#f0fdf4' }}>
                <td>
                  <input
                    type="number"
                    className={tableStyles.tableInput}
                    placeholder="8 digits"
                    value={newRow.orderNumber}
                    onChange={(e) => handleNewInputChange('orderNumber', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className={tableStyles.tableInput}
                    placeholder="8 digits"
                    value={newRow.cwipAsset}
                    onChange={(e) => handleNewInputChange('cwipAsset', e.target.value)}
                  />
                </td>
                <td>
                  <textarea
                    className={tableStyles.tableTextarea}
                    placeholder="Max 100"
                    maxLength={100}
                    value={newRow.cwipDescription}
                    onChange={(e) => handleNewInputChange('cwipDescription', e.target.value)}
                  />
                </td>
                <td>
                  <textarea
                    className={tableStyles.tableTextarea}
                    placeholder="Max 100"
                    maxLength={100}
                    value={newRow.assetDescription}
                    onChange={(e) => handleNewInputChange('assetDescription', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className={tableStyles.tableInput}
                    placeholder="Quantity"
                    value={newRow.qauntity}
                    onChange={(e) => handleNewInputChange('qauntity', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className={tableStyles.tableInput}
                    placeholder="Cost Center"
                    value={newRow.costCenter}
                    onChange={(e) => handleNewInputChange('costCenter', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className={tableStyles.tableInput}
                    placeholder="Budget"
                    value={newRow.budget}
                    onChange={(e) => handleNewInputChange('budget', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className={tableStyles.tableInput}
                    placeholder="Basic Amt"
                    value={newRow.basicAmount}
                    onChange={(e) => handleNewInputChange('basicAmount', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className={tableStyles.tableInput}
                    placeholder="Freight"
                    value={newRow.freightCharges}
                    onChange={(e) => handleNewInputChange('freightCharges', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className={tableStyles.tableInput}
                    placeholder="GST"
                    value={newRow.ineligibleGst}
                    onChange={(e) => handleNewInputChange('ineligibleGst', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    readOnly
                    className={tableStyles.tableInput}
                    style={{ background: '#e2e8f0', fontWeight: 700 }}
                    value={newRow.totalAmount}
                    placeholder="Auto-calc"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className={tableStyles.tableInput}
                    placeholder="Units"
                    value={newRow.units}
                    onChange={(e) => handleNewInputChange('units', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className={tableStyles.tableInput}
                    placeholder="UOM"
                    value={newRow.unitMeasurement}
                    onChange={(e) => handleNewInputChange('unitMeasurement', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className={tableStyles.tableInput}
                    placeholder="Main Asset"
                    value={newRow.motherAsset}
                    onChange={(e) => handleNewInputChange('motherAsset', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className={tableStyles.tableInput}
                    placeholder="Sub Asset"
                    value={newRow.subAsset}
                    onChange={(e) => handleNewInputChange('subAsset', e.target.value)}
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

            {/* List of Rows */}
            {items.length === 0 && !isEditable && (
              <tr>
                <td colSpan={16} style={{ textAlign: 'center', color: '#94a3b8', padding: '1.5rem' }}>
                  No CWIP line items recorded.
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
                        value={editRowData.orderNumber}
                        onChange={(e) => handleEditChange('orderNumber', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className={tableStyles.tableInput}
                        value={editRowData.cwipAsset}
                        onChange={(e) => handleEditChange('cwipAsset', e.target.value)}
                      />
                    </td>
                    <td>
                      <textarea
                        className={tableStyles.tableTextarea}
                        value={editRowData.cwipDescription}
                        onChange={(e) => handleEditChange('cwipDescription', e.target.value)}
                      />
                    </td>
                    <td>
                      <textarea
                        className={tableStyles.tableTextarea}
                        value={editRowData.assetDescription}
                        onChange={(e) => handleEditChange('assetDescription', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className={tableStyles.tableInput}
                        value={editRowData.qauntity}
                        onChange={(e) => handleEditChange('qauntity', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className={tableStyles.tableInput}
                        value={editRowData.costCenter}
                        onChange={(e) => handleEditChange('costCenter', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className={tableStyles.tableInput}
                        value={editRowData.budget}
                        onChange={(e) => handleEditChange('budget', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className={tableStyles.tableInput}
                        value={editRowData.basicAmount}
                        onChange={(e) => handleEditChange('basicAmount', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className={tableStyles.tableInput}
                        value={editRowData.freightCharges}
                        onChange={(e) => handleEditChange('freightCharges', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className={tableStyles.tableInput}
                        value={editRowData.ineligibleGst}
                        onChange={(e) => handleEditChange('ineligibleGst', e.target.value)}
                      />
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {formatAmount(editRowData.totalAmount)}
                    </td>
                    <td>
                      <input
                        type="number"
                        className={tableStyles.tableInput}
                        value={editRowData.units}
                        onChange={(e) => handleEditChange('units', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className={tableStyles.tableInput}
                        value={editRowData.unitMeasurement}
                        onChange={(e) => handleEditChange('unitMeasurement', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className={tableStyles.tableInput}
                        value={editRowData.motherAsset}
                        onChange={(e) => handleEditChange('motherAsset', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className={tableStyles.tableInput}
                        value={editRowData.subAsset}
                        onChange={(e) => handleEditChange('subAsset', e.target.value)}
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
                  <td>{row.orderNumber}</td>
                  <td>{row.cwipAsset}</td>
                  <td>{row.cwipDescription}</td>
                  <td>{row.assetDescription}</td>
                  <td>{row.qauntity}</td>
                  <td>{row.costCenter}</td>
                  <td>{formatAmount(row.budget)}</td>
                  <td>{formatAmount(row.basicAmount)}</td>
                  <td>{formatAmount(row.freightCharges)}</td>
                  <td>{formatAmount(row.ineligibleGst)}</td>
                  <td style={{ fontWeight: 700, color: '#062b67' }}>
                    {formatAmount(row.totalAmount)}
                  </td>
                  <td>{row.units}</td>
                  <td>{row.unitMeasurement}</td>
                  <td>{row.motherAsset}</td>
                  <td>{row.subAsset}</td>
                  {isEditable && (
                    <td>
                      <div className={tableStyles.actionsCell}>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(index)}
                          className={`${tableStyles.btnAction} ${tableStyles.edit}`}
                          title="Edit row"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(index)}
                          className={`${tableStyles.btnAction} ${tableStyles.delete}`}
                          title="Delete row"
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

          {/* Grand Total Footer */}
          <tfoot>
            <tr className={tableStyles.totalRow}>
              <td colSpan={10} style={{ textAlign: 'right', fontWeight: 700 }}>
                Total:
              </td>
              <td className={tableStyles.totalAmountHighlight} style={{ fontWeight: 800 }}>
                {formatAmount(grandTotal)}
              </td>
              <td colSpan={isEditable ? 5 : 4}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
