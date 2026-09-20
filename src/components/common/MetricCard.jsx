import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const MetricCard = ({
  label,
  value,
  change,
  positive = null, // true = positive green, false = negative coral, null = neutral
  icon: Icon,
  subtitle,
  className = '',
  onClick,
}) => {
  return (
    <div
      className={`metric-card ${onClick ? 'metric-card-clickable' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="metric-header">
        <span className="metric-label">{label}</span>
        {Icon && (
          <div className="metric-icon-badge">
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="metric-value-wrap">
        <div className="metric-value">{value}</div>
      </div>

      {(change || subtitle) && (
        <div className="metric-footer">
          {change && (
            <span
              className={`metric-trend ${
                positive === true
                  ? 'trend-positive'
                  : positive === false
                  ? 'trend-negative'
                  : 'trend-neutral'
              }`}
            >
              {positive === true && <TrendingUp size={13} />}
              {positive === false && <TrendingDown size={13} />}
              {positive === null && <Minus size={13} />}
              <span>{change}</span>
            </span>
          )}
          {subtitle && <span className="metric-subtitle">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
