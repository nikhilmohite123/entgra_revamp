import React from 'react';
import styles from '../styles/SamplePortalFooter.module.css';

export default function SamplePortalFooter() {
  return (
    <footer className={styles.footer}>
      <p>© {new Date().getFullYear()} EPL Sample Request Form. All rights reserved.</p>
    </footer>
  );
}
