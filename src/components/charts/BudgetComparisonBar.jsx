import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const BudgetComparisonBar = ({
  budget = 12000,
  projected = 13750,
  recovered = 12000,
  recoveryAmount = 1750,
  currency = 'INR',
}) => {
  const maxVal = Math.max(projected, budget) * 1.05;

  const projectedPct = Math.round((projected / maxVal) * 100);
  const recoveredPct = Math.round((recovered / maxVal) * 100);

  return (
    <div className="budget-comparison-card">
      <div className="comparison-columns">
        {/* Before */}
        <div className="comparison-col before-col">
          <div className="col-tag">
            <AlertCircle size={14} />
            <span>Before AI Plan</span>
          </div>
          <div className="col-amount danger-text">{formatCurrency(projected, currency)}</div>
          <div className="col-sub">Projected Run-Rate</div>
          <div className="comp-bar-track">
            <div className="comp-bar-fill bar-danger" style={{ width: `${projectedPct}%` }} />
          </div>
          <div className="comp-overage-badge">
            +{formatCurrency(projected - budget, currency)} Over Budget
          </div>
        </div>

        {/* Transition Arrow / Cut Amount */}
        <div className="comparison-transition">
          <div className="transition-badge">
            <span>AI TRIMS</span>
            <strong>-{formatCurrency(recoveryAmount, currency)}</strong>
          </div>
          <ArrowRight className="transition-arrow" size={24} />
        </div>

        {/* After */}
        <div className="comparison-col after-col">
          <div className="col-tag success-tag">
            <ShieldCheck size={14} />
            <span>After AI Recovery</span>
          </div>
          <div className="col-amount success-text">{formatCurrency(recovered, currency)}</div>
          <div className="col-sub">Target: {formatCurrency(budget, currency)}</div>
          <div className="comp-bar-track">
            <div className="comp-bar-fill bar-success" style={{ width: `${recoveredPct}%` }} />
          </div>
          <div className="comp-safe-badge">
            100% Aligned with Budget
          </div>
        </div>
      </div>
    </div>
  );
};
