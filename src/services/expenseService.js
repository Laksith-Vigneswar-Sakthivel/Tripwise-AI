/**
 * Expense Service
 * Handles browser-side CSV import/export, filtering, sorting, and aggregations.
 */

/**
 * Parse CSV text into expense objects
 * Expected header: merchant,amount,category,date
 */
export const parseExpensesFromCsv = (csvText) => {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('CSV file must have a header row and at least one data row.');
  }

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const merchantIdx = header.indexOf('merchant');
  const amountIdx = header.indexOf('amount');
  const categoryIdx = header.indexOf('category');
  const dateIdx = header.indexOf('date');

  if (merchantIdx === -1 || amountIdx === -1) {
    throw new Error('CSV must contain "merchant" and "amount" columns.');
  }

  const parsed = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length <= Math.max(merchantIdx, amountIdx)) continue;

    const merchant = cols[merchantIdx] || 'Unknown Merchant';
    const amount = parseFloat(cols[amountIdx]);
    if (isNaN(amount) || amount <= 0) continue;

    const category = categoryIdx !== -1 && cols[categoryIdx] ? cols[categoryIdx] : 'Other';
    const date = dateIdx !== -1 && cols[dateIdx] ? cols[dateIdx] : new Date().toISOString().split('T')[0];

    parsed.push({
      id: `csv-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      merchant,
      amount,
      category,
      date,
    });
  }

  return parsed;
};

/**
 * Export expense array into a downloadable CSV string
 */
export const exportExpensesToCsv = (expenses = []) => {
  const headers = ['merchant', 'amount', 'category', 'date'];
  const rows = expenses.map((e) => [
    `"${(e.merchant || '').replace(/"/g, '""')}"`,
    e.amount || 0,
    `"${(e.category || 'Other').replace(/"/g, '""')}"`,
    `"${e.date || ''}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
};

/**
 * Filter and sort expenses
 */
export const filterAndSortExpenses = (
  expenses = [],
  { search = '', category = 'All', sortBy = 'date_desc', startDate = '', endDate = '' }
) => {
  return expenses
    .filter((item) => {
      // Search filter
      if (search) {
        const query = search.toLowerCase();
        const matchMerchant = (item.merchant || '').toLowerCase().includes(query);
        const matchCategory = (item.category || '').toLowerCase().includes(query);
        if (!matchMerchant && !matchCategory) return false;
      }

      // Category filter
      if (category && category !== 'All') {
        if (item.category !== category) return false;
      }

      // Date range filter
      if (startDate) {
        const itemDate = new Date(item.date).getTime();
        const start = new Date(startDate).getTime();
        if (!isNaN(itemDate) && !isNaN(start) && itemDate < start) return false;
      }

      if (endDate) {
        const itemDate = new Date(item.date).getTime();
        const end = new Date(endDate).getTime();
        if (!isNaN(itemDate) && !isNaN(end) && itemDate > end) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.date || 0) - new Date(a.date || 0);
      }
      if (sortBy === 'date_asc') {
        return new Date(a.date || 0) - new Date(b.date || 0);
      }
      if (sortBy === 'amount_desc') {
        return Number(b.amount || 0) - Number(a.amount || 0);
      }
      if (sortBy === 'amount_asc') {
        return Number(a.amount || 0) - Number(b.amount || 0);
      }
      return 0;
    });
};
