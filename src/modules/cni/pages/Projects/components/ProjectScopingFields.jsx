import React from 'react';
import styles from '../../../styles/cni-premium.module.css';

export default function ProjectScopingFields({ register, errors, isReadOnly = false, isVAndE = true, legacyTargetSegment = '' }) {
  const targetSegmentOptions = !isVAndE && typeof legacyTargetSegment === 'string' && legacyTargetSegment.length > 0
    ? legacyTargetSegment.split(',')
    : [];

  return (
    <>
      <div>
        <label className={styles.formLabel}>Project Name <span style={{color: 'var(--danger)'}}>*</span></label>
        <input 
          className={styles.formControl} 
          placeholder="Project Name" 
          type="text"
          disabled={isReadOnly}
          {...register('s_project_name')} 
        />
        {errors.s_project_name && <span style={{color: 'var(--danger)', fontSize: '0.8rem'}}>{errors.s_project_name.message}</span>}
      </div>

      <div>
        <label className={styles.formLabel}>Product Abstract <span style={{color: 'var(--danger)'}}>*</span></label>
        <textarea 
          className={styles.formControl}
          placeholder="Product Differentiation / Unique Features:"
          rows={3}
          disabled={isReadOnly}
          {...register('s_product_diff')}
        ></textarea>
        {errors.s_product_diff && <span style={{color: 'var(--danger)', fontSize: '0.8rem'}}>{errors.s_product_diff.message}</span>}
      </div>

      <div>
        <label className={styles.formLabel}>Target Segment <span style={{color: 'var(--danger)'}}>*</span></label>
        {isVAndE ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            {[
              { val: 'Beauty Cosmetics', label: 'Beauty & Cosmetics' },
              { val: 'Pharma Health', label: 'Pharma & Health' },
              { val: 'Home', label: 'Home' },
              { val: 'Food', label: 'Food' },
              { val: 'Oral', label: 'Oral' }
            ].map(opt => (
              <label key={opt.val} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isReadOnly ? 'default' : 'pointer' }}>
                <input 
                  type="checkbox" 
                  value={opt.val} 
                  disabled={isReadOnly}
                  {...register('s_target_market_seg')}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{opt.label}</span>
              </label>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            {targetSegmentOptions.map(s => (
              <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isReadOnly ? 'default' : 'pointer' }}>
                <input 
                  type="checkbox" 
                  value={s} 
                  disabled={isReadOnly}
                  {...register('s_target_market_seg')}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{s}</span>
              </label>
            ))}
          </div>
        )}
        {errors.s_target_market_seg && <span style={{color: 'var(--danger)', fontSize: '0.8rem', display: 'block', marginTop: '0.5rem'}}>{errors.s_target_market_seg.message}</span>}
      </div>

      <div>
        <label className={styles.formLabel}>Source of Information <span style={{color: 'var(--danger)'}}>*</span></label>
        <input 
          className={styles.formControl} 
          placeholder="Vendor / Polymer Manufacturer / Internal Discussions"
          type="text" 
          disabled={isReadOnly}
          {...register('s_source_of_info')}
        />
        {errors.s_source_of_info && <span style={{color: 'var(--danger)', fontSize: '0.8rem'}}>{errors.s_source_of_info.message}</span>}
      </div>

      <div>
        <label className={styles.formLabel}>New Market or Replacement <span style={{color: 'var(--danger)'}}>*</span></label>
        <select 
          className={styles.formControl} 
          disabled={isReadOnly}
          {...register('s_new_mar_exi_product')}
        >
          <option value="">Select Category</option>
          <option value="1">New Market</option>
          <option value="2">Replacement of existing product</option>
          <option value="3">Alternate Material</option>
        </select>
        {errors.s_new_mar_exi_product && <span style={{color: 'var(--danger)', fontSize: '0.8rem'}}>{errors.s_new_mar_exi_product.message}</span>}
      </div>

      <div>
        <label className={styles.formLabel}>Current Practice <span style={{color: 'var(--text-secondary)', fontWeight: 400}}>(Specify current practice)</span> <span style={{color: 'var(--danger)'}}>*</span></label>
        <textarea 
          className={styles.formControl} 
          placeholder="Describe current practice..."
          rows={3}
          disabled={isReadOnly}
          {...register('s_current_practice')}
        ></textarea>
        {errors.s_current_practice && <span style={{color: 'var(--danger)', fontSize: '0.8rem'}}>{errors.s_current_practice.message}</span>}
      </div>

      <div>
        <label className={styles.formLabel}>Expected Market Volume <span style={{color: 'var(--danger)'}}>*</span></label>
        <input 
          className={styles.formControl} 
          placeholder="Expected Market Volume" 
          type="text"
          disabled={isReadOnly}
          {...register('s_exp_market_vol')}
        />
        {errors.s_exp_market_vol && <span style={{color: 'var(--danger)', fontSize: '0.8rem'}}>{errors.s_exp_market_vol.message}</span>}
      </div>

      <div>
        <label className={styles.formLabel}>Competition Analysis <span style={{color: 'var(--danger)'}}>*</span></label>
        <textarea 
          className={styles.formControl} 
          placeholder="Provide competition analysis"
          rows={3}
          disabled={isReadOnly}
          {...register('s_competition_analysis')}
        ></textarea>
        {errors.s_competition_analysis && <span style={{color: 'var(--danger)', fontSize: '0.8rem'}}>{errors.s_competition_analysis.message}</span>}
      </div>

      <div>
        <label className={styles.formLabel}>Project Specification / CTQ <span style={{color: 'var(--danger)'}}>*</span></label>
        <textarea 
          className={styles.formControl} 
          placeholder="Problem / Opportunity"
          rows={3}
          disabled={isReadOnly}
          {...register('s_project_speci')}
        ></textarea>
        {errors.s_project_speci && <span style={{color: 'var(--danger)', fontSize: '0.8rem'}}>{errors.s_project_speci.message}</span>}
      </div>

      <div>
        <label className={styles.formLabel}>Region <span style={{color: 'var(--danger)'}}>*</span></label>
        <select 
          className={styles.formControl} 
          disabled={isReadOnly}
          {...register('s_region')}
        >
          <option value="">Select Region</option>
          <option value="CORPORATE;I">CORPORATE</option>
          <option value="AMESA;I">AMESA</option>
          <option value="EUROPE;E">EUROPE</option>
          <option value="EAP;A">EAP</option>
          <option value="AMERICAS;U">AMERICAS</option>
        </select>
        {errors.s_region && <span style={{color: 'var(--danger)', fontSize: '0.8rem'}}>{errors.s_region.message}</span>}
      </div>

      <div>
        <label className={styles.formLabel}>Product Type <span style={{color: 'var(--danger)'}}>*</span></label>
        <select 
          className={styles.formControl} 
          disabled={isReadOnly}
          {...register('s_prodcut_type')}
        >
          <option value="">Select Type</option>
          <option value="L">LAMI</option>
          <option value="S">SEAMLESS</option>
          <option value="RL">RAW MATERIAL/LAMI</option>
          <option value="RS">RAW MATERIAL/SEAMLESS</option>
          <option value="RC">RAW MATERIAL/CAP SHOULDER</option>
        </select>
        {errors.s_prodcut_type && <span style={{color: 'var(--danger)', fontSize: '0.8rem'}}>{errors.s_prodcut_type.message}</span>}
      </div>

      <div>
        <label className={styles.formLabel}>Year (YY) <span style={{color: 'var(--danger)'}}>*</span></label>
        <input 
          className={styles.formControl} 
          placeholder="e.g. 23" 
          type="text"
          disabled={isReadOnly}
          {...register('s_year')}
        />
        {errors.s_year && <span style={{color: 'var(--danger)', fontSize: '0.8rem'}}>{errors.s_year.message}</span>}
      </div>

      <div>
        <label className={styles.formLabel}>Project Seq. <span style={{color: 'var(--danger)'}}>*</span></label>
        <input 
          className={styles.formControl} 
          placeholder="Sequence Number" 
          type="text"
          disabled={isReadOnly}
          {...register('s_project_seq')}
        />
        {errors.s_project_seq && <span style={{color: 'var(--danger)', fontSize: '0.8rem'}}>{errors.s_project_seq.message}</span>}
      </div>

      <div>
        <label className={styles.formLabel}>Location <span style={{color: 'var(--text-secondary)', fontWeight: 400}}>(Project Location)</span> <span style={{color: 'var(--danger)'}}>*</span></label>
        <select 
          className={styles.formControl} 
          disabled={isReadOnly}
          {...register('n_loc_cni_project')}
        >
          <option value="">Select Location</option>
          <option value="1">VASIND</option>
          <option value="2">WADA</option>
          <option value="3">CHINA</option>
          <option value="4">Europe</option>
          <option value="5">Vapi</option>
          <option value="6">Nalagarh</option>
          <option value="7">Goa</option>
          <option value="8">assam</option>
        </select>
        {errors.n_loc_cni_project && <span style={{color: 'var(--danger)', fontSize: '0.8rem'}}>{errors.n_loc_cni_project.message}</span>}
      </div>
    </>
  );
}
