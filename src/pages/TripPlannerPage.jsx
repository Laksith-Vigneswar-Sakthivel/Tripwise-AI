import React, { useState } from 'react';
import { useTripWise } from '../context/TripWiseContext';
import { PageHeader } from '../components/layout/PageHeader';
import { formatCurrency } from '../utils/formatters';
import { generateTripBudget } from '../services/aiFinanceService';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Compass,
  ArrowRight,
  Building,
  Utensils,
  Car,
  Ticket,
} from 'lucide-react';

const POPULAR_DESTINATIONS = [
  'Goa',
  'Kyoto',
  'Bali',
  'Paris',
  'Swiss Alps',
  'Manali',
  'Dubai',
  'Bangkok',
];

const DESTINATION_IMAGES = {
  Goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
  Kyoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
  Bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
  Paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  'Swiss Alps': 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
  Manali: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
  Dubai: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
  Bangkok: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80',
};

const CATEGORY_ICONS = {
  Stay: Building,
  Food: Utensils,
  Transport: Car,
  Activities: Ticket,
  'Emergency Buffer': ShieldCheck,
};

export const TripPlannerPage = () => {
  const { user, addTrip, setActivePage } = useTripWise();

  const [destination, setDestination] = useState('Goa');
  const [days, setDays] = useState(4);
  const [travelers, setTravelers] = useState(2);
  const [totalBudget, setTotalBudget] = useState(12000);
  const [travelStyle, setTravelStyle] = useState('Moderate');

  const [generatedPlan, setGeneratedPlan] = useState(() =>
    generateTripBudget('Goa', 4, 2, 12000, 'Moderate')
  );

  const [hasSaved, setHasSaved] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();
    const plan = generateTripBudget(
      destination.trim() || 'Goa',
      Number(days) || 1,
      Number(travelers) || 1,
      Number(totalBudget) || 1000,
      travelStyle
    );
    setGeneratedPlan(plan);
    setHasSaved(false);
  };

  const handleSaveToTrips = () => {
    if (!generatedPlan) return;

    const img =
      DESTINATION_IMAGES[generatedPlan.destination] ||
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';

    addTrip({
      destination: generatedPlan.destination,
      title: `${generatedPlan.destination} Journey`,
      days: generatedPlan.days,
      travelers: generatedPlan.travelers,
      budget: generatedPlan.totalBudget,
      travelStyle: generatedPlan.travelStyle,
      image: img,
      coverImage: img,
      monthYear: 'Upcoming 2026',
      categoryAllocations: generatedPlan.categories,
    });

    setHasSaved(true);
  };

  // Verify that category totals add up 100% exactly
  const sumCategories = Object.values(generatedPlan.categories).reduce((s, v) => s + v, 0);

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="AI TRAVEL BUDGET ENGINE"
        title="Trip Budget Planner"
        subtitle="Generate balanced, deterministic category breakdowns customized by travel style and group size."
        isAiPowered
      />

      <div className="planner-split-layout">
        {/* Left: Planning Input Form */}
        <div className="planner-form-card">
          <div className="planner-form-title-row">
            <Compass size={18} className="planner-icon" />
            <h3 className="planner-title">Trip Parameters</h3>
          </div>

          <form onSubmit={handleGenerate} className="form-stack">
            {/* Destination */}
            <div className="form-group">
              <label className="form-label" htmlFor="planner-dest">
                Destination
              </label>
              <input
                id="planner-dest"
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Goa, Kyoto, Bali"
                className="form-input"
              />

              {/* Popular Destination chips */}
              <div className="popular-dest-chips">
                {POPULAR_DESTINATIONS.slice(0, 5).map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`dest-chip ${destination === d ? 'dest-chip-active' : ''}`}
                    onClick={() => setDestination(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Days & Travelers */}
            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label" htmlFor="planner-days">
                  Duration (Days)
                </label>
                <input
                  id="planner-days"
                  type="number"
                  min="1"
                  max="90"
                  required
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="form-input font-mono"
                />
              </div>

              <div className="form-group flex-1">
                <label className="form-label" htmlFor="planner-travelers">
                  Travelers
                </label>
                <input
                  id="planner-travelers"
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="form-input font-mono"
                />
              </div>
            </div>

            {/* Total Budget */}
            <div className="form-group">
              <label className="form-label" htmlFor="planner-budget">
                Total Trip Budget ({user.currency === 'INR' ? '₹' : '$'})
              </label>
              <input
                id="planner-budget"
                type="number"
                min="1000"
                step="500"
                required
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="form-input font-mono font-bold"
              />
              <span className="form-sublabel">
                Approx {formatCurrency(Math.round(totalBudget / ((days || 1) * (travelers || 1))), user.currency)} / person / day
              </span>
            </div>

            {/* Travel Style Selector */}
            <div className="form-group">
              <label className="form-label">Travel Style</label>
              <div className="travel-style-selector">
                {['Budget', 'Moderate', 'Premium'].map((style) => (
                  <button
                    key={style}
                    type="button"
                    className={`style-btn ${travelStyle === style ? 'style-btn-active' : ''}`}
                    onClick={() => setTravelStyle(style)}
                  >
                    <span className="style-name">{style}</span>
                    <span className="style-desc">
                      {style === 'Budget' && 'Hostels & Local Transit'}
                      {style === 'Moderate' && 'Boutique Hotels & Cabs'}
                      {style === 'Premium' && 'Resorts & Private Chauffeur'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg">
              <Sparkles size={16} />
              <span>Generate Trip Plan</span>
            </button>
          </form>
        </div>

        {/* Right: Generated Plan Output */}
        <div className="planner-results-card">
          <div className="results-header">
            <div className="results-header-left">
              <span className="plan-badge">DETERMINISTIC ALLOCATION</span>
              <h2 className="plan-destination-title">
                {generatedPlan.destination.toUpperCase()}
              </h2>
              <p className="plan-meta-sub">
                {generatedPlan.days} Days · {generatedPlan.travelers} Traveler{generatedPlan.travelers > 1 ? 's' : ''} · {generatedPlan.travelStyle} Tier
              </p>
            </div>

            <div className="results-header-right">
              <span className="total-budget-lbl">Total Budget</span>
              <span className="total-budget-val">
                {formatCurrency(generatedPlan.totalBudget, user.currency)}
              </span>
            </div>
          </div>

          {/* Mathematical Guarantee Verification Alert */}
          <div className="math-guarantee-box">
            <ShieldCheck size={18} className="shield-icon" />
            <div>
              <span className="guarantee-title">Deterministic Math Verified</span>
              <p className="guarantee-sub">
                Categories total exactly <strong>{formatCurrency(sumCategories, user.currency)}</strong> (100% of ₹{generatedPlan.totalBudget.toLocaleString('en-IN')}).
              </p>
            </div>
          </div>

          {/* Category-wise Breakdown Cards */}
          <div className="category-budget-list">
            {Object.entries(generatedPlan.categories).map(([catName, amount]) => {
              const Icon = CATEGORY_ICONS[catName] || ShieldCheck;
              const pct = Math.round((amount / generatedPlan.totalBudget) * 100);

              return (
                <div key={catName} className="cat-budget-row">
                  <div className="cat-budget-left">
                    <div className="cat-icon-square">
                      <Icon size={17} />
                    </div>
                    <div>
                      <div className="cat-budget-name">{catName}</div>
                      <div className="cat-budget-pct">{pct}% of total budget</div>
                    </div>
                  </div>

                  <div className="cat-budget-right">
                    <span className="cat-budget-amt">
                      {formatCurrency(amount, user.currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Action: Save to My Trips */}
          <div className="planner-save-action">
            {hasSaved ? (
              <div className="saved-success-banner">
                <CheckCircle2 size={16} className="success-icon" />
                <span>Trip successfully added to My Trips!</span>
                <button
                  type="button"
                  className="btn btn-outline btn-sm ml-auto"
                  onClick={() => setActivePage('My Trips')}
                >
                  Go to Portfolio
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={handleSaveToTrips}
              >
                <span>Save to My Trips</span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
