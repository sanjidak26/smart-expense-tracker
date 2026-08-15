import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Filter,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

const CATEGORIES = [
  'Salary',
  'Business',
  'Investments',
  'Food/Dining',
  'Utilities',
  'Rent/Mortgage',
  'Transportation',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Travel',
  'Education',
  'Others',
];

const Transactions = () => {
  const location = useLocation();
  const { addToast } = useToast();

  // Search & Filter State
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    category: 'all',
    startDate: '',
    endDate: '',
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: 'Food/Dining',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  // Load state from Dashboard quick actions if triggered
  useEffect(() => {
    if (location.state?.openAddModal) {
      setModalOpen(true);
    }
  }, [location.state]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', 10);

      if (filters.search) queryParams.append('search', filters.search);
      if (filters.type !== 'all') queryParams.append('type', filters.type);
      if (filters.category !== 'all') queryParams.append('category', filters.category);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const response = await api.get(`/transactions?${queryParams.toString()}`);
      setTransactions(response.data.transactions);
      setPages(response.data.pages);
      setTotal(response.data.total);
      setLoading(false);
    } catch (error) {
      console.error(error);
      addToast('Failed to fetch transactions', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters.type, filters.category]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      category: 'all',
      startDate: '',
      endDate: '',
    });
    setPage(1);
    addToast('Filters reset successfully', 'info');
  };

  // Open modal for Create
  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setForm({
      type: 'expense',
      amount: '',
      category: 'Food/Dining',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (tx) => {
    setEditingTransaction(tx);
    setForm({
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      date: new Date(tx.date).toISOString().split('T')[0],
      description: tx.description || '',
    });
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    // Set default category when switching type to match options
    if (name === 'type') {
      const defaultCategory = value === 'income' ? 'Salary' : 'Food/Dining';
      setForm({ ...form, type: value, category: defaultCategory });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      addToast('Please enter a valid amount greater than 0', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      if (editingTransaction) {
        // Edit transaction
        await api.put(`/transactions/${editingTransaction._id}`, form);
        addToast('Transaction updated successfully', 'success');
      } else {
        // Create transaction
        await api.post('/transactions', form);
        addToast('Transaction created successfully', 'success');
      }
      setModalOpen(false);
      fetchTransactions();
    } catch (error) {
      console.error(error);
      addToast(error.response?.data?.message || 'Error saving transaction', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/transactions/${id}`);
        addToast('Transaction deleted successfully', 'success');
        fetchTransactions();
      } catch (error) {
        console.error(error);
        addToast('Failed to delete transaction', 'error');
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      addToast('Preparing CSV download...', 'info');
      const response = await api.get('/transactions/export/csv', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast('CSV downloaded successfully', 'success');
    } catch (error) {
      console.error(error);
      addToast('CSV export failed', 'error');
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in print:p-0">

      {/* HEADER SECTION (HIDDEN ON PRINT) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Transaction History
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Create, search, filter and export your financial items.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-650 dark:text-slate-350 transition duration-200 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-655 dark:text-slate-350 transition duration-200 cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-650 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* FILTER PANEL (HIDDEN ON PRINT) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm print:hidden">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

            {/* Search Input */}
            <div className="md:col-span-4 relative group">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search description, category..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-brand-500 rounded-2xl py-2.5 pl-10 pr-4 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-450 outline-none transition"
              />
              <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-brand-500 transition-colors" />
            </div>

            {/* Type Filter */}
            <div className="md:col-span-2 select-container">
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 px-4 text-sm text-slate-700 dark:text-slate-200 outline-none transition cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="income">Incomes</option>
                <option value="expense">Expenses</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="md:col-span-2 select-container">
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 px-4 text-sm text-slate-700 dark:text-slate-200 outline-none transition cursor-pointer"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="md:col-span-2">
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 px-4 text-sm text-slate-500 dark:text-slate-300 outline-none transition cursor-pointer"
              />
            </div>

            {/* End Date */}
            <div className="md:col-span-2">
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 px-4 text-sm text-slate-500 dark:text-slate-300 outline-none transition cursor-pointer"
              />
            </div>

          </div>

          {/* Action buttons inside filter */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950 dark:hover:bg-brand-900 text-brand-600 dark:text-brand-400 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </button>
          </div>
        </form>
      </div>

      {/* PRINT BANNER (ONLY SHOWN WHEN PRINTING) */}
      <div className="hidden print:block mb-8 pb-4 border-b border-slate-200 text-center">
        <h1 className="text-3xl font-extrabold">Smart Expense Tracker</h1>
        <p className="text-slate-500 text-sm mt-1">Financial Statement & Transaction History Report</p>
        <p className="text-slate-400 text-xs mt-0.5">Report generated on: {new Date().toLocaleDateString()}</p>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-brand-600 dark:text-brand-400 animate-spin" />
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Retrieving logs...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2">
            <Search className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            <span className="text-sm font-semibold">No records found</span>
            <p className="text-xs text-slate-400 max-w-xs text-center leading-relaxed">
              We couldn't find any transactions. Try adjusting your search queries or filter selections.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6 text-right">Amount</th>
                  <th className="py-4 px-6 text-center print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {transactions.map((tx) => (
                  <tr
                    key={tx._id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors text-slate-700 dark:text-slate-350"
                  >
                    <td className="py-4.5 px-6 text-xs font-semibold whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-4.5 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${tx.type === 'income'
                          ? 'bg-gold/10 border-gold/20 text-gold-700 dark:text-gold-400'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                        {tx.type === 'income' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-sm font-semibold whitespace-nowrap">
                      {tx.category}
                    </td>
                    <td className="py-4.5 px-6 text-sm max-w-xs truncate">
                      {tx.description || <span className="text-slate-400 dark:text-slate-600 italic">No description</span>}
                    </td>
                    <td className={`py-4.5 px-6 text-sm font-bold text-right whitespace-nowrap ${tx.type === 'income' ? 'text-gold' : 'text-slate-800 dark:text-slate-100'
                      }`}>
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="py-4.5 px-6 text-center print:hidden whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(tx)}
                          className="p-1.5 text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-450 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION FOOTER (HIDDEN ON PRINT) */}
        {!loading && transactions.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-850/30 border-t border-slate-100 dark:border-slate-800/80 px-6 py-4 flex items-center justify-between print:hidden">
            <span className="text-xs text-slate-450 dark:text-slate-500 font-semibold">
              Showing {transactions.length} of {total} transactions
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-3">
                Page {page} of {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE/EDIT MODAL DIALOG (HIDDEN ON PRINT) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)} />

          {/* Form Card */}
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6.5 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">

              {/* Type selector (Segmented control style) */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200/40 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => handleFormChange({ target: { name: 'type', value: 'expense' } })}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${form.type === 'expense'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                    }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => handleFormChange({ target: { name: 'type', value: 'income' } })}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${form.type === 'income'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                    }`}
                >
                  Income
                </button>
              </div>

              {/* Amount Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-1">
                  Amount (INR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={form.amount}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-brand-500 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition"
                  required
                />
              </div>

              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-1">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm text-slate-700 dark:text-slate-200 outline-none transition cursor-pointer"
                >
                  {form.type === 'income' ? (
                    <>
                      <option value="Salary">Salary</option>
                      <option value="Business">Business</option>
                      <option value="Investments">Investments</option>
                      <option value="Others">Others</option>
                    </>
                  ) : (
                    CATEGORIES.filter(c => c !== 'Salary' && c !== 'Business' && c !== 'Investments').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))
                  )}
                </select>
              </div>

              {/* Date field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-1">
                  Transaction Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleFormChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm text-slate-500 dark:text-slate-200 outline-none transition cursor-pointer"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="e.g. Weekly groceries from supermarket"
                  rows="2"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-brand-500 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-650 hover:bg-brand-700 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Confirm</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Transactions;
