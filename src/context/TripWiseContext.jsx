import { generateRecoveryPlan } from '../services/aiFinanceService';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import { generateClient } from 'aws-amplify/data';
import { fetchUserAttributes } from 'aws-amplify/auth';

import {
  INITIAL_USER,
  INITIAL_EXPENSES,
  INITIAL_TRIPS,
  INITIAL_TRIP_EXPENSES,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';



const TripWiseContext = createContext();

const STORAGE_KEYS = {
  USER: 'tripwise_user_v2',
  EXPENSES: 'tripwise_expenses_v2',
  TRIPS: 'tripwise_trips_v2',
  TRIP_EXPENSES: 'tripwise_trip_expenses_v2',
  NOTIFICATIONS: 'tripwise_notifications_v2',
  THEME: 'tripwise_theme_v2',
};

// =========================================================
// PROVIDER
// =========================================================

export const TripWiseProvider = ({
  children,
  authUser,
}) => {
  const client = generateClient();
  // =========================================================
  // USER
  // =========================================================

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(
        STORAGE_KEYS.USER
      );

      return saved
        ? JSON.parse(saved)
        : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  // =========================================================
  // SYNC COGNITO PROFILE
  // =========================================================

  useEffect(() => {
    if (!authUser) return;

    let cancelled = false;

    const loadCognitoProfile = async () => {
      try {
        const attributes =
          await fetchUserAttributes();

        if (cancelled) return;

        const givenName =
          attributes?.given_name?.trim() || '';

        const familyName =
          attributes?.family_name?.trim() || '';

        const fullName =
          attributes?.name?.trim() || '';

        const email =
          attributes?.email?.trim() || '';

        let displayName = '';

        // 1. Cognito full name
        if (fullName) {
          displayName = fullName;
        }

        // 2. First + last name
        else if (
          givenName ||
          familyName
        ) {
          displayName = [
            givenName,
            familyName,
          ]
            .filter(Boolean)
            .join(' ');
        }

        // 3. Email username
        else if (email) {
          displayName = email
            .split('@')[0]
            .replace(/[._-]+/g, ' ')
            .replace(/\b\w/g, (char) =>
              char.toUpperCase()
            );
        }

        // 4. Safe fallback
        else {
          displayName = 'User';
        }

        setUser((prev) => ({
          ...prev,
          name: displayName,
          email:
            email ||
            prev.email ||
            '',
        }));
      } catch (error) {
        console.error(
          'Failed to load Cognito profile:',
          error
        );

        if (cancelled) return;

        // IMPORTANT:
        // Never display the Cognito UUID.
        setUser((prev) => ({
          ...prev,
          name:
            prev.name &&
            prev.name !== 'Laksith'
              ? prev.name
              : 'User',
        }));
      }
    };

    loadCognitoProfile();

    return () => {
      cancelled = true;
    };
  }, [authUser]);

  // =========================================================
  // THEME
  // =========================================================

  const [darkMode, setDarkMode] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            STORAGE_KEYS.THEME
          );

        return saved
          ? JSON.parse(saved)
          : true;
      } catch {
        return true;
      }
    });

  // =========================================================
  // NAVIGATION
  // =========================================================

  const [activePage, setActivePage] =
    useState('Overview');

  // =========================================================
  // EXPENSES
  // =========================================================

  const [expenses, setExpenses] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            STORAGE_KEYS.EXPENSES
          );

        return saved
          ? JSON.parse(saved)
          : INITIAL_EXPENSES;
      } catch {
        return INITIAL_EXPENSES;
      }
    });

  // =========================================================
  // TRIPS
  // =========================================================

  const [trips, setTrips] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            STORAGE_KEYS.TRIPS
          );

        return saved
          ? JSON.parse(saved)
          : INITIAL_TRIPS;
      } catch {
        return INITIAL_TRIPS;
      }
    });

  // =========================================================
  // ACTIVE TRIP
  // =========================================================

  const [activeTripId, setActiveTripId] =
    useState('trip-goa-2026');

  // =========================================================
  // TRIP EXPENSES
  // =========================================================

  const [tripExpenses, setTripExpenses] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            STORAGE_KEYS.TRIP_EXPENSES
          );

        return saved
          ? JSON.parse(saved)
          : INITIAL_TRIP_EXPENSES;
      } catch {
        return INITIAL_TRIP_EXPENSES;
      }
    });

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  const [notifications, setNotifications] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            STORAGE_KEYS.NOTIFICATIONS
          );

        return saved
          ? JSON.parse(saved)
          : INITIAL_NOTIFICATIONS;
      } catch {
        return INITIAL_NOTIFICATIONS;
      }
    });

  // =========================================================
  // MODALS / DRAWER
  // =========================================================

  const [
    isAddExpenseModalOpen,
    setIsAddExpenseModalOpen,
  ] = useState(false);

  const [
    isQuickSearchOpen,
    setIsQuickSearchOpen,
  ] = useState(false);

  const [
    editingExpense,
    setEditingExpense,
  ] = useState(null);

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  // =========================================================
  // TOASTS
  // =========================================================

  const [toasts, setToasts] =
    useState([]);

  // =========================================================
  // LOCAL STORAGE
  // =========================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(user)
      );
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.THEME,
        JSON.stringify(darkMode)
      );

      if (darkMode) {
        document.documentElement.classList.add(
          'dark'
        );

        document.documentElement.classList.remove(
          'light'
        );
      } else {
        document.documentElement.classList.add(
          'light'
        );

        document.documentElement.classList.remove(
          'dark'
        );
      }
    } catch {}
  }, [darkMode]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.EXPENSES,
        JSON.stringify(expenses)
      );
    } catch {}
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.TRIPS,
        JSON.stringify(trips)
      );
    } catch {}
  }, [trips]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.TRIP_EXPENSES,
        JSON.stringify(
          tripExpenses
        )
      );
    } catch {}
  }, [tripExpenses]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.NOTIFICATIONS,
        JSON.stringify(
          notifications
        )
      );
    } catch {}
  }, [notifications]);

  // =========================================================
// AWS CLOUD SYNC
// AWS IS THE SOURCE OF TRUTH
// =========================================================

useEffect(() => {
  if (!authUser) return;

  let cancelled = false;

  const loadCloudData = async () => {
    try {
      console.log('☁️ Loading TripWise data from AWS...');

      // =====================================================
      // EXPENSES
      // =====================================================

      const expenseResult =
        await client.models.Expense.list();

      if (
        !cancelled &&
        !expenseResult.errors?.length
      ) {
        const cloudExpenses =
          (expenseResult.data || []).map(
            (item) => ({
              id: item.id,

              merchant:
                item.description ||
                'Expense',

              amount:
                Number(item.amount || 0),

              category:
                item.category ||
                'Other',

              date:
                item.date ||
                new Date()
                  .toISOString()
                  .split('T')[0],

              notes:
                item.description ||
                '',

              tripId:
                item.tripId ||
                null,
            })
          );

        // AWS completely replaces local expense data
        setExpenses(cloudExpenses);

        console.log(
          `☁️ Loaded ${cloudExpenses.length} expenses from AWS`
        );
      }

      // =====================================================
      // TRIPS
      // =====================================================

      const tripResult =
        await client.models.Trip.list();

      let cloudTrips = [];

      if (
        !cancelled &&
        !tripResult.errors?.length
      ) {
        cloudTrips =
          (tripResult.data || []).map(
            (item) => ({
              id: item.id,

              title:
                item.title ||
                'Trip',

              destination:
                item.destination ||
                'Unknown',

              dates:
                item.startDate ||
                item.endDate ||
                'Upcoming',

              budget:
                Number(item.budget || 0),

              status:
                item.status ||
                'Upcoming',

              // UI fields not stored in AWS
              days: 3,
              nights: 2,
              monthYear: '2026',
              travelers: 1,

              // Will be calculated from TripExpense data
              spent: 0,

              daysElapsed: 0,

              image:
                'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',

              coverImage:
                'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',

              travelStyle:
                'Moderate',

              categoryAllocations:
                {},

              recoveryApplied:
                false,
            })
          );
      }

      // =====================================================
      // TRIP EXPENSES
      // =====================================================

      const tripExpenseResult =
        await client.models.TripExpense.list();

      let cloudTripExpenses = [];

      if (
        !cancelled &&
        !tripExpenseResult.errors?.length
      ) {
        cloudTripExpenses =
          tripExpenseResult.data || [];
      }

      // Build Trip Expense map from AWS only
      const syncedTripExpenses = {};

      cloudTripExpenses.forEach(
        (item) => {
          const tripId =
            item.tripId;

          if (!tripId) return;

          if (
            !syncedTripExpenses[tripId]
          ) {
            syncedTripExpenses[tripId] =
              [];
          }

          syncedTripExpenses[tripId].push({
            id: item.id,

            merchant:
              item.description ||
              'Trip Expense',

            amount:
              Number(item.amount || 0),

            category:
              item.category ||
              'Other',

            date:
              item.date ||
              new Date()
                .toISOString()
                .split('T')[0],

            notes:
              item.description ||
              '',
          });
        }
      );

      // AWS completely replaces local Trip Expense data
      setTripExpenses(
        syncedTripExpenses
      );

      // =====================================================
      // CALCULATE TRIP SPENDING FROM AWS
      // =====================================================

      const spentByTrip = {};

      cloudTripExpenses.forEach(
        (expense) => {
          const tripId =
            expense.tripId;

          if (!tripId) return;

          spentByTrip[tripId] =
            (spentByTrip[tripId] || 0) +
            Number(
              expense.amount || 0
            );
        }
      );

      // Apply AWS trip spending
      const finalTrips =
        cloudTrips.map(
          (trip) => ({
            ...trip,

            spent:
              spentByTrip[trip.id] ||
              0,
          })
        );

      // AWS completely replaces local Trips
      setTrips(finalTrips);

      console.log(
        `☁️ Loaded ${finalTrips.length} trips from AWS`
      );

      console.log(
        `☁️ Loaded ${cloudTripExpenses.length} trip expenses from AWS`
      );

      console.log(
        '☁️ TripWise AWS sync complete'
      );

    } catch (error) {
      console.error(
        '☁️ TripWise AWS sync failed:',
        error
      );
    }
  };

  loadCloudData();

  return () => {
    cancelled = true;
  };
}, [authUser]);

  // =========================================================
// AUTOMATIC MONTHLY BUDGET ALERTS
// =========================================================

useEffect(() => {
  const monthlyBudget = Number(user?.monthlyBudget || 10000);

  if (monthlyBudget <= 0) return;

  const totalSpent = expenses.reduce(
    (sum, expense) =>
      sum + Number(expense.amount || 0),
    0
  );

  const usagePercent =
    (totalSpent / monthlyBudget) * 100;

  // Current month key prevents old alerts from
  // blocking alerts in a new month.
  const monthKey = new Date()
    .toISOString()
    .slice(0, 7);

  let threshold = null;

  if (usagePercent >= 100) {
    threshold = 100;
  } else if (usagePercent >= 90) {
    threshold = 90;
  } else if (usagePercent >= 80) {
    threshold = 80;
  }

  if (!threshold) return;

  const notificationId =
    `monthly-budget-${monthKey}-${threshold}`;

  setNotifications((prev) => {
    const alreadyExists = prev.some(
      (notification) =>
        notification.id === notificationId
    );

    if (alreadyExists) {
      return prev;
    }

    let title;
    let message;
    let type;

    if (threshold >= 100) {
      title = 'Monthly Budget Exceeded';
      message = `You have spent ₹${Math.round(
        totalSpent
      ).toLocaleString(
        'en-IN'
      )} of your ₹${Math.round(
        monthlyBudget
      ).toLocaleString(
        'en-IN'
      )} monthly budget.`;
      type = 'danger';
    } else if (threshold >= 90) {
      title = '90% of Monthly Budget Used';
      message = `You have used ${Math.round(
        usagePercent
      )}% of your monthly budget. Only ₹${Math.max(
        0,
        Math.round(
          monthlyBudget - totalSpent
        )
      ).toLocaleString(
        'en-IN'
      )} remains.`;
      type = 'warning';
    } else {
      title = '80% of Monthly Budget Used';
      message = `You have used ${Math.round(
        usagePercent
      )}% of your monthly budget. ₹${Math.max(
        0,
        Math.round(
          monthlyBudget - totalSpent
        )
      ).toLocaleString(
        'en-IN'
      )} remains.`;
      type = 'warning';
    }

    return [
      {
        id: notificationId,
        title,
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ];
  });
}, [expenses, user?.monthlyBudget]);


  // =========================================================
  // TOAST
  // =========================================================

  const addToast = ({
    title,
    message,
    type = 'info',
  }) => {
    const id =
      `toast-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 4)}`;

    setToasts((prev) => [
      ...prev,
      {
        id,
        title,
        message,
        type,
      },
    ]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.filter(
          (toast) =>
            toast.id !== id
        )
      );
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) =>
      prev.filter(
        (toast) =>
          toast.id !== id
      )
    );
  };

  // =========================================================
// NOTIFICATION ACTIONS
// =========================================================

const markNotificationAsRead = (notificationId) => {
  setNotifications((prev) =>
    prev.map((notification) =>
      notification.id === notificationId
        ? {
            ...notification,
            unread: false,
          }
        : notification
    )
  );
};

const markAllNotificationsAsRead = () => {
  setNotifications((prev) =>
    prev.map((notification) => ({
      ...notification,
      unread: false,
    }))
  );
};

  // =========================================================
  // USER ACTIONS
  // =========================================================

  const updateUser = (
    updates
  ) => {
    setUser((prev) => ({
      ...prev,
      ...updates,
    }));

    addToast({
      title: 'Settings Saved',
      message:
        'Your profile and budget preferences have been updated.',
      type: 'success',
    });
  };

  const toggleTheme = () => {
    setDarkMode(
      (prev) => !prev
    );
  };

  // =========================================================
  // ADD EXPENSE
  // =========================================================

  const addExpense = async (expenseData) => {
  const localId = `exp-${Date.now()}`;

  const newExpense = {
    id: localId,

    merchant:
      expenseData.merchant ||
      'General Expense',

    amount:
      Number(expenseData.amount) || 0,

    category:
      expenseData.category ||
      'Food',

    date:
      expenseData.date ||
      new Date()
        .toISOString()
        .split('T')[0],

    paymentMethod:
      expenseData.paymentMethod ||
      'UPI',

    notes:
      expenseData.notes || '',
  };

  // Show immediately in the UI
  setExpenses((prev) => [
    newExpense,
    ...prev,
  ]);

  try {
    const {
      data,
      errors,
    } = await client.models.Expense.create({
      category:
        newExpense.category,

      amount:
        newExpense.amount,

      description:
        newExpense.notes ||
        newExpense.merchant,

      date:
        newExpense.date,

      tripId:
        expenseData.tripId ||
        null,
    });

    if (errors?.length) {
      console.error(
        'AWS Expense save failed:',
        errors
      );
    } else if (data?.id) {
      console.log(
        '✅ Expense saved to AWS',
        data
      );

      // IMPORTANT:
      // Replace temporary local ID with AWS ID
      setExpenses((prev) =>
        prev.map((expense) =>
          expense.id === localId
            ? {
                ...expense,
                id: data.id,
              }
            : expense
        )
      );
    }
  } catch (error) {
    console.error(
      'AWS Expense save failed:',
      error
    );
  }

  if (expenseData.tripId) {
    await addTripExpense(
      expenseData.tripId,
      {
        merchant:
          newExpense.merchant,

        amount:
          newExpense.amount,

        category:
          newExpense.category === 'Food'
            ? 'Food'
            : newExpense.category === 'Transport'
              ? 'Transport'
              : 'Shopping',

        date:
          newExpense.date,

        notes:
          newExpense.notes,
      }
    );
  }

  addToast({
    title: 'Expense Added',

    message: `Logged ${
      user.currency === 'INR'
        ? '₹'
        : '$'
    }${newExpense.amount} for ${
      newExpense.merchant
    }.`,

    type: 'success',
  });
};

  // =========================================================
  // EDIT EXPENSE
  // =========================================================

  const editExpense = async (id, updatedData) => {
  const existingExpense = expenses.find(
    (expense) => expense.id === id
  );

  if (!existingExpense) return;

  const updatedExpense = {
    ...existingExpense,
    ...updatedData,
    amount: Number(updatedData.amount),
  };

  // Update UI immediately
  setExpenses((prev) =>
    prev.map((expense) =>
      expense.id === id
        ? updatedExpense
        : expense
    )
  );

  try {
    const {
      data,
      errors,
    } = await client.models.Expense.update({
      id,

      category:
        updatedData.category ??
        existingExpense.category,

      amount:
        Number(
          updatedData.amount ??
          existingExpense.amount
        ),

      description:
        updatedData.notes ||
        updatedData.merchant ||
        existingExpense.notes ||
        existingExpense.merchant ||
        '',

      date:
        updatedData.date ??
        existingExpense.date,

      tripId:
        updatedData.tripId ??
        existingExpense.tripId ??
        null,
    });

    if (errors?.length) {
      console.error(
        'AWS Expense update failed:',
        errors
      );
    } else {
      console.log(
        '✅ Expense updated in AWS',
        data
      );
    }
  } catch (error) {
    console.error(
      'AWS Expense update failed:',
      error
    );
  }

  addToast({
    title: 'Expense Updated',
    message: `Changes saved for ${
      updatedData.merchant ||
      existingExpense.merchant
    }.`,
    type: 'success',
  });
};

  // =========================================================
  // DELETE EXPENSE
  // =========================================================

  const deleteExpense = async (id) => {
  const existingExpense = expenses.find(
    (expense) => expense.id === id
  );

  if (!existingExpense) return;

  // Remove immediately from UI
  setExpenses((prev) =>
    prev.filter(
      (expense) => expense.id !== id
    )
  );

  try {
    const {
      data,
      errors,
    } = await client.models.Expense.delete({
      id,
    });

    if (errors?.length) {
      console.error(
        'AWS Expense delete failed:',
        errors
      );
    } else {
      console.log(
        '🗑️ Expense deleted from AWS',
        data
      );
    }
  } catch (error) {
    console.error(
      'AWS Expense delete failed:',
      error
    );
  }

  addToast({
    title: 'Expense Removed',
    message:
      'The transaction has been deleted.',
    type: 'info',
  });
};

  // =========================================================
  // IMPORT EXPENSES
  // =========================================================

  const importExpenses = (
    importedList
  ) => {
    setExpenses((prev) => [
      ...importedList,
      ...prev,
    ]);

    addToast({
      title:
        'CSV Import Complete',

      message: `Successfully imported ${importedList.length} expenses into your ledger.`,

      type: 'success',
    });
  };

  // =========================================================
  // ADD TRIP
  // =========================================================

  const addTrip = async (
  tripData
) => {
  const localId = `trip-${Date.now()}`;

  const newTrip = {
    id: localId,

    destination:
      tripData.destination ||
      'New Destination',

    title:
      tripData.title ||
      `${tripData.destination} Trip`,

    days:
      Number(
        tripData.days
      ) || 3,

    nights: Math.max(
      1,
      (Number(
        tripData.days
      ) || 3) - 1
    ),

    dates:
      tripData.dates ||
      'Upcoming 2026',

    monthYear:
      tripData.monthYear ||
      '2026',

    travelers:
      Number(
        tripData.travelers
      ) || 1,

    budget:
      Number(
        tripData.budget
      ) || 10000,

    spent: 0,

    status: 'Upcoming',

    daysElapsed: 0,

    image:
      tripData.image ||
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',

    coverImage:
      tripData.image ||
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',

    travelStyle:
      tripData.travelStyle ||
      'Moderate',

    categoryAllocations:
      tripData.categoryAllocations ||
      {},

    recoveryApplied: false,
  };

  try {
    const {
      data,
      errors,
    } =
      await client.models.Trip.create({
        title:
          newTrip.title,

        destination:
          newTrip.destination,

        startDate:
          newTrip.dates,

        endDate:
          newTrip.dates,

        budget:
          newTrip.budget,

        status:
          newTrip.status,
      });

    if (errors?.length) {
      console.error(
        'AWS Trip save failed:',
        errors
      );
    } else if (data?.id) {
      console.log(
        '✅ Trip saved to AWS',
        data
      );

      // Replace temporary local ID with AWS ID
      newTrip.id = data.id;
    }
  } catch (error) {
    console.error(
      'AWS Trip save failed:',
      error
    );
  }

  setTrips((prev) => [
    newTrip,
    ...prev,
  ]);

  setTripExpenses((prev) => ({
    ...prev,
    [newTrip.id]: [],
  }));

  setActiveTripId(
    newTrip.id
  );

  addToast({
    title: 'Trip Created',

    message: `Planned ${
      newTrip.destination
    } with a budget of ₹${newTrip.budget.toLocaleString(
      'en-IN'
    )}.`,

    type: 'success',
  });
};
// =========================================================
  // ADD TRIP EXPENSE
  // =========================================================
const addTripExpense = async (
  tripId,
  expenseData
) => {
  const localId = `te-${Date.now()}`;

  const newEntry = {
    id: localId,

    merchant:
      expenseData.merchant ||
      'Trip Expense',

    amount:
      Number(expenseData.amount) || 0,

    category:
      expenseData.category ||
      'Food',

    date:
      expenseData.date ||
      new Date()
        .toISOString()
        .split('T')[0],

    notes:
      expenseData.notes || '',
  };

  setTripExpenses((prev) => {
    const current =
      prev[tripId] || [];

    return {
      ...prev,

      [tripId]: [
        newEntry,
        ...current,
      ],
    };
  });

  try {
    const {
      data,
      errors,
    } =
      await client.models.TripExpense.create({
        tripId,

        category:
          newEntry.category,

        amount:
          newEntry.amount,

        description:
          newEntry.notes ||
          newEntry.merchant,

        date:
          newEntry.date,
      });

    if (errors?.length) {
      console.error(
        'AWS Trip Expense save failed:',
        errors
      );
    } else if (data?.id) {
      console.log(
        '✅ Trip expense saved to AWS',
        data
      );

      setTripExpenses((prev) => ({
        ...prev,

        [tripId]:
          (prev[tripId] || []).map(
            (expense) =>
              expense.id === localId
                ? {
                    ...expense,
                    id: data.id,
                  }
                : expense
          ),
      }));
    }
  } catch (error) {
    console.error(
      'AWS Trip Expense save failed:',
      error
    );
  }

  setTrips((prev) =>
    prev.map((trip) => {
      if (trip.id === tripId) {
        return {
          ...trip,

          spent:
            (Number(trip.spent) || 0) +
            newEntry.amount,
        };
      }

      return trip;
    })
  );

  addToast({
    title:
      'Trip Expense Logged',

    message:
      `Added ₹${newEntry.amount} to trip ledger.`,

    type: 'success',
  });
};

// =========================================================
// DELETE TRIP
// =========================================================

const deleteTrip = async (tripId) => {
  if (!tripId) return;

  try {
    // 1. Find all expenses belonging to this trip
    const {
      data: tripExpenseRecords,
      errors: listErrors,
    } = await client.models.TripExpense.list({
      filter: {
        tripId: {
          eq: tripId,
        },
      },
    });

    if (listErrors?.length) {
      console.error(
        'AWS Trip Expense lookup failed:',
        listErrors
      );
    }

    // 2. Delete all Trip Expenses from AWS
    if (tripExpenseRecords?.length) {
      for (const expense of tripExpenseRecords) {
        const { errors } =
          await client.models.TripExpense.delete({
            id: expense.id,
          });

        if (errors?.length) {
          console.error(
            'AWS Trip Expense delete failed:',
            errors
          );
        }
      }
    }

    // 3. Delete the Trip itself from AWS
    const {
      data,
      errors,
    } = await client.models.Trip.delete({
      id: tripId,
    });

    if (errors?.length) {
      console.error(
        'AWS Trip delete failed:',
        errors
      );
      return;
    }

    console.log(
      '🗑️ Trip deleted from AWS',
      data
    );

    // 4. Remove Trip from local state
    setTrips((prev) =>
      prev.filter(
        (trip) => trip.id !== tripId
      )
    );

    // 5. Remove its Trip Expenses locally
    setTripExpenses((prev) => {
      const updated = {
        ...prev,
      };

      delete updated[tripId];

      return updated;
    });

    // 6. Choose another trip if the deleted one was active
    setActiveTripId((currentId) => {
      if (currentId !== tripId) {
        return currentId;
      }

      const remainingTrips =
        trips.filter(
          (trip) => trip.id !== tripId
        );

      return remainingTrips.length
        ? remainingTrips[0].id
        : null;
    });

    addToast({
      title: 'Trip Deleted',
      message:
        'Trip and its expenses were removed.',
      type: 'info',
    });

  } catch (error) {
    console.error(
      'AWS Trip delete failed:',
      error
    );
  }
};


  // =========================================================
  // DELETE TRIP EXPENSE
  // =========================================================

  const deleteTripExpense = async (
  tripId,
  expenseId
) => {
  const target =
    (
      tripExpenses[tripId] || []
    ).find(
      (expense) =>
        expense.id === expenseId
    );

  const amountToDeduct = target
    ? Number(target.amount)
    : 0;

  // Remove from UI immediately
  setTripExpenses((prev) => ({
    ...prev,

    [tripId]:
      (prev[tripId] || []).filter(
        (expense) =>
          expense.id !== expenseId
      ),
  }));

  // Update trip spending
  setTrips((prev) =>
    prev.map((trip) => {
      if (trip.id === tripId) {
        return {
          ...trip,

          spent: Math.max(
            0,
            (Number(trip.spent) || 0) -
              amountToDeduct
          ),
        };
      }

      return trip;
    })
  );

  try {
    const {
      data,
      errors,
    } =
      await client.models.TripExpense.delete({
        id: expenseId,
      });

    if (errors?.length) {
      console.error(
        'AWS Trip Expense delete failed:',
        errors
      );
    } else {
      console.log(
        '🗑️ Trip expense deleted from AWS',
        data
      );
    }
  } catch (error) {
    console.error(
      'AWS Trip Expense delete failed:',
      error
    );
  }

  addToast({
    title: 'Expense Deleted',

    message:
      'Trip expense was removed.',

    type: 'info',
  });
};
  // =========================================================
// AI RECOVERY
// =========================================================

const [monthlyRecoveryPlan, setMonthlyRecoveryPlan] = useState(null);

const applyRecoveryPlan = (tripId, recoveryPlan) => {
  setTrips((prev) =>
    prev.map((trip) => {
      if (trip.id === tripId) {
        return {
          ...trip,
          projectedSpendOverride: recoveryPlan.newProjectedSpend,
          recoveryApplied: true,
          recoveryDetails: recoveryPlan,
        };
      }

      return trip;
    })
  );

  addToast({
    title: 'AI Recovery Applied! 🚀',
    message: `Projected spend rebalanced to ₹${Number(
      recoveryPlan.newProjectedSpend || 0
    ).toLocaleString('en-IN')}. Budget protected!`,
    type: 'success',
  });
};

const resetRecoveryPlan = (tripId) => {
  setTrips((prev) =>
    prev.map((trip) => {
      if (trip.id === tripId) {
        return {
          ...trip,
          projectedSpendOverride: 13750,
          recoveryApplied: false,
          recoveryDetails: null,
        };
      }

      return trip;
    })
  );

  addToast({
    title: 'Recovery Reset',
    message: 'Reverted trip projection to unadjusted state.',
    type: 'info',
  });
};

// =========================================================
// MONTHLY EXPENSE RECOVERY
// =========================================================

const generateMonthlyRecoveryPlan = () => {
  const rawBudget = Number(user?.monthlyBudget);

  const monthlyBudget =
    Number.isFinite(rawBudget) && rawBudget > 0
      ? rawBudget
      : 10000;

  const totalSpent = expenses.reduce(
    (sum, expense) =>
      sum + Number(expense.amount || 0),
    0
  );

  // ------------------------------------------------------------
  // MONTHLY FORECAST
  // Treat the month as a 4-week spending cycle.
  // Example: September 21 = week 3, with week 4 remaining.
  // ------------------------------------------------------------

  const today = new Date();
  const dayOfMonth = today.getDate();

  const weeksElapsed = Math.min(
    4,
    Math.max(1, Math.ceil(dayOfMonth / 7))
  );

  const weeksRemaining = Math.max(
    0,
    4 - weeksElapsed
  );

  const weeklyAverage =
    weeksElapsed > 0
      ? totalSpent / weeksElapsed
      : totalSpent;

  const projectedSpend =
    totalSpent +
    weeklyAverage * weeksRemaining;

  const projectedOverspend = Math.max(
    0,
    projectedSpend - monthlyBudget
  );

  const remainingBudget = Math.max(
    0,
    monthlyBudget - totalSpent
  );

  const safeWeeklyLimit =
    weeksRemaining > 0
      ? remainingBudget / weeksRemaining
      : 0;

  // ------------------------------------------------------------
  // CATEGORY ANALYSIS
  // ------------------------------------------------------------

  const categoryTotals = expenses.reduce(
    (acc, expense) => {
      const category =
        expense.category || 'Other';

      acc[category] =
        (acc[category] || 0) +
        Number(expense.amount || 0);

      return acc;
    },
    {}
  );

  // Higher = easier to reduce.
  const priority = {
    Shopping: 1.0,
    Entertainment: 0.95,
    Travel: 0.9,
    Activities: 0.9,
    Other: 0.8,
    Transport: 0.65,
    Food: 0.55,
    Bills: 0.3,
    Healthcare: 0.15,
    Education: 0.15,
  };

  const recommendations = {
    Shopping: {
      action:
        'Pause non-essential shopping during the remaining week.',
      tip:
        'Use a 48-hour waiting rule before discretionary purchases.',
    },

    Entertainment: {
      action:
        'Reduce optional entertainment spending.',
      tip:
        'Prefer free activities until the month closes.',
    },

    Travel: {
      action:
        'Reduce non-essential travel spending.',
      tip:
        'Combine trips and use lower-cost transportation where practical.',
    },

    Activities: {
      action:
        'Reduce optional activities and outings.',
      tip:
        'Choose low-cost activities for the remaining week.',
    },

    Other: {
      action:
        'Reduce miscellaneous discretionary spending.',
      tip:
        'Track small purchases because they add up quickly.',
    },

    Transport: {
      action:
        'Reduce unnecessary cab and ride-hailing expenses.',
      tip:
        'Use public transport or shared rides where practical.',
    },

    Food: {
      action:
        'Control food delivery and restaurant spending.',
      tip:
        'Set a strict food limit for the remaining week.',
    },

    Bills: {
      action:
        'Avoid optional recurring expenses.',
      tip:
        'Review subscriptions before making another payment.',
    },

    Healthcare: {
      action:
        'Protect essential healthcare spending.',
      tip:
        'Only reduce optional healthcare purchases.',
    },

    Education: {
      action:
        'Protect essential education expenses.',
      tip:
        'Reduce only optional academic purchases.',
    },
  };

  // ------------------------------------------------------------
  // RECOVERY TARGET
  // ------------------------------------------------------------

  const recoveryNeeded = projectedOverspend;

  const recoveryCuts = [];

  let remainingRecovery = recoveryNeeded;

  const categories = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      priority:
        priority[category] ?? 0.7,
    }))
    .sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }

      return b.amount - a.amount;
    });

  // ------------------------------------------------------------
  // CATEGORY RECOVERY ALLOCATION
  // ------------------------------------------------------------

  for (const item of categories) {
    if (remainingRecovery <= 0) {
      break;
    }

    // Never recommend cutting more than 35%
    // of a category's historical spending.
    const maximumCut =
      Math.round(item.amount * 0.35);

    if (maximumCut <= 0) {
      continue;
    }

    const cutAmount = Math.min(
      maximumCut,
      remainingRecovery
    );

    const recommendation =
      recommendations[item.category] ||
      recommendations.Other;

    recoveryCuts.push({
      category: item.category,
      spent: item.amount,
      cutAmount,
      action: recommendation.action,
      tip: recommendation.tip,
    });

    remainingRecovery -= cutAmount;
  }

  // ------------------------------------------------------------
  // FALLBACK
  // ------------------------------------------------------------

  if (remainingRecovery > 0) {
    recoveryCuts.push({
      category: 'General Spending',
      spent: totalSpent,
      cutAmount: remainingRecovery,
      action:
        'Temporarily reduce discretionary spending across categories.',
      tip:
        'Keep remaining-week spending within the recommended limit.',
    });

    remainingRecovery = 0;
  }

  const totalRecovery =
    recoveryCuts.reduce(
      (sum, item) =>
        sum + Number(item.cutAmount || 0),
      0
    );

  const recoveryTarget =
    Math.max(
      monthlyBudget,
      projectedSpend - totalRecovery
    );

  const plan = {
    type: 'monthly',

    // IMPORTANT:
    // This is forecast-based, not simply
    // current-budget-overage based.
    isOverBudget:
      projectedOverspend > 0,

    monthlyBudget,

    totalSpent,

    weeksElapsed,

    weeksRemaining,

    weeklyAverage,

    projectedSpend,

    projectedOverspend,

    remainingBudget,

    safeWeeklyLimit,

    recoveryNeeded,

    totalRecovery,

    newProjectedSpend:
      projectedOverspend > 0
        ? monthlyBudget
        : projectedSpend,

    recoveryTarget,

    categoryTotals,

    recoveryCuts,

    summary:
      projectedOverspend > 0
        ? `At your current spending pace of ₹${Math.round(
            weeklyAverage
          ).toLocaleString(
            'en-IN'
          )} per week, you are projected to finish the month at approximately ₹${Math.round(
            projectedSpend
          ).toLocaleString(
            'en-IN'
          )}, which is ₹${Math.round(
            projectedOverspend
          ).toLocaleString(
            'en-IN'
          )} above your ₹${Math.round(
            monthlyBudget
          ).toLocaleString(
            'en-IN'
          )} budget. You have approximately ₹${Math.round(
            remainingBudget
          ).toLocaleString(
            'en-IN'
          )} available for the remaining week.`
        : `At your current spending pace, you are projected to remain within your ₹${Math.round(
            monthlyBudget
          ).toLocaleString(
            'en-IN'
          )} monthly budget.`,
  };

  setMonthlyRecoveryPlan(plan);

  return plan;
};

const applyMonthlyRecoveryPlan = (recoveryPlan) => {
  if (!recoveryPlan) return;

  setMonthlyRecoveryPlan({
    ...recoveryPlan,
    recoveryApplied: true,
  });

  addToast({
    title: 'Monthly AI Recovery Applied! 🚀',
    message: `Your recovery target is ₹${Number(
      recoveryPlan.newProjectedSpend || 0
    ).toLocaleString('en-IN')}.`,
    type: 'success',
  });
};

const resetMonthlyRecoveryPlan = () => {
  setMonthlyRecoveryPlan(null);

  addToast({
    title: 'Recovery Reset',
    message: 'Monthly budget recovery plan has been reset.',
    type: 'info',
  });
};

// =========================================================
// RESET DEMO DATA
// =========================================================

const resetDemoData = () => {
  setUser(INITIAL_USER);
  setExpenses(INITIAL_EXPENSES);
  setTrips(INITIAL_TRIPS);
  setTripExpenses(INITIAL_TRIP_EXPENSES);
  setNotifications(INITIAL_NOTIFICATIONS);

  setActiveTripId('trip-goa-2026');

  setDarkMode(true);

  setMonthlyRecoveryPlan(null);

  setEditingExpense(null);
  setIsAddExpenseModalOpen(false);
  setIsQuickSearchOpen(false);

  addToast({
    title: 'Demo Data Restored',
    message:
      'All balances, trips, notifications, and demo state have been reset.',
    type: 'info',
  });
};
  // =========================================================
  // PROVIDER
  // =========================================================

  return (
    <TripWiseContext.Provider
      value={{
        user,
        updateUser,

        darkMode,
        toggleTheme,

        activePage,
        setActivePage,

        expenses,
        addExpense,
        editExpense,
        deleteExpense,
        importExpenses,

        trips,
activeTripId,
setActiveTripId,
addTrip,
deleteTrip,

        tripExpenses,
        addTripExpense,
        deleteTripExpense,

        applyRecoveryPlan,
resetRecoveryPlan,

monthlyRecoveryPlan,
generateMonthlyRecoveryPlan,
applyMonthlyRecoveryPlan,
resetMonthlyRecoveryPlan,

        notifications,

markNotificationAsRead,
markAllNotificationsAsRead,

isAddExpenseModalOpen,
setIsAddExpenseModalOpen,

        isQuickSearchOpen,
        setIsQuickSearchOpen,

        editingExpense,
        setEditingExpense,

        mobileMenuOpen,
        setMobileMenuOpen,

        toasts,
        addToast,
        removeToast,

        resetDemoData,

        awsClient: client,
      }}
    >
      {children}
    </TripWiseContext.Provider>
  );
};



// =========================================================
// HOOK
// =========================================================

export const useTripWise = () => {
  const context =
    useContext(
      TripWiseContext
    );

  if (!context) {
    throw new Error(
      'useTripWise must be used within a TripWiseProvider'
    );
  }

  return context;
};