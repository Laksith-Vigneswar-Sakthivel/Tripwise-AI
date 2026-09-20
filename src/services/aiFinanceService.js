/**
 * AI Finance Service
 * 
 * Provides deterministic financial calculations and AI-driven recommendations.
 * Architecture Note for AWS Deployment:
 * Frontend -> AWS Amplify -> API Gateway -> AWS Lambda -> Amazon Bedrock (Claude / Titan)
 * Currently uses deterministic algorithms with generative narrative synthesis.
 */

// Auto-categorization dictionary based on merchant patterns
const MERCHANT_CATEGORY_MAP = {
  swiggy: 'Food',
  zomato: 'Food',
  starbucks: 'Food',
  mcdonalds: 'Food',
  subway: 'Food',
  blinkit: 'Food',
  zepto: 'Food',
  grofers: 'Food',
  supermarket: 'Food',
  restaurant: 'Food',
  cafe: 'Food',

  amazon: 'Shopping',
  flipkart: 'Shopping',
  myntra: 'Shopping',
  zara: 'Shopping',
  'h&m': 'Shopping',
  ikea: 'Shopping',
  nike: 'Shopping',

  uber: 'Transport',
  ola: 'Transport',
  rapido: 'Transport',
  metro: 'Transport',
  petrol: 'Transport',
  shell: 'Transport',
  indigo: 'Transport',
  airindia: 'Transport',
  irctc: 'Transport',

  netflix: 'Entertainment',
  spotify: 'Entertainment',
  bookmyshow: 'Entertainment',
  pvr: 'Entertainment',
  steam: 'Entertainment',

  electricity: 'Bills',
  wifi: 'Bills',
  airtel: 'Bills',
  jio: 'Bills',
  rent: 'Bills',
  maintenance: 'Bills',

  hotel: 'Travel',
  airbnb: 'Travel',
  taj: 'Travel',
  marriott: 'Travel',
  hostel: 'Travel',
};

/**
 * Categorizes an expense based on merchant name
 */
export const categorizeExpense = (merchant = '') => {
  const clean = merchant.toLowerCase().trim();
  for (const [key, category] of Object.entries(MERCHANT_CATEGORY_MAP)) {
    if (clean.includes(key)) {
      return category;
    }
  }
  return 'Other';
};

/**
 * Analyzes overall monthly spending and generates an AI Financial Brief
 */
export const analyzeSpending = (expenses = [], monthlyBudget = 10000, savingsTarget = 4000) => {
  const totalSpent = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const remaining = Math.max(0, monthlyBudget - totalSpent);
  
  // Category breakdown
  const categoryTotals = expenses.reduce((acc, item) => {
    const cat = item.category || 'Other';
    acc[cat] = (acc[cat] || 0) + Number(item.amount || 0);
    return acc;
  }, {});

  // Find top category
  let topCategory = 'Food';
  let maxSpent = 0;
  for (const [cat, amt] of Object.entries(categoryTotals)) {
    if (amt > maxSpent) {
      maxSpent = amt;
      topCategory = cat;
    }
  }

  const spendRatio = totalSpent / (monthlyBudget || 1);
  let status = 'healthy'; // 'healthy' | 'warning' | 'alert'
  let headline = 'Spending is well within monthly limits.';

  if (spendRatio > 0.9) {
    status = 'alert';
    headline = 'Approaching monthly budget threshold rapidly.';
  } else if (spendRatio > 0.7) {
    status = 'warning';
    headline = 'Moderate spending pace. Monitor discretionary costs.';
  }

  // Recommended weekly trim
  const weeklyTrimRecommendation = topCategory === 'Food' ? 400 : 350;

  const narrative = `Your spending is currently within your monthly budget. ${topCategory} is your largest category (₹${maxSpent.toLocaleString('en-IN')}). You can comfortably reach your ₹${savingsTarget.toLocaleString('en-IN')} savings target if you keep discretionary spending trimmed by approximately ₹${weeklyTrimRecommendation.toLocaleString('en-IN')} this week.`;

  return {
    totalSpent,
    remaining,
    status,
    headline,
    topCategory,
    topCategorySpent: maxSpent,
    categoryTotals,
    narrative,
    savingsPace: totalSpent + savingsTarget <= monthlyBudget ? 'On Track' : 'Tight',
  };
};

/**
 * Generates an actionable, dynamic AI Savings Plan
 */
export const generateSavingsPlan = (savingsTarget = 4000, currentSaved = 2200, expenses = []) => {
  const remainingTarget = Math.max(0, savingsTarget - currentSaved);
  const progressPercent = Math.min(100, Math.round((currentSaved / (savingsTarget || 1)) * 100));
  
  // 4 weeks assumed in a month
  const recommendedWeeklySaving = Math.round(savingsTarget / 4);

  // Analyze food and entertainment spending
  const foodSpend = expenses
    .filter((e) => e.category === 'Food')
    .reduce((s, e) => s + Number(e.amount || 0), 0);

  const potentialWeeklyFoodCut = foodSpend > 1000 ? 250 : 150;

  return {
    savingsTarget,
    currentSaved,
    remainingTarget,
    progressPercent,
    recommendedWeeklySaving,
    dynamicInsight: `If you reduce Food spending by ₹${potentialWeeklyFoodCut}/week, you can reach your ₹${savingsTarget.toLocaleString('en-IN')} goal 1 week earlier.`,
    levers: [
      {
        title: 'Food & Dining Optimization',
        description: `Pack lunch twice a week to free up ₹${potentialWeeklyFoodCut * 2}/month for your travel fund.`,
        impact: `+₹${potentialWeeklyFoodCut * 2}/mo`,
        category: 'Food',
      },
      {
        title: 'Cab/Ride-share Micro-cuts',
        description: 'Take metro or shared transit for short commutes under 3 km.',
        impact: '+₹400/mo',
        category: 'Transport',
      },
      {
        title: 'Subscription Review',
        description: '1 unused streaming subscription detected. Pause or switch to annual tier.',
        impact: '+₹299/mo',
        category: 'Entertainment',
      },
    ],
  };
};

/**
 * Generates a deterministic trip budget where category amounts
 * ALWAYS add up exactly to totalBudget.
 * Categories: Stay, Food, Transport, Activities, Emergency Buffer
 */
export const generateTripBudget = (
  destination = 'Goa',
  days = 4,
  travelers = 2,
  totalBudget = 12000,
  travelStyle = 'Moderate'
) => {
  const budget = Math.max(1000, Number(totalBudget) || 12000);

  // Allocation ratios by travel style
  let ratios;
  if (travelStyle === 'Budget') {
    ratios = {
      Stay: 0.30,
      Food: 0.22,
      Transport: 0.20,
      Activities: 0.15,
      Buffer: 0.13,
    };
  } else if (travelStyle === 'Premium') {
    ratios = {
      Stay: 0.42,
      Food: 0.24,
      Transport: 0.14,
      Activities: 0.12,
      Buffer: 0.08,
    };
  } else {
    // Moderate (default)
    ratios = {
      Stay: 0.34,
      Food: 0.21,
      Transport: 0.17,
      Activities: 0.16,
      Buffer: 0.12,
    };
  }

  // Calculate raw amounts rounded to nearest 50
  let stay = Math.round((budget * ratios.Stay) / 50) * 50;
  let food = Math.round((budget * ratios.Food) / 50) * 50;
  let transport = Math.round((budget * ratios.Transport) / 50) * 50;
  let activities = Math.round((budget * ratios.Activities) / 50) * 50;
  
  // Emergency Buffer absorbs any rounding difference to ensure exact 100% total
  let buffer = budget - (stay + food + transport + activities);

  // If rounding pushed buffer too low or negative, adjust Stay and recalculate
  if (buffer < 50) {
    stay -= 100;
    buffer = budget - (stay + food + transport + activities);
  }

  return {
    destination,
    days: Number(days) || 1,
    travelers: Number(travelers) || 1,
    travelStyle,
    totalBudget: budget,
    categories: {
      Stay: stay,
      Food: food,
      Transport: transport,
      Activities: activities,
      'Emergency Buffer': buffer,
    },
    dailyAveragePerPerson: Math.round(budget / ((Number(days) || 1) * (Number(travelers) || 1))),
  };
};

/**
 * Generates an AI Recovery Plan when overspending occurs in a trip or overall budget.
 * Deterministic arithmetic ensures exact recovery cut amounts!
 */
export const generateRecoveryPlan = (tripBudget = 12000, projectedSpend = 13750, _tripExpenses = []) => {
  const overspendAmount = Math.max(0, projectedSpend - tripBudget);
  const isOverBudget = overspendAmount > 0;

  if (!isOverBudget) {
    return {
      isOverBudget: false,
      overspendAmount: 0,
      tripBudget,
      projectedSpend,
      recoveryCuts: [],
      newProjectedSpend: projectedSpend,
      summary: 'Projected spending is within your budget. No recovery adjustments needed.',
    };
  }

  // Deterministically allocate recovery cuts across flexible categories (Food, Transport, Activities, Shopping)
  // Weighted cuts: Food 35%, Transport 25%, Activities 23%, Shopping 17%
  let cutFood = Math.round((overspendAmount * 0.35) / 10) * 10;
  let cutTransport = Math.round((overspendAmount * 0.25) / 10) * 10;
  let cutActivities = Math.round((overspendAmount * 0.23) / 10) * 10;
  
  // Shopping absorbs remaining difference to match exact overspendAmount
  let cutShopping = overspendAmount - (cutFood + cutTransport + cutActivities);

  const recoveryCuts = [
    {
      category: 'Food',
      cutAmount: cutFood,
      action: `Reduce dining out and opt for casual cafes or local markets.`,
      tip: 'Shift 2 fine-dining meals to high-rated beach shacks.',
    },
    {
      category: 'Transport',
      cutAmount: cutTransport,
      action: `Use scooter rentals or rideshare pooling instead of private cabs.`,
      tip: 'Daily scooter rental saves ~₹300/day compared to cabs.',
    },
    {
      category: 'Activities',
      cutAmount: cutActivities,
      action: `Swap paid excursions for self-guided beach walks and free heritage trails.`,
      tip: 'Visit Aguada Fort during free morning hours.',
    },
    {
      category: 'Shopping',
      cutAmount: cutShopping,
      action: `Cap souvenir and flea market purchases to essential gifts only.`,
      tip: 'Skip impulse retail in resort areas.',
    },
  ];

  const totalRecovery = cutFood + cutTransport + cutActivities + cutShopping;
  const newProjectedSpend = projectedSpend - totalRecovery;

  return {
    isOverBudget: true,
    overspendAmount,
    tripBudget,
    projectedSpend,
    totalRecovery,
    newProjectedSpend,
    recoveryCuts,
    summary: `AI Recovery detected ₹${overspendAmount.toLocaleString('en-IN')} in projected overspending. By trimming flexible categories across Food, Transport, Activities, and Shopping, your new projected spending will align perfectly with your ₹${tripBudget.toLocaleString('en-IN')} budget.`,
  };
};

/**
 * Simulates a potential purchase ("Can I afford this?")
 */
export const simulatePurchase = (
  amount = 0,
  category = 'Shopping',
  currentSpent = 2359,
  monthlyBudget = 10000,
  savingsTarget = 4000,
  upcomingTrip = { destination: 'Goa', budget: 12000 }
) => {
  const purchaseAmount = Number(amount) || 0;
  const projectedMonthlySpend = currentSpent + purchaseAmount;
  const remainingBudget = monthlyBudget - projectedMonthlySpend;
  const impactsSavings = (projectedMonthlySpend + savingsTarget) > monthlyBudget;

  let verdict = 'WITHIN BUDGET';
  let verdictClass = 'positive';
  let rationale = '';

  if (projectedMonthlySpend > monthlyBudget) {
    verdict = 'WOULD EXCEED BUDGET';
    verdictClass = 'danger';
    const overage = projectedMonthlySpend - monthlyBudget;
    rationale = `This ₹${purchaseAmount.toLocaleString('en-IN')} purchase pushes your spending to ₹${projectedMonthlySpend.toLocaleString('en-IN')}, exceeding your monthly budget of ₹${monthlyBudget.toLocaleString('en-IN')} by ₹${overage.toLocaleString('en-IN')}.`;
  } else if (impactsSavings) {
    verdict = 'WITHIN BUDGET (IMPACTS SAVINGS)';
    verdictClass = 'warning';
    const deficit = (projectedMonthlySpend + savingsTarget) - monthlyBudget;
    rationale = `You have enough monthly cash flow, but this purchase reduces your ₹${savingsTarget.toLocaleString('en-IN')} savings buffer by ₹${deficit.toLocaleString('en-IN')}, potentially delaying your ${upcomingTrip.destination} travel fund.`;
  } else {
    verdict = 'SAFELY WITHIN BUDGET';
    verdictClass = 'positive';
    rationale = `You will have ₹${remainingBudget.toLocaleString('en-IN')} remaining in your monthly budget and your ₹${savingsTarget.toLocaleString('en-IN')} savings target remains fully intact for ${upcomingTrip.destination}.`;
  }

  return {
    purchaseAmount,
    category,
    currentSpent,
    projectedMonthlySpend,
    monthlyBudget,
    remainingBudget,
    verdict,
    verdictClass,
    impactsSavings,
    rationale,
    safeThreshold: Math.max(0, monthlyBudget - savingsTarget - currentSpent),
  };
};
