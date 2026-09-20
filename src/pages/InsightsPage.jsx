import React, { useMemo } from 'react';
import { useTripWise } from '../context/TripWiseContext';
import { PageHeader } from '../components/layout/PageHeader';
import { MetricCard } from '../components/common/MetricCard';
import { DonutChart } from '../components/charts/DonutChart';
import { SpendingBarChart } from '../components/charts/SpendingBarChart';
import { formatCurrency } from '../utils/formatters';
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Compass,
  ArrowUpRight,
  Lightbulb,
  PieChart,
} from 'lucide-react';

export const InsightsPage = () => {
  const { expenses, trips, user, setActivePage } = useTripWise();

  const totalSpent = useMemo(
    () => expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    [expenses]
  );

  const avgTx = useMemo(
    () => (expenses.length > 0 ? Math.round(totalSpent / expenses.length) : 0),
    [expenses, totalSpent]
  );

  // Category breakdown
  const categorySummary = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount || 0);
    });

    let topCat = 'Food';
    let maxAmt = 0;
    for (const [k, v] of Object.entries(map)) {
      if (v > maxAmt) {
        maxAmt = v;
        topCat = k;
      }
    }

    const donutData = Object.entries(map).map(([label, value]) => ({ label, value }));
    return { map, topCat, maxAmt, donutData };
  }, [expenses]);

  // Travel spending total across trips
  const totalTravelBudget = useMemo(
    () => trips.reduce((sum, t) => sum + (Number(t.budget) || 0), 0),
    [trips]
  );
  const totalTravelSpent = useMemo(
    () => trips.reduce((sum, t) => sum + (Number(t.spent) || 0), 0),
    [trips]
  );

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="ANALYTICS & PATTERNS"
        title="Financial Insights & Intelligence"
        subtitle="Deep pattern detection and automated behavioural storytelling powered by AI."
        isAiPowered
        actions={
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setActivePage('Simulator')}
          >
            <span>Run Purchase Simulator</span>
            <ArrowUpRight size={14} />
          </button>
        }
      />

      {/* 4 Summary Metrics */}
      <div className="metrics-grid">
        <MetricCard
          label="Top Spending Category"
          value={categorySummary.topCat}
          change={`${formatCurrency(categorySummary.maxAmt, user.currency)} total`}
          positive={false}
          icon={ShoppingBag}
        />
        <MetricCard
          label="Average Ticket Size"
          value={formatCurrency(avgTx, user.currency)}
          subtitle="Across recent transactions"
          icon={CreditCard}
        />
        <MetricCard
          label="Active Travel Allocations"
          value={formatCurrency(totalTravelSpent, user.currency)}
          change={`of ${formatCurrency(totalTravelBudget, user.currency)} committed`}
          positive={true}
          icon={Compass}
        />
        <MetricCard
          label="Savings Goal Ratio"
          value={`${Math.round(((user.currentSaved || 2200) / (user.savingsTarget || 4000)) * 100)}%`}
          subtitle={`${formatCurrency(user.currentSaved || 2200, user.currency)} accumulated`}
          positive={true}
          icon={TrendingUp}
        />
      </div>

      {/* Prominent AI Narrative Storytelling Cards */}
      <div className="insights-story-grid">
        <div className="story-card story-card-highlight">
          <div className="story-header">
            <div className="story-ai-tag">
              <Sparkles size={13} />
              <span>AI BEHAVIORAL DIAGNOSTIC</span>
            </div>
            <span className="story-time">Updated 15m ago</span>
          </div>
          <h3 className="story-title">
            "Your Food spending increased by 18% this month, mainly because of frequent small transactions."
          </h3>
          <p className="story-body">
            Analysis of 5 recent dining purchases indicates an average ticket size of ₹395. Micro-deliveries via Swiggy and Starbucks coffee runs represent 62% of your food outflow. Consolidating 2 small orders per week into batch meal prep will yield an estimated <strong>₹1,600/month</strong> towards your Kyoto trip fund.
          </p>
          <div className="story-footer">
            <span className="story-pill">Category: Food & Dining</span>
            <span className="story-pill">Impact: High</span>
          </div>
        </div>

        <div className="story-card">
          <div className="story-header">
            <div className="story-ai-tag">
              <Lightbulb size={13} />
              <span>TRAVEL SAVINGS VELOCITY</span>
            </div>
            <span className="story-time">Weekly Review</span>
          </div>
          <h3 className="story-title">
            "Your Goa trip fund is 55% funded with 4 weeks remaining."
          </h3>
          <p className="story-body">
            You are pacing 4 days ahead of schedule for your October vacation buffer. At your current weekly savings run-rate of ₹550/week, your personal contingency fund will reach ₹4,400 by departure date, completely covering your planned emergency buffer.
          </p>
          <div className="story-footer">
            <span className="story-pill">Fund: Goa Getaway</span>
            <span className="story-pill text-success">Healthy Velocity</span>
          </div>
        </div>
      </div>

      {/* Visual Charts: Donut + Spending Trend */}
      <div className="dashboard-two-col-grid">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">PORTFOLIO DIVERSIFICATION</span>
              <h3 className="panel-title">Category Outflows</h3>
            </div>
            <PieChart size={16} className="text-muted" />
          </div>
          <div className="panel-body">
            <DonutChart
              data={categorySummary.donutData}
              currency={user.currency}
              size={200}
              centerTitle="Outflow"
            />
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">TEMPORAL ANALYSIS</span>
              <h3 className="panel-title">Weekly Burn-Rate Pulse</h3>
            </div>
            <BarChart3 size={16} className="text-muted" />
          </div>
          <div className="panel-body">
            <SpendingBarChart
              data={[
                { label: 'Week 1', spent: 650, budget: 2500 },
                { label: 'Week 2', spent: 804, budget: 2500 },
                { label: 'Week 3', spent: 905, budget: 2500 },
                { label: 'Week 4 (Proj)', spent: 450, budget: 2500 },
              ]}
              currency={user.currency}
              height={180}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
