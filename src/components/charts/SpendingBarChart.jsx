import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

export const SpendingBarChart = ({
  data = [
    { label: 'Week 1', spent: 650, budget: 2500 },
    { label: 'Week 2', spent: 804, budget: 2500 },
    { label: 'Week 3', spent: 905, budget: 2500 },
    { label: 'Week 4', spent: 0, budget: 2500 },
  ],
  currency = 'INR',
  height = 150,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const maxSpent = Math.max(
    ...data.map((item) => Number(item.spent) || 0),
    1
  );

  const chartMax = maxSpent * 1.25;

  return (
    <div className="bar-chart-container">

      <div
        className="bar-chart-bars"
        style={{ height: `${height}px` }}
      >
        {/* Grid lines */}
        <div className="chart-gridline" style={{ bottom: '25%' }} />
        <div className="chart-gridline" style={{ bottom: '50%' }} />
        <div className="chart-gridline" style={{ bottom: '75%' }} />
        <div className="chart-gridline" style={{ bottom: '100%' }} />

        {data.map((item, idx) => {
          const spent = Number(item.spent) || 0;
          const budget = Number(item.budget) || 0;

          const barHeight =
            spent === 0
              ? 0
              : Math.max(5, (spent / chartMax) * 100);

          const isHovered = hoveredIdx === idx;
          const isOverBudget =
            budget > 0 && spent > budget;

          return (
            <div
              key={item.label}
              className="bar-column"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >

              {/* Tooltip */}
              {isHovered && (
                <div className="bar-tooltip">
                  <div className="tooltip-title">
                    {item.label}
                  </div>

                  <div className="tooltip-val">
                    Spent:{' '}
                    <strong>
                      {formatCurrency(spent, currency)}
                    </strong>
                  </div>

                  <div className="tooltip-sub">
                    Weekly Cap:{' '}
                    {formatCurrency(budget, currency)}
                  </div>
                </div>
              )}

              {/* Bar area */}
              <div className="bar-track">
                <div
                  className={`bar-fill ${
                    isOverBudget
                      ? 'bar-over'
                      : 'bar-normal'
                  }`}
                  style={{
                    height: `${barHeight}%`,
                  }}
                />
              </div>

              {/* Label BELOW the bar */}
              <div
                className={`bar-label ${
                  isHovered ? 'bar-label-active' : ''
                }`}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="chart-legend-row">
        <div className="chart-legend-indicator">
          <span className="indicator-dot indicator-spent" />
          <span>Actual Spent</span>
        </div>

        <div className="chart-legend-indicator">
          <span className="indicator-dot indicator-guide" />
          <span>
            Weekly Target Cap (~
            {formatCurrency(
              data[0]?.budget || 2500,
              currency
            )}
            )
          </span>
        </div>
      </div>

    </div>
  );
};