/**
 * Trip Service
 * Calculations for trip spending, category allocations, and projected run-rates.
 */

export const TRIP_CATEGORIES = [
  'Stay',
  'Food',
  'Transport',
  'Activities',
  'Shopping',
  'Other',
];

/**
 * Calculates trip spending metrics including projected spend based on days elapsed
 */
export const calculateTripMetrics = (trip, tripExpenses = []) => {
  const budget = Number(trip.budget) || 12000;
  const spent = tripExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const remaining = budget - spent;
  const progressPercent = Math.min(100, Math.round((spent / budget) * 100));

  // Category breakdown
  const categoryBreakdown = TRIP_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = 0;
    return acc;
  }, {});

  tripExpenses.forEach((e) => {
    const cat = e.category || 'Other';
    if (categoryBreakdown[cat] !== undefined) {
      categoryBreakdown[cat] += Number(e.amount || 0);
    } else {
      categoryBreakdown.Other += Number(e.amount || 0);
    }
  });

  // Calculate projected spend
  // If trip has days and daysElapsed or custom override
  const totalDays = Number(trip.days) || 4;
  const daysElapsed = Number(trip.daysElapsed) || (trip.status === 'Active' ? 2.5 : totalDays);
  
  let projectedSpend;
  if (trip.projectedSpendOverride !== undefined) {
    projectedSpend = Number(trip.projectedSpendOverride);
  } else if (daysElapsed > 0 && spent > 0) {
    const dailyBurnRate = spent / daysElapsed;
    projectedSpend = Math.round(dailyBurnRate * totalDays);
  } else {
    projectedSpend = spent || budget;
  }

  const isOverBudget = projectedSpend > budget;
  const overspendAmount = Math.max(0, projectedSpend - budget);

  return {
    budget,
    spent,
    remaining,
    progressPercent,
    projectedSpend,
    isOverBudget,
    overspendAmount,
    categoryBreakdown,
    dailyBurnRate: daysElapsed > 0 ? Math.round(spent / daysElapsed) : 0,
  };
};
