import React from 'react';

/**
 * Reusable Badge component
 * Variants: positive, warning, danger, info, neutral, ai-pulse
 */
export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon: Icon,
  className = '',
}) => {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className}`}>
      {Icon && <Icon className="badge-icon" size={size === 'sm' ? 12 : 14} />}
      <span>{children}</span>
    </span>
  );
};
