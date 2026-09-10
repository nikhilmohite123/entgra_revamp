import React from 'react';
import Skeleton from './Skeleton';
import styles from './Skeleton.module.css';

/**
 * Instagram-Style Post / Card Skeleton Loader
 */
export function InstagramSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.instaCard}>
          {/* Header with Avatar and User Text */}
          <div className={styles.instaHeader}>
            <Skeleton variant="circle" width={44} height={44} />
            <div className={styles.instaHeaderText}>
              <Skeleton width="45%" height={14} />
              <Skeleton width="30%" height={11} />
            </div>
          </div>

          {/* Media Container Placeholder */}
          <Skeleton variant="rounded" className={styles.instaMedia} height={180} />

          {/* Body Lines */}
          <div className={styles.instaBody}>
            <Skeleton width="90%" height={13} />
            <Skeleton width="75%" height={13} />
            <Skeleton width="40%" height={11} style={{ marginTop: '6px' }} />
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Table Skeleton Loader for Data Tables
 */
export function TableSkeleton({ rows = 6 }) {
  return (
    <div className={styles.tableSkeletonWrapper}>
      {/* Table Header Placeholder */}
      <div className={styles.tableSkeletonHeader}>
        <Skeleton width="10%" height={18} style={{ background: 'rgba(255,255,255,0.2)' }} />
        <Skeleton width="15%" height={18} style={{ background: 'rgba(255,255,255,0.2)' }} />
        <Skeleton width="20%" height={18} style={{ background: 'rgba(255,255,255,0.2)' }} />
        <Skeleton width="20%" height={18} style={{ background: 'rgba(255,255,255,0.2)' }} />
        <Skeleton width="10%" height={18} style={{ background: 'rgba(255,255,255,0.2)' }} />
        <Skeleton width="10%" height={18} style={{ background: 'rgba(255,255,255,0.2)' }} />
        <Skeleton width="15%" height={18} style={{ background: 'rgba(255,255,255,0.2)' }} />
      </div>

      {/* Table Rows Placeholder */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className={styles.tableSkeletonRow}>
          {/* Ref pill */}
          <Skeleton variant="rounded" width={85} height={24} />
          {/* Team member */}
          <Skeleton width="12%" height={15} />
          {/* Feature */}
          <Skeleton width="22%" height={14} />
          {/* Benefit */}
          <Skeleton width="20%" height={14} />
          {/* Image thumbnail placeholder */}
          <Skeleton variant="rounded" width={38} height={38} />
          {/* Country badge */}
          <Skeleton variant="rounded" width={60} height={22} />
          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            <Skeleton variant="rounded" width={48} height={26} />
            <Skeleton variant="rounded" width={48} height={26} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Module Grid Skeleton Loader
 */
export function ModuleGridSkeleton({ count = 4 }) {
  return (
    <div className={styles.moduleGridSkeleton}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.moduleCardSkeleton}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Skeleton variant="rounded" width={48} height={48} />
            <div style={{ flex: 1 }}>
              <Skeleton width="60%" height={18} style={{ marginBottom: '6px' }} />
              <Skeleton width="40%" height={12} />
            </div>
          </div>
          <Skeleton width="100%" height={14} style={{ marginTop: '12px' }} />
          <Skeleton width="85%" height={14} />
        </div>
      ))}
    </div>
  );
}

/**
 * Form Skeleton Loader
 */
export function FormSkeleton() {
  return (
    <div className={styles.formSkeleton}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
        <Skeleton variant="rounded" width={110} height={26} />
        <Skeleton width="45%" height={28} />
        <Skeleton width="70%" height={16} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Skeleton width={140} height={14} />
        <Skeleton variant="rounded" width="100%" height={42} />
      </div>

      <div className={styles.formRowSkeleton}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Skeleton width={120} height={14} />
          <Skeleton variant="rounded" width="100%" height={70} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Skeleton width={120} height={14} />
          <Skeleton variant="rounded" width="100%" height={70} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Skeleton width={160} height={14} />
        <Skeleton variant="rounded" width="100%" height={120} />
      </div>

      <Skeleton variant="rounded" width={180} height={44} style={{ marginTop: '12px' }} />
    </div>
  );
}

const Skeletons = {
  Skeleton,
  InstagramSkeleton,
  TableSkeleton,
  ModuleGridSkeleton,
  FormSkeleton,
};

export default Skeletons;
