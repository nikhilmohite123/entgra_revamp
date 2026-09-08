import React from 'react';
import styles from '../styles/IdeaHubFooter.module.css';

export default function IdeaHubFooter() {
  return (
    <footer className={styles.siteFooter}>
      <div className={styles.footerInner}>
        <div className={styles.footerLeft}>
          <span>EPL Packaging Innovation Portal · Idea Hub</span>
        </div>
        <div className={styles.footerRight}>
          <span>
            Powered by <a href="/bpmn">EPL Entgra BPMN</a> · v2.1.0
          </span>
        </div>
      </div>
    </footer>
  );
}
