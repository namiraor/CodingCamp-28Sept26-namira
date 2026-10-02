// Spendly – Expense & Budget Visualizer | Main Application Script

// ─── UTILITY FUNCTIONS ──────────────────────────────────────────────────────

/**
 * Generates a UUID v4 string.
 * Uses crypto.randomUUID() when available (modern browsers),
 * falls back to a manual Math.random()-based implementation for older browsers.
 *
 * @returns {string} A UUID v4 string, e.g. "a3f8c2d1-1234-4abc-8def-000000000001"
 * Requirements: 1.5
 */
function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Manual fallback: RFC 4122 version 4 UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Formats a number as Indonesian Rupiah currency string.
 * Uses "Rp" prefix, dot as thousands separator, and no decimal places.
 *
 * @param {number} amount - The numeric amount to format.
 * @returns {string} Formatted Rupiah string, e.g. 15000 → "Rp15.000"
 * Requirements: 2.4, 4.4, 7.2
 */
function formatRupiah(amount) {
  const rounded = Math.round(amount);
  // Build thousands-separated string using Indonesian locale conventions
  const parts = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return 'Rp' + parts;
}

/**
 * Validates the transaction form inputs.
 *
 * @param {string} description - The expense name (from text input).
 * @param {string|number} amount - The nominal amount (from number input).
 * @param {string} category - The selected category (from select dropdown).
 * @returns {{ valid: boolean, errors: { description?: string, amount?: string, category?: string } }}
 * Requirements: 1.2, 1.4, 1.7, 1.8, 1.9
 */
function validateForm(description, amount, category) {
  const VALID_CATEGORIES = ['Food', 'Transport', 'Fun'];
  const errors = {};

  // Validate description: must not be empty or whitespace-only
  if (!description || String(description).trim() === '') {
    errors.description = 'Nama pengeluaran wajib diisi';
  }

  // Validate amount: must be a number between 0.01 and 999999999.99 inclusive
  const numAmount = Number(amount);
  if (
    amount === '' ||
    amount === null ||
    amount === undefined ||
    isNaN(numAmount) ||
    numAmount < 0.01 ||
    numAmount > 999999999.99
  ) {
    errors.amount = 'Nominal harus berupa angka antara 0,01 dan 999.999.999,99';
  }

  // Validate category: must be one of the valid options
  if (!VALID_CATEGORIES.includes(category)) {
    errors.category = 'Kategori wajib dipilih';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Calculates the total sum of all transaction amounts.
 *
 * @param {Array<{amount: number}>} transactions - Array of transaction objects.
 * @returns {number} The total sum of all amounts, or 0 for an empty array.
 * Requirements: 4.1, 4.2, 4.3
 */
function calculateTotal(transactions) {
  if (!transactions || transactions.length === 0) return 0;
  return transactions.reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Aggregates transaction amounts grouped by category.
 * Only includes categories that have at least one transaction.
 *
 * @param {Array<{category: string, amount: number}>} transactions - Array of transaction objects.
 * @returns {{ [category: string]: number }} Object mapping category name to total amount.
 * Example: { "Food": 45000, "Transport": 20000 }
 * Requirements: 5.1, 5.2
 */
function aggregateByCategory(transactions) {
  if (!transactions || transactions.length === 0) return {};
  return transactions.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});
}

/**
 * Returns a new sorted copy of the transactions array based on the given sort option.
 * Does NOT mutate the input array.
 *
 * @param {Array<{date: string, amount: number, category: string}>} transactions - Array of transaction objects.
 * @param {'date-desc'|'amount-asc'|'amount-desc'|'category-asc'} sortOption - The sort order to apply.
 * @returns {Array} A new sorted array.
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */
function sortTransactions(transactions, sortOption) {
  if (!transactions || transactions.length === 0) return [];

  const copy = [...transactions];

  switch (sortOption) {
    case 'amount-asc':
      return copy.sort((a, b) => a.amount - b.amount);

    case 'amount-desc':
      return copy.sort((a, b) => b.amount - a.amount);

    case 'category-asc':
      return copy.sort((a, b) => a.category.localeCompare(b.category));

    case 'date-desc':
    default:
      // Sort by date string descending (ISO strings compare correctly lexicographically)
      return copy.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }
}

/**
 * Groups transactions by month and year, computing the total amount per month.
 * Returns groups sorted from newest to oldest. Months with no transactions are excluded.
 *
 * @param {Array<{date: string, amount: number}>} transactions - Array of transaction objects.
 * @returns {Array<{ label: string, total: number, key: string }>}
 *   Sorted array of monthly groups.
 *   - label: Indonesian month name + year, e.g. "Juli 2024"
 *   - total: Sum of all amounts for that month
 *   - key: "YYYY-MM" string for sorting
 * Requirements: 7.1, 7.4
 */
function groupByMonth(transactions) {
  const MONTH_NAMES_ID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  if (!transactions || transactions.length === 0) return [];

  // Aggregate totals per "YYYY-MM" key
  const monthMap = {};
  for (const tx of transactions) {
    const dateObj = new Date(tx.date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth(); // 0-indexed
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;

    if (!monthMap[key]) {
      monthMap[key] = {
        label: `${MONTH_NAMES_ID[month]} ${year}`,
        total: 0,
        key,
      };
    }
    monthMap[key].total += tx.amount;
  }

  // Convert to array and sort descending by key (newest first)
  return Object.values(monthMap).sort((a, b) => (a.key < b.key ? 1 : a.key > b.key ? -1 : 0));
}

// ─── STATE & CONSTANTS ───────────────────────────────────────────────────────

const CATEGORIES = ['Food', 'Transport', 'Fun'];

const CATEGORY_COLORS = {
  'Food':      '#FF6B6B',  // coral red
  'Transport': '#4ECDC4',  // teal
  'Fun':       '#FFE66D',  // yellow
};

let transactions = [];         // Array of Transaction objects — single source of truth
let currentSort = 'date-desc'; // Active sort option: 'date-desc' | 'amount-asc' | 'amount-desc' | 'category-asc'
let pendingDeleteId = null;    // ID of transaction awaiting delete confirmation

// Requirements: 8.5

// ─── STORAGE ──────────────────────────────────────────────────────────────────

/**
 * Displays a global error message banner.
 * The DOM element #global-error will be created in Task 4.
 * @param {string} message
 */
function showGlobalError(message) {
  const el = document.getElementById('global-error');
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  // Auto-hide after 5 seconds
  setTimeout(() => { el.hidden = true; }, 5000);
}

/**
 * Persists the current transactions array to localStorage as JSON.
 * Shows a global error banner if the save fails (e.g. storage full).
 * Requirements: 6.1, 6.2, 3.7
 */
function saveToStorage() {
  try {
    localStorage.setItem('spendly_transactions', JSON.stringify(transactions));
  } catch (e) {
    showGlobalError('Data tidak dapat disimpan. Penyimpanan lokal mungkin penuh.');
  }
}

/**
 * Loads transactions from localStorage.
 * Returns an empty array if no data found.
 * Clears corrupted data and returns empty array if JSON is invalid.
 * Requirements: 6.3, 6.4, 6.5
 */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem('spendly_transactions');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    localStorage.removeItem('spendly_transactions');
    showGlobalError('Data tersimpan tidak dapat dimuat dan telah dihapus.');
    return [];
  }
}

// ─── MUTATIONS ────────────────────────────────────────────────────────────────

/**
 * Creates a new transaction and adds it to state, then syncs storage and re-renders.
 * Requirements: 1.5, 7.5
 */
function addTransaction(description, amount, category) {
  const tx = {
    id: generateUUID(),
    description: String(description).trim(),
    amount: Number(amount),
    category,
    date: new Date().toISOString(),
  };
  transactions.push(tx);
  saveToStorage();
  renderAll();
}

/**
 * Removes the transaction with the given id from state, then syncs storage and re-renders.
 * Requirements: 3.3, 3.5, 3.6
 */
function deleteTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  saveToStorage();
  renderAll();
}

// ─── RENDER FUNCTIONS ─────────────────────────────────────────────────────────

/**
 * Renders the total balance/summary panel.
 */
function renderSummaryPanel() {
  const totalDisplay = document.getElementById('total-display');

  if (!totalDisplay) return;

  const total = calculateTotal(transactions);
  totalDisplay.textContent = formatRupiah(total);
}


/**
 * Renders the transaction list based on the current sort option.
 */
function renderTransactionList() {
  const transactionList = document.getElementById('transaction-list');
  const emptyMsg = document.getElementById('empty-msg');
  const sortControl = document.getElementById('sort-control');

  if (!transactionList) return;

  const sortedTransactions = sortTransactions(transactions, currentSort);

  transactionList.innerHTML = '';

  if (sortControl) {
    sortControl.value = currentSort;
  }

  if (sortedTransactions.length === 0) {
    if (emptyMsg) {
      emptyMsg.hidden = false;
    }
    return;
  }

  if (emptyMsg) {
    emptyMsg.hidden = true;
  }

  sortedTransactions.forEach((tx) => {
    const item = document.createElement('div');
    item.className = 'transaction-item';

    const date = new Date(tx.date);

    const formattedDate = date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    item.innerHTML = `
      <div class="transaction-info">
        <div class="transaction-name">${tx.description}</div>
        <div class="transaction-meta">
          <span class="transaction-category">${tx.category}</span>
          <span class="transaction-date">${formattedDate}</span>
        </div>
      </div>

      <div class="transaction-right">
        <span class="transaction-amount">${formatRupiah(tx.amount)}</span>
        <button
          type="button"
          class="btn-delete"
          data-id="${tx.id}"
          aria-label="Hapus ${tx.description}"
        >
          Hapus
        </button>
      </div>
    `;

    transactionList.appendChild(item);
  });
}


/**
 * Renders the pie chart and its legend.
 */
function renderPieChart() {
  const canvas = document.getElementById('pie-chart');
  const legend = document.getElementById('chart-legend');
  const emptyMsg = document.getElementById('chart-empty-msg');

  if (!canvas) return;

  const categoryTotals = aggregateByCategory(transactions);
  const entries = Object.entries(categoryTotals);

  // Clear previous chart and legend
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  if (legend) {
    legend.innerHTML = '';
  }

  // Show empty state when there are no transactions
  if (entries.length === 0) {
    canvas.hidden = true;

    if (emptyMsg) {
      emptyMsg.hidden = false;
    }

    return;
  }

  canvas.hidden = false;

  if (emptyMsg) {
    emptyMsg.hidden = true;
  }

  if (!ctx) return;

  const total = entries.reduce((sum, [, amount]) => sum + amount, 0);

  // Set canvas size
  const size = 300;
  canvas.width = size;
  canvas.height = size;

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = 110;

  let startAngle = -Math.PI / 2;

  entries.forEach(([category, amount]) => {
    const percentage = amount / total;
    const sliceAngle = percentage * Math.PI * 2;
    const endAngle = startAngle + sliceAngle;

    // Draw slice
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(
      centerX,
      centerY,
      radius,
      startAngle,
      endAngle
    );
    ctx.closePath();

    ctx.fillStyle = CATEGORY_COLORS[category] || '#999999';
    ctx.fill();

    // Small border between slices
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    startAngle = endAngle;

    // Render legend
    if (legend) {
      const legendItem = document.createElement('div');
      legendItem.className = 'chart-legend-item';

      const percentageText = (percentage * 100).toFixed(1);

      legendItem.innerHTML = `
        <span
          class="legend-color"
          style="background-color: ${CATEGORY_COLORS[category] || '#999999'}"
        ></span>
        <span class="legend-name">${category}</span>
        <span class="legend-percentage">${percentageText}%</span>
      `;

      legend.appendChild(legendItem);
    }
  });
}


/**
 * Renders the monthly spending summary.
 */
function renderMonthlySummary() {
  const monthlySummary = document.getElementById('monthly-summary');

  if (!monthlySummary) return;

  const monthlyGroups = groupByMonth(transactions);

  monthlySummary.innerHTML = '';

  if (monthlyGroups.length === 0) {
    monthlySummary.hidden = true;
    return;
  }

  monthlySummary.hidden = false;

  monthlyGroups.forEach((group) => {
    const item = document.createElement('div');
    item.className = 'monthly-summary-item';

    item.innerHTML = `
      <span class="monthly-label">${group.label}</span>
      <span class="monthly-total">${formatRupiah(group.total)}</span>
    `;

    monthlySummary.appendChild(item);
  });
}


/**
 * Renders all parts of the application.
 */
function renderAll() {
  renderSummaryPanel();
  renderTransactionList();
  renderPieChart();
  renderMonthlySummary();
}

// ─── EVENT HANDLERS ───────────────────────────────────────────────────────────

/**
 * Handles adding a new transaction.
 */
function handleAddTransaction() {
  const nameInput = document.getElementById('input-name');
  const amountInput = document.getElementById('input-amount');
  const categoryInput = document.getElementById('select-category');

  const errorName = document.getElementById('error-name');
  const errorAmount = document.getElementById('error-amount');
  const errorCategory = document.getElementById('error-category');

  const description = nameInput.value;
  const amount = amountInput.value;
  const category = categoryInput.value;

  const result = validateForm(description, amount, category);

  // Clear previous errors
  errorName.textContent = '';
  errorAmount.textContent = '';
  errorCategory.textContent = '';

  if (!result.valid) {
    if (result.errors.description) {
      errorName.textContent = result.errors.description;
    }

    if (result.errors.amount) {
      errorAmount.textContent = result.errors.amount;
    }

    if (result.errors.category) {
      errorCategory.textContent = result.errors.category;
    }

    return;
  }

  addTransaction(description, amount, category);

  // Reset form after successful addition
  nameInput.value = '';
  amountInput.value = '';
  categoryInput.value = '';

  nameInput.focus();
}


/**
 * Shows the delete confirmation dialog.
 */
function handleDeleteClick(id) {
  pendingDeleteId = id;

  const dialog = document.getElementById('confirm-dialog');

  if (dialog) {
    dialog.showModal();
  }
}


/**
 * Confirms and executes a transaction deletion.
 */
function handleConfirmDelete() {
  if (!pendingDeleteId) return;

  deleteTransaction(pendingDeleteId);

  pendingDeleteId = null;

  const dialog = document.getElementById('confirm-dialog');

  if (dialog) {
    dialog.close();
  }
}


/**
 * Cancels the delete confirmation.
 */
function handleCancelDelete() {
  pendingDeleteId = null;

  const dialog = document.getElementById('confirm-dialog');

  if (dialog) {
    dialog.close();
  }
}


/**
 * Handles transaction sorting.
 */
function handleSortChange(event) {
  currentSort = event.target.value;
  renderTransactionList();
}


/**
 * Toggles between light and dark mode.
 */
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.toggle('dark');

  localStorage.setItem(
    'spendly_theme',
    isDark ? 'dark' : 'light'
  );

  updateThemeIcon();
}


/**
 * Updates the theme toggle icon.
 */
function updateThemeIcon() {
  const toggleButton = document.getElementById('theme-toggle');

  if (!toggleButton) return;

  const isDark = document.documentElement.classList.contains('dark');

  const lightIcon = toggleButton.querySelector('.theme-icon-light');
  const darkIcon = toggleButton.querySelector('.theme-icon-dark');

  if (lightIcon) {
    lightIcon.hidden = isDark;
  }

  if (darkIcon) {
    darkIcon.hidden = !isDark;
  }
}

// ─── EVENT LISTENERS ──────────────────────────────────────────────────────────

function setupEventListeners() {
  const btnAdd = document.getElementById('btn-add');
  const transactionList = document.getElementById('transaction-list');
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');
  const btnCancelDelete = document.getElementById('btn-cancel-delete');
  const sortControl = document.getElementById('sort-control');
  const themeToggle = document.getElementById('theme-toggle');

  // Add transaction
  if (btnAdd) {
    btnAdd.addEventListener('click', handleAddTransaction);
  }

  // Delete transaction
  if (transactionList) {
    transactionList.addEventListener('click', (event) => {
      const deleteButton = event.target.closest('.btn-delete');

      if (!deleteButton) return;

      const id = deleteButton.dataset.id;

      if (id) {
        handleDeleteClick(id);
      }
    });
  }

  // Confirm delete
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', handleConfirmDelete);
  }

  // Cancel delete
  if (btnCancelDelete) {
    btnCancelDelete.addEventListener('click', handleCancelDelete);
  }

  // Sorting
  if (sortControl) {
    sortControl.addEventListener('change', handleSortChange);
  }

  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
}

// ─── INITIALIZATION ───────────────────────────────────────────────────────────

function initTheme() {
  const savedTheme = localStorage.getItem('spendly_theme');

  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    // Kalau belum pernah memilih tema, ikuti tema dari browser/device
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  updateThemeIcon();
}

function init() {
  // 1. Terapkan tema terlebih dahulu
  initTheme();

  // 2. Ambil data transaksi dari Local Storage
  transactions = loadFromStorage();

  // 3. Pasang semua event listener
  setupEventListeners();

  // 4. Tampilkan data ke halaman
  renderAll();
}

// Jalankan aplikasi setelah HTML selesai dimuat
document.addEventListener('DOMContentLoaded', init);