import React from 'react';
import { Package, ShieldCheck, Eye } from 'lucide-react';
import styles from '../../../styles/cni-premium.module.css';

export function DashboardJumbotron() {
  return (
    <div className={styles.hero} style={{ marginBottom: '2rem' }}>
      <h2 className={styles.heroTitle} style={{ marginBottom: '1.5rem' }}>Regulatory & Commercial Laminates</h2>
      
      <div className={styles.gridCards} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* ABL */}
        <div className={styles.glassSurface} style={{ padding: '1.25rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <ShieldCheck size={24} color="#63B52F" />
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Aluminum Barrier Laminates (ABL)</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.9)', margin: 0, lineHeight: 1.5 }}>
            Provides superior light, air and moisture barrier along with reduced flavor absorption. The material density offers a durable tube for pastes, ointments, creams and gels.
          </p>
        </div>

        {/* PBL */}
        <div className={styles.glassSurface} style={{ padding: '1.25rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Package size={24} color="#63B52F" />
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Plastic Barrier Laminates (PBL)</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.9)', margin: 0, lineHeight: 1.5 }}>
            Maintains form and shape with a cosmetic look. Environmentally friendly. Special EVOH barriers offer strong chemical resistance.
          </p>
        </div>

        {/* Transparent */}
        <div className={styles.glassSurface} style={{ padding: '1.25rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Eye size={24} color="#63B52F" />
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Transparent Structures</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.9)', margin: 0, lineHeight: 1.5 }}>
            Transparent Structures are also PBL, designed primarily for product visibility and attractiveness on the shelf.
          </p>
        </div>
      </div>
    </div>
  );
}
