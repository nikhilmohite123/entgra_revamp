import React from 'react';
import styles from './StateFeedback.module.css';

/**
 * Reusable Feedback Component for Error and Empty states with Retry CTA
 */
export function StateFeedback({
  type = 'empty', // 'empty' | 'error'
  title,
  message,
  actionLabel,
  onAction,
  className = '',
}) {
  const isError = type === 'error';

  return (
    <div className={`${styles.feedbackWrapper} ${className}`}>
      <div className={`${styles.iconWrap} ${isError ? styles.errorIcon : styles.emptyIcon}`}>
        {isError ? '⚠️' : '📋'}
      </div>

      <h3 className={styles.title}>
        {title || (isError ? 'Something went wrong' : 'No records found')}
      </h3>

      <p className={styles.description}>
        {message ||
          (isError
            ? 'We encountered an error loading the requested data. Please try again.'
            : 'There are currently no entries matching your selection.')}
      </p>

      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className={isError ? styles.retryBtn : styles.actionBtn}
        >
          {isError ? '↻ ' : '+ '}
          {actionLabel || (isError ? 'Retry' : 'Add First Entry')}
        </button>
      )}
    </div>
  );
}

export default StateFeedback;
