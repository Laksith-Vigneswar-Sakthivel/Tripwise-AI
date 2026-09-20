import React from 'react';
import { Sparkles } from 'lucide-react';

export const PageHeader = ({
  eyebrow,
  title,
  subtitle,
  actions,
  isAiPowered = false,
  className = '',
}) => {
  return (
    <div className={`page-header ${className}`}>
      <div className="page-header-left">
        {eyebrow && (
          <div className="page-eyebrow">
            {isAiPowered && <Sparkles size={12} className="eyebrow-ai-icon" />}
            <span>{eyebrow}</span>
          </div>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>

      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
};
