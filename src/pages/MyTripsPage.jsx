import React from 'react';
import { useTripWise } from '../context/TripWiseContext';
import { PageHeader } from '../components/layout/PageHeader';
import { ProgressBar } from '../components/common/ProgressBar';
import { formatCurrency } from '../utils/formatters';
import {
  Calendar,
  Users,
  Plus,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';

export const MyTripsPage = () => {
  const { trips, user, setActiveTripId, setActivePage } = useTripWise();

  const handleManageTrip = (trip) => {
    setActiveTripId(trip.id);
    if (trip.status === 'Active') {
      setActivePage('Trip Spending');
    } else {
      setActivePage('Trip Spending');
    }
  };

  const handleOpenRecovery = (trip) => {
    setActiveTripId(trip.id);
    setActivePage('AI Recovery');
  };

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="TRAVEL PORTFOLIO"
        title="My Trips"
        subtitle="Manage upcoming adventures, active excursions, and historical vacation ledgers."
        actions={
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setActivePage('Trip Planner')}
          >
            <Plus size={15} />
            <span>+ Plan New Trip</span>
          </button>
        }
      />

      {/* Trips Grid */}
      <div className="trips-grid">
        {trips.map((trip) => {
          const budget = Number(trip.budget) || 12000;
          const spent = Number(trip.spent) || 0;
          const remaining = budget - spent;
          const progress = Math.min(100, Math.round((spent / budget) * 100));

          const hasOverspendingRisk =
            trip.projectedSpendOverride &&
            trip.projectedSpendOverride > trip.budget &&
            !trip.recoveryApplied;

          return (
            <div key={trip.id} className="trip-portfolio-card">
              {/* Image & Header */}
              <div className="trip-portfolio-img-wrap">
                <img
                  src={trip.image || trip.coverImage}
                  alt={trip.destination}
                  className="trip-portfolio-img"
                  loading="lazy"
                />
                <div className="trip-status-overlay">
                  <span className={`status-pill status-${trip.status.toLowerCase()}`}>
                    {trip.status === 'Active' && <Clock size={12} />}
                    {trip.status === 'Upcoming' && <Calendar size={12} />}
                    {trip.status === 'Completed' && <CheckCircle2 size={12} />}
                    <span>{trip.status}</span>
                  </span>

                  {hasOverspendingRisk && (
                    <span className="risk-pill-alert" onClick={() => handleOpenRecovery(trip)}>
                      <AlertTriangle size={12} />
                      <span>Over budget risk</span>
                    </span>
                  )}
                </div>

                <div className="trip-card-bottom-bar">
                  <h3 className="trip-dest-heading">{trip.destination}</h3>
                  <span className="trip-nights-tag">
                    {trip.days} Days · {trip.nights || trip.days - 1} Nights
                  </span>
                </div>
              </div>

              {/* Body Info */}
              <div className="trip-portfolio-body">
                <div className="trip-info-row">
                  <div className="info-item">
                    <Calendar size={14} className="info-icon" />
                    <span>{trip.dates || trip.monthYear || '2026'}</span>
                  </div>
                  <div className="info-item">
                    <Users size={14} className="info-icon" />
                    <span>{trip.travelers || 1} Travelers · {trip.travelStyle || 'Moderate'}</span>
                  </div>
                </div>

                {/* Progress & Metrics */}
                <div className="trip-budget-progress-section">
                  <div className="progress-labels-row">
                    <span className="progress-lbl">Budget Spent</span>
                    <span className="progress-val-ratio">
                      {formatCurrency(spent, user.currency)} / {formatCurrency(budget, user.currency)}
                    </span>
                  </div>

                  <ProgressBar
                    percent={progress}
                    height={8}
                    variant={hasOverspendingRisk ? 'danger' : progress > 80 ? 'warning' : 'primary'}
                  />

                  <div className="progress-bottom-meta">
                    <span className="spent-pct">{progress}% utilized</span>
                    <span className="remaining-tag">
                      {remaining >= 0 ? `${formatCurrency(remaining, user.currency)} remaining` : `Exceeded by ${formatCurrency(Math.abs(remaining), user.currency)}`}
                    </span>
                  </div>
                </div>

                {/* Overspending AI Trigger Notice */}
                {hasOverspendingRisk && (
                  <div className="trip-recovery-inline-alert" onClick={() => handleOpenRecovery(trip)}>
                    <div className="recovery-inline-left">
                      <Sparkles size={14} className="recovery-spark" />
                      <span>Projected: {formatCurrency(trip.projectedSpendOverride, user.currency)} (+{formatCurrency(trip.projectedSpendOverride - budget, user.currency)})</span>
                    </div>
                    <span className="recovery-inline-btn">
                      <span>Fix with AI</span>
                      <ChevronRight size={13} />
                    </span>
                  </div>
                )}

                {/* Card Actions */}
                <div className="trip-portfolio-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm flex-1"
                    onClick={() => handleManageTrip(trip)}
                  >
                    <span>Trip Spending</span>
                    <ArrowRight size={13} />
                  </button>

                  {hasOverspendingRisk && (
                    <button
                      type="button"
                      className="btn btn-ai-recovery btn-sm"
                      onClick={() => handleOpenRecovery(trip)}
                    >
                      <Sparkles size={13} />
                      <span>AI Recovery</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
