// ============================================
// Spendly – Expense & Budget Visualizer
// Main Application JavaScript
// ============================================

// ============================================
// Utility Functions
// ============================================

/**
 * Generate a unique ID for each transaction
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Format number as Indonesian Rupiah
 */
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Validate transaction form data
 */
function validateForm(description, amount, category) {
  const errors = {};

  if (!description || description.trim() === '') {
    errors.description = 'Expense name is required';
  }

  const numericAmount = Number(amount);

  if (
    amount === '' ||
    amount === null ||
    isNaN(numericAmount) ||
    numericAmount < 0.01 ||
    numericAmount > 999999999.99
  ) {
    errors.amount = 'Amount must be between 0.01 and 999,999,999.99';
  }

  const validCategories = ['Food', 'Transport', 'Fun'];

  if (!category || !validCategories.includes(category)) {
    errors.category = 'Category is required';
  }

  return errors;
}

/**
 * Calculate total expenses
 */
function calculateTotal(transactions) {
  return transactions.reduce((total, transaction) => {
    return total + Number(transaction.amount);
  }, 0);
}

/**
 * Group transactions by category
 */
function aggregateByCategory(transactions) {
  const result = {
    Food: 0,
    Transport: 0,
    Fun: 0
  };

  transactions.forEach(transaction => {
    if (result.hasOwnProperty(transaction.category)) {
      result[transaction.category] += Number(transaction.amount);
    }
  });

  return result;
}

/**
 * Sort transactions based on selected option
 */
function sortTransactions(transactions, sortOption) {
  const sorted = [...transactions];

  switch (sortOption) {
    case 'amount-desc':
      return sorted.sort((a, b) => Number(b.amount) - Number(a.amount));

    case 'amount-asc':
      return sorted.sort((a, b) => Number(a.amount) - Number(b.amount));

    case 'category-asc':
      return sorted.sort((a, b) => {
        return a.category.localeCompare(b.category);
      });

    case 'date-desc':
    default:
      return sorted.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
  }
}

/**
 * Group transactions by month
 */
const MONTH_NAMES_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

function groupByMonth(transactions) {
  const grouped = {};

  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const year = date.getFullYear();
    const month = date.getMonth();

    const key = `${year}-${String(month + 1).padStart(2, '0')}`;

    if (!grouped[key]) {
      grouped[key] = {
        year,
        month,
        label: `${MONTH_NAMES_EN[month]} ${year}`,
        total: 0
      };
    }

    grouped[key].total += Number(transaction.amount);
  });

  return Object.values(grouped).sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year;
    }

    return b.month - a.month;
  });
}


// ============================================
// Application State
// ============================================

const CATEGORIES = ['Food', 'Transport', 'Fun'];

const CATEGORY_COLORS = {
  Food: '#ff6384',
  Transport: '#36a2eb',
  Fun: '#ffcd56'
};

let transactions = [];
let currentSort = 'date-desc';
let pendingDeleteId = null;


// ============================================
// Local Storage
// ============================================

const STORAGE_KEY = 'spendly_transactions';

function showGlobalError(message) {
  const el = document.getElementById('global-error');

  if (!el) return;

  el.textContent = message;
  el.classList.remove('hidden');

  setTimeout(() => {
    el.classList.add('hidden');
  }, 5000);
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    showGlobalError(
      'Data could not be saved. Local storage may be full.'
    );
  }
}

function loadFromStorage() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (!savedData) {
      return [];
    }

    const parsedData = JSON.parse(savedData);

    if (!Array.isArray(parsedData)) {
      return [];
    }

    return parsedData;
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);

    showGlobalError(
      'Saved data could not be loaded and has been cleared.'
    );

    return [];
  }
}


// ============================================
// Transaction Mutations
// ============================================

function addTransaction(description, amount, category) {
  const transaction = {
    id: generateUUID(),
    description: description.trim(),
    amount: Number(amount),
    category,
    date: new Date().toISOString()
  };

  transactions.push(transaction);
  saveToStorage();
  renderAll();
}

function deleteTransaction(id) {
  transactions = transactions.filter(transaction => {
    return transaction.id !== id;
  });

  saveToStorage();
  renderAll();
}


// ============================================
// Render Summary
// ============================================

function renderSummaryPanel() {
  const totalDisplay = document.getElementById('total-display');

  if (!totalDisplay) return;

  const total = calculateTotal(transactions);

  totalDisplay.textContent = formatRupiah(total);
}


// ============================================
// Render Transaction List
// ============================================

function renderTransactionList() {
  const list = document.getElementById('transaction-list');
  const emptyMessage = document.getElementById('empty-msg');

  if (!list || !emptyMessage) return;

  const sortedTransactions = sortTransactions(
    transactions,
    currentSort
  );

  list.innerHTML = '';

  if (sortedTransactions.length === 0) {
    emptyMessage.classList.remove('hidden');
    return;
  }

  emptyMessage.classList.add('hidden');

  sortedTransactions.forEach(transaction => {
    const item = document.createElement('div');

    const date = new Date(transaction.date);

    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    item.className = 'transaction-item';

    item.innerHTML = `
      <div class="transaction-info">
        <div class="transaction-name">
          ${escapeHTML(transaction.description)}
        </div>

        <div class="transaction-meta">
          <span class="transaction-category ${transaction.category.toLowerCase()}">
            ${escapeHTML(transaction.category)}
          </span>

          <span class="transaction-date">
            ${formattedDate}
          </span>
        </div>
      </div>

      <div class="transaction-right">
        <div class="transaction-amount">
          ${formatRupiah(transaction.amount)}
        </div>

        <button
          type="button"
          class="btn-delete"
          data-id="${transaction.id}"
          aria-label="Delete ${escapeHTML(transaction.description)}"
        >
          Delete
        </button>
      </div>
    `;

    list.appendChild(item);
  });
}


// ============================================
// Escape HTML
// ============================================

function escapeHTML(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}


// ============================================
// Render Pie Chart
// ============================================

function renderPieChart() {
  const canvas = document.getElementById('pie-chart');
  const emptyMessage = document.getElementById('chart-empty-msg');
  const legend = document.getElementById('chart-legend');

  if (!canvas || !emptyMessage || !legend) return;

  const context = canvas.getContext('2d');

  context.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  legend.innerHTML = '';

  if (transactions.length === 0) {
    canvas.classList.add('hidden');
    emptyMessage.classList.remove('hidden');
    return;
  }

  canvas.classList.remove('hidden');
  emptyMessage.classList.add('hidden');

  const categoryData = aggregateByCategory(transactions);

  const total = Object.values(categoryData).reduce(
    (sum, value) => sum + value,
    0
  );

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 10;

  let startAngle = -Math.PI / 2;

  Object.entries(categoryData).forEach(([category, amount]) => {
    if (amount <= 0) return;

    const sliceAngle = (amount / total) * Math.PI * 2;
    const endAngle = startAngle + sliceAngle;

    context.beginPath();
    context.moveTo(centerX, centerY);

    context.arc(
      centerX,
      centerY,
      radius,
      startAngle,
      endAngle
    );

    context.closePath();
    context.fillStyle = CATEGORY_COLORS[category];
    context.fill();

    startAngle = endAngle;

    // Hitung persentase setiap kategori
    const percentage = ((amount / total) * 100).toFixed(1);

    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item';

    legendItem.innerHTML = `
      <span
        class="legend-color"
        style="background-color: ${CATEGORY_COLORS[category]}"
      ></span>

      <span class="legend-label">
        ${escapeHTML(category)}
      </span>

      <span class="legend-value">
        ${percentage}%
      </span>
    `;

    legend.appendChild(legendItem);
  });
}

// ============================================
// Render Monthly Summary
// ============================================

function renderMonthlySummary() {
  const container = document.getElementById('monthly-summary');

  if (!container) return;

  container.innerHTML = '';

  const monthlyData = groupByMonth(transactions);

  if (monthlyData.length === 0) {
    container.innerHTML = `
      <div class="monthly-empty">
        No transactions yet.
      </div>
    `;

    return;
  }

  monthlyData.forEach(monthData => {
    const item = document.createElement('div');

    item.className = 'monthly-item';

    item.innerHTML = `
      <div class="monthly-info">
        <span class="monthly-month">
          ${escapeHTML(monthData.label)}
        </span>
      </div>

      <div class="monthly-total">
        ${formatRupiah(monthData.total)}
      </div>
    `;

    container.appendChild(item);
  });
}


// ============================================
// Render All Components
// ============================================

function renderAll() {
  renderSummaryPanel();
  renderTransactionList();
  renderPieChart();
  renderMonthlySummary();
}


// ============================================
// Event Handlers
// ============================================

function handleAddTransaction(event) {
  event.preventDefault();

  const nameInput = document.getElementById('input-name');
  const amountInput = document.getElementById('input-amount');
  const categoryInput = document.getElementById('select-category');

  const errorName = document.getElementById('error-name');
  const errorAmount = document.getElementById('error-amount');
  const errorCategory = document.getElementById('error-category');

  const name = nameInput.value;
  const amount = amountInput.value;
  const category = categoryInput.value;

  const errors = validateForm(
    name,
    amount,
    category
  );

  errorName.textContent = errors.description || '';
  errorAmount.textContent = errors.amount || '';
  errorCategory.textContent = errors.category || '';

  if (errors.description) {
    nameInput.classList.add('input-error');
  } else {
    nameInput.classList.remove('input-error');
  }

  if (errors.amount) {
    amountInput.classList.add('input-error');
  } else {
    amountInput.classList.remove('input-error');
  }

  if (errors.category) {
    categoryInput.classList.add('input-error');
  } else {
    categoryInput.classList.remove('input-error');
  }

  if (Object.keys(errors).length > 0) {
    return;
  }

  addTransaction(
    name,
    amount,
    category
  );

  event.target.reset();

  errorName.textContent = '';
  errorAmount.textContent = '';
  errorCategory.textContent = '';

  nameInput.classList.remove('input-error');
  amountInput.classList.remove('input-error');
  categoryInput.classList.remove('input-error');

  nameInput.focus();
}

function handleDeleteClick(event) {
  const button = event.target.closest('.btn-delete');

  if (!button) return;

  pendingDeleteId = button.dataset.id;

  const dialog = document.getElementById('confirm-dialog');

  if (dialog) {
    dialog.showModal();
  }
}

function handleConfirmDelete() {
  if (!pendingDeleteId) return;

  deleteTransaction(pendingDeleteId);

  pendingDeleteId = null;

  const dialog = document.getElementById('confirm-dialog');

  if (dialog) {
    dialog.close();
  }
}

function handleCancelDelete() {
  pendingDeleteId = null;

  const dialog = document.getElementById('confirm-dialog');

  if (dialog) {
    dialog.close();
  }
}

function handleSortChange(event) {
  currentSort = event.target.value;

  renderTransactionList();
}


// ============================================
// Theme
// ============================================

function updateThemeIcon() {
  const lightIcon = document.querySelector('.theme-icon-light');
  const darkIcon = document.querySelector('.theme-icon-dark');

  if (!lightIcon || !darkIcon) return;

  const isDark = document.documentElement.classList.contains('dark');

  if (isDark) {
    lightIcon.classList.add('hidden');
    darkIcon.classList.remove('hidden');
  } else {
    lightIcon.classList.remove('hidden');
    darkIcon.classList.add('hidden');
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');

  localStorage.setItem(
    'spendly_theme',
    isDark ? 'dark' : 'light'
  );

  updateThemeIcon();
}

function initTheme() {
  const savedTheme = localStorage.getItem('spendly_theme');

  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    const prefersDark =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  updateThemeIcon();
}

// ============================================
// Event Listener Setup
// ============================================

function setupEventListeners() {
  const form = document.getElementById('transaction-form');

  if (form) {
    form.addEventListener(
      'submit',
      handleAddTransaction
    );
  }

  const transactionList =
    document.getElementById('transaction-list');

  if (transactionList) {
    transactionList.addEventListener(
      'click',
      handleDeleteClick
    );
  }

  const confirmButton =
    document.getElementById('btn-confirm-delete');

  if (confirmButton) {
    confirmButton.addEventListener(
      'click',
      handleConfirmDelete
    );
  }

  const cancelButton =
    document.getElementById('btn-cancel-delete');

  if (cancelButton) {
    cancelButton.addEventListener(
      'click',
      handleCancelDelete
    );
  }

  const sortControl =
    document.getElementById('sort-control');

  if (sortControl) {
    sortControl.addEventListener(
      'change',
      handleSortChange
    );
  }

  const themeToggle =
    document.getElementById('theme-toggle');

  if (themeToggle) {
    themeToggle.addEventListener(
      'click',
      toggleTheme
    );
  }

  const closeErrorButton =
    document.getElementById('btn-close-error');

  if (closeErrorButton) {
    closeErrorButton.addEventListener(
      'click',
      () => {
        const error =
          document.getElementById('global-error');

        if (error) {
          error.classList.add('hidden');
        }
      }
    );
  }
}


// ============================================
// Application Initialization
// ============================================

function init() {
  initTheme();

  transactions = loadFromStorage();

  setupEventListeners();

  renderAll();
}

document.addEventListener(
  'DOMContentLoaded',
  init
);