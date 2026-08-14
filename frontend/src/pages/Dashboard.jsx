import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Calendar,
  Sparkles,
  Loader2,
  ChevronRight,
  Activity,
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0,
    savings: 0,
    savingsRate: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiTip, setAiTip] = useState('');
  const [loadingTip, setLoadingTip] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch summary, transactions and budget progress in parallel
        const [summaryRes, transactionsRes, budgetsRes] = await Promise.all([
          api.get('/transactions/summary'),
          api.get('/transactions?limit=5'),
          api.get('/budgets/progress'),
        ]);

        setSummary(summaryRes.data);
        setRecentTransactions(transactionsRes.data.transactions);

        // Filter budgets that are near limit or exceeded
        const progressList = budgetsRes.data.progress || [];
        const alerts = progressList.filter((b) => b.isNearLimit || b.isExceeded);
        setBudgetAlerts(alerts);

        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        addToast('Failed to retrieve financial summary', 'error');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [addToast]);

  // Load a quick financial tip from AI or fallback
  useEffect(() => {
    const fetchAiTip = async () => {
      try {
        setLoadingTip(true);
        const res = await api.get('/ai/insights');
        
        // Extract a short summary line if AI insights exist, or use a default tip
        const mdText = res.data.insights || '';
        let tipLine = '';
        if (mdText.includes('###')) {
          // Parse a tip or show first bullet point
          const lines = mdText.split('\n');
          const bullet = lines.find(l => l.trim().startsWith('*') || l.trim().startsWith('-'));
          if (bullet) {
            tipLine = bullet.replace(/^[\s*-]+/, '').trim();
          }
        }
        
        setAiTip(tipLine || 'Save at least 20% of your salary first before deciding your monthly discretionary spending budgets.');
        setLoadingTip(false);
      } catch (error) {
        setAiTip('Pay yourself first. Put money into savings before paying bills or shopping.');
        setLoadingTip(false);
      }
    };

    fetchAiTip();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  const getCategoryColor = (category) => {
    const cats = {
      salary: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      food: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      dining: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      utilities: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      bills: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      rent: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      transport: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
      entertainment: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      shopping: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    };
    return cats[category.toLowerCase()] || 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-600 dark:text-brand-400 animate-spin" />
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading your summary...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Financial Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Your expense tracking overview at a glance.
          </p>
        </div>
        <button
          onClick={() => navigate('/transactions', { state: { openAddModal: true } })}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-650 hover:bg-brand-700 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg hover:shadow-brand-500/20 transition-all duration-200 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* AI INSIGHT CARD BAR */}
      <div className="bg-gradient-to-r from-brand-600/5 to-indigo-500/5 dark:from-brand-500/10 dark:to-indigo-500/10 border border-brand-500/25 dark:border-brand-500/15 rounded-3xl p-5 flex items-start gap-4">
        <div className="p-2.5 rounded-2xl bg-brand-600 dark:bg-brand-500 text-white shadow-md shadow-brand-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-extrabold text-brand-700 dark:text-brand-400 uppercase tracking-widest flex items-center gap-1.5">
            SmartFinance AI Tip
            {loadingTip && <Loader2 className="w-3 h-3 animate-spin text-brand-500" />}
          </h4>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
            "{aiTip}"
          </p>
        </div>
      </div>

      {/* CORE FINANCIAL COUNTER CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Balance Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-brand-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-2xl text-brand-600 dark:text-brand-400">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Net Wealth</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 truncate">
            {formatCurrency(summary.balance)}
          </p>
          <div className="flex items-center gap-1 mt-2.5">
            <div className={`text-xs font-bold flex items-center ${summary.balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              <Activity className="w-3.5 h-3.5 mr-1" />
              <span>Current Cash Balance</span>
            </div>
          </div>
        </div>

        {/* Income Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl text-emerald-500">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Inflow</span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 truncate">
            {formatCurrency(summary.income)}
          </p>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-2.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Total monthly income
          </p>
        </div>

        {/* Expense Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-rose-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl text-rose-500">
              <TrendingDown className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Outflow</span>
          </div>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-450 truncate">
            {formatCurrency(summary.expense)}
          </p>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-2.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Total monthly expenses
          </p>
        </div>

        {/* Savings Rate Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl text-indigo-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Savings Rate</span>
          </div>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 truncate">
            {summary.savingsRate}%
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, summary.savingsRate)}%` }}
            />
          </div>
        </div>

      </div>

      {/* ALERTS & RECENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RECENT TRANSACTIONS (2/3 width on desktop) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100">Recent Transactions</h3>
              <p className="text-xs text-slate-550 dark:text-slate-400">Your latest logged incomes and expenses</p>
            </div>
            <button
              onClick={() => navigate('/transactions')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-brand-600 dark:text-brand-400 hover:text-brand-700 transition cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            {recentTransactions.length === 0 ? (
              <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2">
                <Calendar className="w-8 h-8" />
                <span className="text-xs font-semibold">No recent transactions. Add one to start tracking!</span>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="flex items-center justify-between p-3.5 border border-slate-100 dark:border-slate-800/60 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border ${getCategoryColor(tx.category)}`}>
                        {tx.category}
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-slate-850 dark:text-slate-200 max-w-[150px] sm:max-w-xs truncate">
                          {tx.description || tx.category}
                        </h5>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                          {new Date(tx.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-sm font-bold flex items-center justify-end ${
                        tx.type === 'income' ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BUDGET PROGRESS WARNING ALERTS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="font-extrabold text-slate-855 dark:text-slate-100">Budget Indicators</h3>
            <p className="text-xs text-slate-450 dark:text-slate-400">Monitoring categories nearing or exceeding limits</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            {budgetAlerts.length === 0 ? (
              <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2 text-center px-4">
                <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full flex items-center justify-center text-emerald-500 mb-2">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350">All Budgets Safe</span>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
                  Excellent work! No categories have exceeded or are close to 85% of their budgets this month.
                </p>
              </div>
            ) : (
              budgetAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className={`p-4.5 rounded-2xl border ${
                    alert.isExceeded
                      ? 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-450'
                      : 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-450'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span className="text-sm font-extrabold">{alert.category}</span>
                    </div>
                    <span className="text-xs font-extrabold">
                      {alert.percentage.toFixed(0)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-slate-200/50 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        alert.isExceeded ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, alert.percentage)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] font-bold">
                    <span>Spent: {formatCurrency(alert.spent)}</span>
                    <span>Limit: {formatCurrency(alert.limit)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => navigate('/budgets')}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-2xl transition cursor-pointer"
          >
            <span>Configure Budgets</span>
          </button>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
