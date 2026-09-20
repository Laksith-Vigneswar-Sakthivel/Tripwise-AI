import React from 'react';

export const ProgressBar = ({
  percent = 0,
  variant = 'primary', // 'primary' | 'success' | 'warning' | 'danger'
  height = 8,
  segments = null,
  showLabel = false,
  label = '',
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className={`progress-wrapper ${className}`}>
      {showLabel && (
        <div className="progress-label-row">
          <span className="progress-title">{label}</span>
          <span className="progress-percent">{Math.round(percent)}%</span>
        </div>
      )}

      <div
        className="progress-track"
        style={{ height: `${height}px` }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        {segments ? (
          <div className="progress-segments">
            {segments.map((seg, idx) => (
              <div
                key={idx}
                className="progress-segment"
                style={{
                  width: `${Math.min(100, Math.max(0, seg.percent))}%`,
                  backgroundColor: seg.color,
                }}
                title={`${seg.label}: ${Math.round(seg.percent)}%`}
              />
            ))}
          </div>
        ) : (
          <div
            className={`progress-fill progress-fill-${variant}`}
            style={{ width: `${clamped}%` }}
          />
        )}
      </div>
    </div>
  );
};
