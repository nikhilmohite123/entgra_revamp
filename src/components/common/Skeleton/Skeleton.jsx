import React from 'react';
import styles from './Skeleton.module.css';

/**
 * Base Shimmer Skeleton with customizable variants and dimensions
 */
export default function Skeleton({
  width = '100%',
  height,
  variant = 'text', // 'text' | 'circle' | 'rectangular' | 'rounded'
  className = '',
  style = {},
  count = 1,
}) {
  const customStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style,
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'circle':
        return styles.circle;
      case 'rectangular':
        return styles.rectangular;
      case 'rounded':
        return styles.rounded;
      case 'text':
      default:
        return styles.text;
    }
  };

  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={`${styles.skeletonBase} ${getVariantClass()} ${className}`}
            style={customStyle}
            aria-hidden="true"
          />
        ))}
      </>
    );
  }

  return (
    <div
      className={`${styles.skeletonBase} ${getVariantClass()} ${className}`}
      style={customStyle}
      aria-hidden="true"
    />
  );
}
