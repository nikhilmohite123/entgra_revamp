import React, { useRef } from 'react';
import { X, Printer, FileText } from 'lucide-react';
import styles from '../styles/WccModals.module.css';
import { formatAmount } from '../constants/wccConstants';
import { useWcc } from '../context/useWcc';

export default function WccPdfPreviewModal({
  isOpen,
  onClose,
  formData,
  cwipItems = [],
  hoAssetItems = [],
}) {
  const printRef = useRef(null);
  const { showToast } = useWcc() || {};

  if (!isOpen || !formData) return null;

  const grandTotal = cwipItems.reduce(
    (sum, item) => sum + (Number(item.totalAmount) || 0),
    0
  );

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      if (showToast) {
        showToast('Please allow popups to print the certificate', 'error');
      }
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Work Completion Certificate - ${formData.s_capex_approval_no || 'Document'}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Times New Roman', Times, serif; font-size: 11px; line-height: 1.4; color: #111; margin: 0; padding: 0; }
          .header { text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #2c3e50; }
          .header h1 { font-size: 18px; margin: 0 0 4px 0; color: #1a237e; text-transform: uppercase; }
          .doc-no { font-size: 11px; color: #333; }
          .timestamp { font-size: 10px; color: #777; }
          .section { margin-bottom: 16px; page-break-inside: avoid; }
          .section-title { background-color: #e3eafc; color: #0d47a1; padding: 4px 8px; font-weight: bold; font-size: 11px; border-left: 4px solid #1e40af; text-transform: uppercase; margin-bottom: 8px; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
          .field { padding: 4px 6px; border: 1px solid #d0d0d0; border-radius: 2px; }
          .field-label { font-weight: bold; color: #0d47a1; font-size: 9px; text-transform: uppercase; }
          .field-value { font-size: 11px; color: #000; margin-top: 2px; }
          .field.full { grid-column: 1 / -1; }
          table { width: 100%; border-collapse: collapse; font-size: 8px; margin-top: 4px; border: 1px solid #b0bec5; }
          th { background-color: #e8eefc; color: #0d47a1; padding: 4px 2px; border: 1px solid #b0bec5; text-align: center; }
          td { padding: 3px 2px; border: 1px solid #d0d0d0; text-align: left; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .grand-total { font-size: 12px; font-weight: bold; background: #dce7ff; padding: 6px 10px; border: 1px solid #90a4ae; text-align: right; margin-top: 6px; }
          .comment-box { background: #f5f7fb; border: 1px solid #c5cae9; padding: 6px 8px; margin-bottom: 6px; }
          .footer { margin-top: 20px; padding-top: 8px; border-top: 1px solid #ccc; text-align: center; font-size: 9px; color: #777; }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modalContent} ${styles.xl}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            <FileText size={18} color="#062b67" />
            Work Completion Certificate - Preview
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#062b67',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              <Printer size={14} /> Print / Save as PDF
            </button>
            <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className={styles.modalBody} style={{ background: '#f1f5f9' }}>
          {/* Printable Container */}
          <div
            ref={printRef}
            style={{
              background: '#ffffff',
              padding: '24px 30px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              maxWidth: '900px',
              margin: '0 auto',
              width: '100%',
              fontSize: '11px',
              fontFamily: 'serif',
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #2c3e50' }}>
              <h1 style={{ fontSize: '18px', margin: '0 0 4px 0', color: '#1a237e', textTransform: 'uppercase' }}>
                Work Completion Certificate
              </h1>
              <div style={{ fontSize: '11px', color: '#333' }}>
                Document No: {formData.s_capex_approval_no || 'N/A'}
              </div>
              <div style={{ fontSize: '10px', color: '#777' }}>
                Generated: {new Date().toLocaleDateString('en-IN')} | {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Basic Information */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#e3eafc', color: '#0d47a1', padding: '4px 8px', fontWeight: 'bold', fontSize: '11px', borderLeft: '4px solid #1e40af', textTransform: 'uppercase', marginBottom: '8px' }}>
                BASIC INFORMATION
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div style={{ padding: '4px 6px', border: '1px solid #d0d0d0', borderRadius: '2px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0d47a1', fontSize: '9px', textTransform: 'uppercase' }}>CAPEX Approval No</div>
                  <div style={{ fontSize: '11px', color: '#000', marginTop: '2px' }}>{formData.s_capex_approval_no || 'N/A'}</div>
                </div>
                <div style={{ padding: '4px 6px', border: '1px solid #d0d0d0', borderRadius: '2px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0d47a1', fontSize: '9px', textTransform: 'uppercase' }}>Plant Code</div>
                  <div style={{ fontSize: '11px', color: '#000', marginTop: '2px' }}>{formData.s_plant_code || 'N/A'}</div>
                </div>
                <div style={{ padding: '4px 6px', border: '1px solid #d0d0d0', borderRadius: '2px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0d47a1', fontSize: '9px', textTransform: 'uppercase' }}>Date Of Capitalisation</div>
                  <div style={{ fontSize: '11px', color: '#000', marginTop: '2px' }}>{formData.d_date_capitalisation || 'N/A'}</div>
                </div>
                <div style={{ padding: '4px 6px', border: '1px solid #d0d0d0', borderRadius: '2px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0d47a1', fontSize: '9px', textTransform: 'uppercase' }}>Put To Use Date</div>
                  <div style={{ fontSize: '11px', color: '#000', marginTop: '2px' }}>{formData.d_putup_use_date || 'N/A'}</div>
                </div>
                <div style={{ padding: '4px 6px', border: '1px solid #d0d0d0', borderRadius: '2px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0d47a1', fontSize: '9px', textTransform: 'uppercase' }}>Requestor Name</div>
                  <div style={{ fontSize: '11px', color: '#000', marginTop: '2px' }}>{formData.s_requestor_name || 'N/A'}</div>
                </div>
                <div style={{ padding: '4px 6px', border: '1px solid #d0d0d0', borderRadius: '2px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0d47a1', fontSize: '9px', textTransform: 'uppercase' }}>Unit / Location</div>
                  <div style={{ fontSize: '11px', color: '#000', marginTop: '2px' }}>{formData.s_location || 'N/A'}</div>
                </div>
                <div style={{ padding: '4px 6px', border: '1px solid #d0d0d0', borderRadius: '2px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0d47a1', fontSize: '9px', textTransform: 'uppercase' }}>Req Company Code</div>
                  <div style={{ fontSize: '11px', color: '#000', marginTop: '2px' }}>{formData.s_req_company || 'N/A'}</div>
                </div>
                <div style={{ padding: '4px 6px', border: '1px solid #d0d0d0', borderRadius: '2px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0d47a1', fontSize: '9px', textTransform: 'uppercase' }}>Department</div>
                  <div style={{ fontSize: '11px', color: '#000', marginTop: '2px' }}>{formData.s_department || 'N/A'}</div>
                </div>
                <div style={{ padding: '4px 6px', border: '1px solid #d0d0d0', borderRadius: '2px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0d47a1', fontSize: '9px', textTransform: 'uppercase' }}>Region / Country</div>
                  <div style={{ fontSize: '11px', color: '#000', marginTop: '2px' }}>
                    {formData.s_region || 'N/A'} {formData.s_country ? `/ ${formData.s_country}` : ''}
                  </div>
                </div>
                <div style={{ padding: '4px 6px', border: '1px solid #d0d0d0', borderRadius: '2px', gridColumn: '1 / -1' }}>
                  <div style={{ fontWeight: 'bold', color: '#0d47a1', fontSize: '9px', textTransform: 'uppercase' }}>Asset Description</div>
                  <div style={{ fontSize: '11px', color: '#000', marginTop: '2px' }}>{formData.s_asset || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#e3eafc', color: '#0d47a1', padding: '4px 8px', fontWeight: 'bold', fontSize: '11px', borderLeft: '4px solid #1e40af', textTransform: 'uppercase', marginBottom: '8px' }}>
                ADDITIONAL INFORMATION
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div style={{ padding: '4px 6px', border: '1px solid #d0d0d0', borderRadius: '2px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0d47a1', fontSize: '9px', textTransform: 'uppercase' }}>Conditional Line Items</div>
                  <div style={{ fontSize: '11px', color: '#000', marginTop: '2px', textTransform: 'capitalize' }}>
                    {formData.b_processing_of_con || 'No'}
                  </div>
                </div>
                <div style={{ padding: '4px 6px', border: '1px solid #d0d0d0', borderRadius: '2px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0d47a1', fontSize: '9px', textTransform: 'uppercase' }}>EPCG Scheme</div>
                  <div style={{ fontSize: '11px', color: '#000', marginTop: '2px', textTransform: 'capitalize' }}>
                    {formData.b_Availing_EPCG_scheme || 'No'} {formData.n_certificate_no ? `(Cert: ${formData.n_certificate_no})` : ''}
                  </div>
                </div>
                <div style={{ padding: '4px 6px', border: '1px solid #d0d0d0', borderRadius: '2px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0d47a1', fontSize: '9px', textTransform: 'uppercase' }}>Sustainability Contribution</div>
                  <div style={{ fontSize: '11px', color: '#000', marginTop: '2px', textTransform: 'capitalize' }}>
                    {formData.b_contribution_asset || 'No'}
                  </div>
                </div>
                <div style={{ padding: '4px 6px', border: '1px solid #d0d0d0', borderRadius: '2px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0d47a1', fontSize: '9px', textTransform: 'uppercase' }}>Open PO Commitments</div>
                  <div style={{ fontSize: '11px', color: '#000', marginTop: '2px', textTransform: 'capitalize' }}>
                    {formData.b_open_po_commitments || 'No'}
                  </div>
                </div>
                <div style={{ padding: '4px 6px', border: '1px solid #d0d0d0', borderRadius: '2px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0d47a1', fontSize: '9px', textTransform: 'uppercase' }}>Triple Shift Depreciation</div>
                  <div style={{ fontSize: '11px', color: '#000', marginTop: '2px', textTransform: 'capitalize' }}>
                    {formData.b_triple_shipt_depreciation || 'No'}
                  </div>
                </div>
              </div>
            </div>

            {/* CWIP Line Items */}
            {cwipItems.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ backgroundColor: '#e3eafc', color: '#0d47a1', padding: '4px 8px', fontWeight: 'bold', fontSize: '11px', borderLeft: '4px solid #1e40af', textTransform: 'uppercase', marginBottom: '8px' }}>
                  CWIP LINE ITEMS
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8px', border: '1px solid #b0bec5' }}>
                  <thead>
                    <tr style={{ background: '#e8eefc', color: '#0d47a1' }}>
                      <th style={{ padding: '4px 2px', border: '1px solid #b0bec5' }}>Order No</th>
                      <th style={{ padding: '4px 2px', border: '1px solid #b0bec5' }}>CWIP Asset</th>
                      <th style={{ padding: '4px 2px', border: '1px solid #b0bec5' }}>CWIP Desc</th>
                      <th style={{ padding: '4px 2px', border: '1px solid #b0bec5' }}>Asset Desc</th>
                      <th style={{ padding: '4px 2px', border: '1px solid #b0bec5' }}>Qty</th>
                      <th style={{ padding: '4px 2px', border: '1px solid #b0bec5' }}>Cost Center</th>
                      <th style={{ padding: '4px 2px', border: '1px solid #b0bec5' }}>Budget</th>
                      <th style={{ padding: '4px 2px', border: '1px solid #b0bec5' }}>Basic Amt</th>
                      <th style={{ padding: '4px 2px', border: '1px solid #b0bec5' }}>Freight</th>
                      <th style={{ padding: '4px 2px', border: '1px solid #b0bec5' }}>GST</th>
                      <th style={{ padding: '4px 2px', border: '1px solid #b0bec5' }}>Total</th>
                      <th style={{ padding: '4px 2px', border: '1px solid #b0bec5' }}>Units</th>
                      <th style={{ padding: '4px 2px', border: '1px solid #b0bec5' }}>UOM</th>
                      <th style={{ padding: '4px 2px', border: '1px solid #b0bec5' }}>Main Asset</th>
                      <th style={{ padding: '4px 2px', border: '1px solid #b0bec5' }}>Sub Asset</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cwipItems.map((row, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                        <td style={{ padding: '3px 2px', border: '1px solid #d0d0d0' }}>{row.orderNumber}</td>
                        <td style={{ padding: '3px 2px', border: '1px solid #d0d0d0' }}>{row.cwipAsset}</td>
                        <td style={{ padding: '3px 2px', border: '1px solid #d0d0d0' }}>{row.cwipDescription}</td>
                        <td style={{ padding: '3px 2px', border: '1px solid #d0d0d0' }}>{row.assetDescription}</td>
                        <td style={{ padding: '3px 2px', border: '1px solid #d0d0d0' }}>{row.qauntity}</td>
                        <td style={{ padding: '3px 2px', border: '1px solid #d0d0d0' }}>{row.costCenter}</td>
                        <td style={{ padding: '3px 2px', border: '1px solid #d0d0d0' }}>{formatAmount(row.budget)}</td>
                        <td style={{ padding: '3px 2px', border: '1px solid #d0d0d0' }}>{formatAmount(row.basicAmount)}</td>
                        <td style={{ padding: '3px 2px', border: '1px solid #d0d0d0' }}>{formatAmount(row.freightCharges)}</td>
                        <td style={{ padding: '3px 2px', border: '1px solid #d0d0d0' }}>{formatAmount(row.ineligibleGst)}</td>
                        <td style={{ padding: '3px 2px', border: '1px solid #d0d0d0', fontWeight: 'bold' }}>{formatAmount(row.totalAmount)}</td>
                        <td style={{ padding: '3px 2px', border: '1px solid #d0d0d0' }}>{row.units}</td>
                        <td style={{ padding: '3px 2px', border: '1px solid #d0d0d0' }}>{row.unitMeasurement}</td>
                        <td style={{ padding: '3px 2px', border: '1px solid #d0d0d0' }}>{row.motherAsset}</td>
                        <td style={{ padding: '3px 2px', border: '1px solid #d0d0d0' }}>{row.subAsset}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ fontSize: '11px', fontWeight: 'bold', background: '#dce7ff', padding: '6px 10px', border: '1px solid #90a4ae', textAlign: 'right', marginTop: '6px' }}>
                  Grand Total: ₹{formatAmount(grandTotal)}
                </div>
              </div>
            )}

            {/* HO Asset Details */}
            {hoAssetItems.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ backgroundColor: '#e3eafc', color: '#0d47a1', padding: '4px 8px', fontWeight: 'bold', fontSize: '11px', borderLeft: '4px solid #1e40af', textTransform: 'uppercase', marginBottom: '8px' }}>
                  ASSET MANAGEMENT DETAILS (HO)
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8px', border: '1px solid #b0bec5' }}>
                  <thead>
                    <tr style={{ background: '#e8eefc', color: '#0d47a1' }}>
                      <th style={{ padding: '4px 2px', border: '1px solid #b0bec5' }}>Asset No</th>
                      <th style={{ padding: '4px 2px', border: '1px solid #b0bec5' }}>Sub No</th>
                      <th style={{ padding: '4px 2px', border: '1px solid #b0bec5' }}>Description</th>
                      <th style={{ padding: '4px 2px', border: '1px solid #b0bec5' }}>Asset Class</th>
                      <th style={{ padding: '4px 2px', border: '1px solid #b0bec5' }}>Posting Doc</th>
                      <th style={{ padding: '4px 2px', border: '1px solid #b0bec5' }}>Cap Date</th>
                      <th style={{ padding: '4px 2px', border: '1px solid #b0bec5' }}>Total Value</th>
                      <th style={{ padding: '4px 2px', border: '1px solid #b0bec5' }}>Residual %</th>
                      <th style={{ padding: '4px 2px', border: '1px solid #b0bec5' }}>Useful Life</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hoAssetItems.map((row, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                        <td style={{ padding: '3px 2px', border: '1px solid #d0d0d0' }}>{row.assetNumber}</td>
                        <td style={{ padding: '3px 2px', border: '1px solid #d0d0d0' }}>{row.assetSubNumber}</td>
                        <td style={{ padding: '3px 2px', border: '1px solid #d0d0d0' }}>{row.assetsDescription}</td>
                        <td style={{ padding: '3px 2px', border: '1px solid #d0d0d0' }}>{row.assetClass}</td>
                        <td style={{ padding: '3px 2px', border: '1px solid #d0d0d0' }}>{row.postingDocNumber}</td>
                        <td style={{ padding: '3px 2px', border: '1px solid #d0d0d0' }}>{row.capitalizationDate}</td>
                        <td style={{ padding: '3px 2px', border: '1px solid #d0d0d0', fontWeight: 'bold' }}>{formatAmount(row.totalAssetValue)}</td>
                        <td style={{ padding: '3px 2px', border: '1px solid #d0d0d0' }}>{row.residualValue}%</td>
                        <td style={{ padding: '3px 2px', border: '1px solid #d0d0d0' }}>{row.usefulLife}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Remarks / Comments */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#e3eafc', color: '#0d47a1', padding: '4px 8px', fontWeight: 'bold', fontSize: '11px', borderLeft: '4px solid #1e40af', textTransform: 'uppercase', marginBottom: '8px' }}>
                COMMENTS & APPROVAL AUDIT
              </div>
              {formData.s_remark && (
                <div style={{ background: '#f5f7fb', border: '1px solid #c5cae9', padding: '6px 8px', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0d47a1', fontSize: '9px' }}>Comment Of Unit Finance Head:</div>
                  <div style={{ fontSize: '10px', color: '#111', marginTop: '2px' }}>{formData.s_remark}</div>
                </div>
              )}
              {formData.s_remark_approval && (
                <div style={{ background: '#f5f7fb', border: '1px solid #c5cae9', padding: '6px 8px', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0d47a1', fontSize: '9px' }}>Comment Of Project Head:</div>
                  <div style={{ fontSize: '10px', color: '#111', marginTop: '2px' }}>{formData.s_remark_approval}</div>
                </div>
              )}
              {formData.s_remark_projecthead && (
                <div style={{ background: '#f5f7fb', border: '1px solid #c5cae9', padding: '6px 8px', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0d47a1', fontSize: '9px' }}>Comment Of Unit Head:</div>
                  <div style={{ fontSize: '10px', color: '#111', marginTop: '2px' }}>{formData.s_remark_projecthead}</div>
                </div>
              )}
              {formData.s_remark_hoaccount && (
                <div style={{ background: '#f5f7fb', border: '1px solid #c5cae9', padding: '6px 8px', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0d47a1', fontSize: '9px' }}>Comment Of CAPEX Controller (HO):</div>
                  <div style={{ fontSize: '10px', color: '#111', marginTop: '2px' }}>{formData.s_remark_hoaccount}</div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ marginTop: '20px', paddingTop: '8px', borderTop: '1px solid #ccc', textAlign: 'center', fontSize: '9px', color: '#777' }}>
              <div>Essel BPMN Workflow System &bull; Work Completion Certificate</div>
              <div>Confidential &copy; {new Date().getFullYear()} EPL Limited</div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
