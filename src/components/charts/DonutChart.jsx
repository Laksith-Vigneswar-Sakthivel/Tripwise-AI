import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

const CATEGORY_COLORS = {
  Food: '#3B82F6',         // Deep/Electric Blue
  Shopping: '#10B981',     // Emerald/Muted Green
  Transport: '#F59E0B',    // Warm Amber
  Entertainment: '#8B5CF6',// Purple
  Bills: '#6366F1',        // Indigo
  Travel: '#06B6D4',       // Cyan
  Stay: '#EC4899',         // Pink
  Activities: '#F97316',   // Orange
  Other: '#94A3B8',        // Slate
};

export const DonutChart = ({
  data = [], // [{ label: 'Food', value: 420 }, ...]
  currency = 'INR',
  size = 190,
  strokeWidth = 24,
  centerTitle = 'Total',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0);

  // If no data or 0 total
  if (!data.length || total === 0) {
    return (
      <div className="donut-empty-state">
        <div className="donut-placeholder" style={{ width: size, height: size }}>
          <span>No spending recorded</span>
        </div>
      </div>
    );
  }

  // Calculate SVG arc paths
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accPercent = 0;
  const slices = [];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const value = Number(item.value || 0);
    const percent = value / total;
    const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
    const strokeDashoffset = -circumference * accPercent;
    accPercent += percent;

    const color = item.color || CATEGORY_COLORS[item.label] || '#94A3B8';

    slices.push({
      ...item,
      percent: Math.round(percent * 100),
      strokeDasharray,
      strokeDashoffset,
      color,
      index: i,
    });
  }

  const activeItem = hoveredIdx !== null ? slices[hoveredIdx] : null;

  return (
    <div className="donut-container">
      <div className="donut-chart-wrap" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="donut-svg"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="var(--donut-track, rgba(255,255,255,0.06))"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {slices.map((slice) => (
            <circle
              key={slice.label}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={hoveredIdx === slice.index ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              strokeLinecap="round"
              className="donut-slice"
              transform={`rotate(-90 ${center} ${center})`}
              onMouseEnter={() => setHoveredIdx(slice.index)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                cursor: 'pointer',
                opacity: hoveredIdx !== null && hoveredIdx !== slice.index ? 0.45 : 1,
              }}
            />
          ))}
        </svg>

        {/* Center Label */}
        <div className="donut-center-label">
          <span className="donut-center-sub">
            {activeItem ? activeItem.label : centerTitle}
          </span>
          <span className="donut-center-value">
            {formatCurrency(activeItem ? activeItem.value : total, currency)}
          </span>
          {activeItem && (
            <span className="donut-center-pct">{activeItem.percent}%</span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="donut-legend">
        {slices.map((item) => (
          <div
            key={item.label}
            className={`donut-legend-item ${hoveredIdx === item.index ? 'active' : ''}`}
            onMouseEnter={() => setHoveredIdx(item.index)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <span className="legend-dot" style={{ backgroundColor: item.color }} />
            <span className="legend-label">{item.label}</span>
            <span className="legend-amount">{formatCurrency(item.value, currency)}</span>
            <span className="legend-percent">{item.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
