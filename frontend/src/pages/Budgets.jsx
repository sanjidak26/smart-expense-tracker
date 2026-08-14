import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Wallet,
  Plus,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Calendar,
  DollarSign,
  TrendingDown,
} from 'lucide-react';

const CATEGORIES = [
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

const Budgets = () => {
  const { addToast } = useToast();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [budgetsProgress, setBudgetsProgress] = useState([]);
  const [totals, setTotals] = useState({
    limit: 0,
    spent: 0,
    percentage: 0,
    isExceeded: false,
    isNearLimit: false,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    category: 'Food/Dining',
    limit: '',
  });

  const fetchBudgetProgress = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/budgets/progress?month=${selectedMonth}&year=${selectedYear}`);
      setBudgetsProgress(response.data.progress || []);
      setTotals(
        response.data.totals || {
          limit: 0,
          spent: 0,
          percentage: 0,
          isExceeded: false,
          isNearLimit: false,
        }
      );
      setLoading(false);
    } catch (error) {
      console.error(error);
      addToast('Failed to load budgets', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.limit || Number(form.limit) < 0) {
      addToast('Please enter a valid limit amount', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/budgets', {
        category: form.category,
        limit: Number(form.limit),
        month: selectedMonth,
        year: selectedYear,
      });

      addToast(`Budget for ${form.category} configured successfully`, 'success');
      setForm({ ...form, limit: '' });
      fetchBudgetProgress();
    } catch (error) {
      console.error(error);
      addToast('Error saving budget limit', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  // Generate lists of months & years
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  const getMonthName = (mNum) => {
    return new Date(2026, mNum - 1, 1).toLocaleDateString('en-US', { month: 'long' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      
      {/* LEFT COLUMN: BUDGET SETUP FORM & TOTAL CARD */}
      <div className="space-y-6 lg:col-span-1">
        
        {/* PERIOD SELECTOR */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-650" />
            <span>Select Budget Period</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-2 px-3 text-sm text-slate-700 dark:text-slate-250 outline-none cursor-pointer"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {getMonthName(m)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-2 px-3 text-sm text-slate-700 dark:text-slate-250 outline-none cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* BUDGET CREATOR FORM */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-brand-600" />
              <span>Set Category Budget</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Establish limits for {getMonthName(selectedMonth)} {selectedYear}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-450 pl-1">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleInputChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-455 pl-1">
                Budget Limit (USD)
              </label>
              <div className="relative group">
                <input
                  type="number"
                  name="limit"
                  value={form.limit}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-brand-500 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 outline-none transition"
                  required
                />
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-brand-500 transition-colors" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 bg-brand-650 hover:bg-brand-700 disabled:bg-slate-800 text-white font-bold text-sm rounded-2xl shadow-md transition duration-200 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Configuring...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4.5 h-4.5" />
                  <span>Apply Budget Limit</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* OVERALL BUDGET TOTAL STATS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">Monthly Summary</h3>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Total Limit
            </span>
          </div>

          <p className="text-3xl font-black text-slate-900 dark:text-slate-100">
            {formatCurrency(totals.limit)}
          </p>

          <div className="space-y-3 mt-5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-450 dark:text-slate-400">Total Spent</span>
              <span className="text-slate-850 dark:text-slate-200">{formatCurrency(totals.spent)}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  totals.isExceeded
                    ? 'bg-rose-500'
                    : totals.isNearLimit
                    ? 'bg-amber-500'
                    : 'bg-brand-600'
                }`}
                style={{ width: `${Math.min(100, totals.percentage)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-bold mt-1">
              <span className="text-slate-400 dark:text-slate-500">Usage: {totals.percentage.toFixed(0)}%</span>
              <span>
                {totals.isExceeded ? (
                  <span className="text-rose-500 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Exceeded
                  </span>
                ) : totals.isNearLimit ? (
                  <span className="text-amber-500 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Near Limit
                  </span>
                ) : (
                  <span className="text-emerald-500 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Within Budget
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: DETAILED CATEGORY LIST (2/3 width on desktop) */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col">
        <div className="mb-6">
          <h3 className="font-extrabold text-slate-850 dark:text-slate-100 text-lg">Category Budgets</h3>
          <p className="text-xs text-slate-450 dark:text-slate-400">
            Monitoring expenditures vs. limits set for {getMonthName(selectedMonth)} {selectedYear}
          </p>
        </div>

        {loading ? (
          <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-brand-600 dark:text-brand-400 animate-spin" />
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Calculating spends...</span>
          </div>
        ) : budgetsProgress.length === 0 ? (
          <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2.5">
            <Wallet className="w-12 h-12 text-slate-200 dark:text-slate-800" />
            <span className="text-sm font-semibold">No category budgets set</span>
            <p className="text-xs text-slate-400 max-w-xs text-center leading-relaxed">
              You haven't configured any category budgets for this month. Set budget limits on the left to start tracking thresholds.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgetsProgress.map((item) => (
              <div
                key={item._id}
                className={`p-5 rounded-2xl border transition hover:shadow-sm ${
                  item.isExceeded
                    ? 'border-rose-500/30 bg-rose-500/[0.02] dark:bg-rose-500/[0.04]'
                    : item.isNearLimit
                    ? 'border-amber-500/30 bg-amber-500/[0.02] dark:bg-amber-500/[0.04]'
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50/[0.3] dark:bg-slate-900/20'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-100">{item.category}</h4>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full text-[9px] font-extrabold uppercase border ${
                      item.isExceeded
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                        : item.isNearLimit
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {item.isExceeded ? 'Exceeded' : item.isNearLimit ? 'Near Limit' : 'Safe'}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-bold block">Percentage</span>
                    <span className={`text-base font-extrabold ${
                      item.isExceeded ? 'text-rose-500' : item.isNearLimit ? 'text-amber-500' : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {item.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200/50 dark:bg-slate-850 h-2 rounded-full overflow-hidden mb-3.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.isExceeded ? 'bg-rose-500' : item.isNearLimit ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-0.5">
                    Spent: <strong className="text-slate-700 dark:text-slate-350 font-extrabold">{formatCurrency(item.spent)}</strong>
                  </span>
                  <span>
                    Limit: <strong className="text-slate-750 dark:text-slate-300 font-extrabold">{formatCurrency(item.limit)}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Budgets;
