import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  PieChart as ChartIcon,
  Activity,
  Calendar,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const COLORS = [
  '#2563EB', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EC4899', // pink
  '#8B5CF6', // purple
  '#06B6D4', // cyan
  '#EF4444', // red
  '#14B8A6', // teal
  '#6366F1', // indigo
  '#F43F5E', // rose
];

const Analytics = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [timeRange, setTimeRange] = useState('180'); // last 6 months

  useEffect(() => {
    const fetchAllTransactions = async () => {
      try {
        setLoading(true);
        // Query up to 1000 transactions to perform client-side grouping
        const response = await api.get('/transactions?limit=1000');
        setTransactions(response.data.transactions || []);
        setLoading(false);
      } catch (error) {
        console.error(error);
        addToast('Failed to fetch transactions for analysis', 'error');
        setLoading(false);
      }
    };
    fetchAllTransactions();
  }, [addToast]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filter transactions by selected date range (last N days)
  const getFilteredTransactions = () => {
    if (timeRange === 'all') return transactions;
    
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(timeRange));
    return transactions.filter((tx) => new Date(tx.date) >= cutoff);
  };

  const filteredTxs = getFilteredTransactions();

  // 1. CHART DATA: Category breakdown (Expenses only)
  const getCategoryData = () => {
    const categoriesMap = {};
    filteredTxs
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        categoriesMap[tx.category] = (categoriesMap[tx.category] || 0) + tx.amount;
      });

    return Object.entries(categoriesMap)
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
      }))
      .sort((a, b) => b.value - a.value);
  };

  const categoryData = getCategoryData();

  // 2. CHART DATA: Monthly Inflow vs Outflow
  const getMonthlyData = () => {
    const monthsMap = {};
    
    // Process in chronological order (reverse the fetched transactions since they are desc)
    const sortedTxs = [...transactions].reverse();

    sortedTxs.forEach((tx) => {
      const date = new Date(tx.date);
      // Format as "MMM YY" (e.g. "Jan 26")
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const monthSortKey = date.getFullYear() * 12 + date.getMonth();

      if (!monthsMap[monthKey]) {
        monthsMap[monthKey] = {
          name: monthKey,
          Income: 0,
          Expense: 0,
          Savings: 0,
          sortKey: monthSortKey,
        };
      }

      if (tx.type === 'income') {
        monthsMap[monthKey].Income += tx.amount;
      } else {
        monthsMap[monthKey].Expense += tx.amount;
      }
    });

    // Convert map to array and sort chronologically
    return Object.values(monthsMap)
      .sort((a, b) => a.sortKey - b.sortKey)
      .map((item) => {
        const itemCopy = { ...item };
        itemCopy.Income = Math.round(itemCopy.Income);
        itemCopy.Expense = Math.round(itemCopy.Expense);
        itemCopy.Savings = Math.max(0, itemCopy.Income - itemCopy.Expense);
        delete itemCopy.sortKey;
        return itemCopy;
      })
      .slice(-6); // Limit to last 6 months
  };

  const monthlyData = getMonthlyData();

  // 3. CHART DATA: Income vs Expense Total
  const getOverallStructure = () => {
    let income = 0;
    let expense = 0;

    filteredTxs.forEach((tx) => {
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        expense += tx.amount;
      }
    });

    return [
      { name: 'Income', Value: Math.round(income) },
      { name: 'Expense', Value: Math.round(expense) },
    ];
  };

  const overallData = getOverallStructure();

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-600 dark:text-brand-400 animate-spin" />
        <span className="text-sm font-semibold text-slate-505 dark:text-slate-400">Analyzing transactions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* HEADER & TIME RANGE SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Financial Analytics
          </h1>
          <p className="text-slate-505 dark:text-slate-400 text-sm mt-0.5">
            Visualize income, expenses, and category trends.
          </p>
        </div>

        <div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 px-4 text-sm text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="30">Last 30 Days</option>
            <option value="90">Last 3 Months</option>
            <option value="180">Last 6 Months</option>
            <option value="365">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* TOP SUMMARY BAR */}
      {filteredTxs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-3">
          <AlertCircle className="w-10 h-10 text-slate-350 dark:text-slate-750" />
          <span className="text-sm font-semibold">Not enough transaction data</span>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Please log more transactions to unlock the analytical charts and cash flow visualizations.
          </p>
        </div>
      ) : (
        <>
          {/* CHARTS CONTAINER GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* MONTHLY TRENDS (AREA CHART) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col">
              <div className="mb-4">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-brand-650" />
                  <span>Monthly Inflow vs Outflow</span>
                </h3>
                <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">Historical comparison over the last 6 months</p>
              </div>
              
              <div className="flex-1 min-h-[300px] w-full text-xs">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="name" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Area type="monotone" dataKey="Income" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="Expense" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* INCOME VS EXPENSE SUMMARY (BAR CHART) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col">
              <div className="mb-4">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <span>Total Cash flow Summary</span>
                </h3>
                <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">Sum of total incomes versus total expenditures</p>
              </div>

              <div className="flex-1 min-h-[300px] w-full text-xs">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={overallData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="name" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="Value" radius={[12, 12, 0, 0]} maxBarSize={60}>
                      {overallData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#EF4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CATEGORY DONUT CHART */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col lg:col-span-2">
              <div className="mb-6">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <ChartIcon className="w-5 h-5 text-indigo-500" />
                  <span>Expense Category Distribution</span>
                </h3>
                <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">Breakdown of outbound payments by categories</p>
              </div>

              {categoryData.length === 0 ? (
                <div className="flex-1 py-12 text-center text-slate-400 font-semibold text-xs">
                  No expense records logged in this timeframe.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  
                  {/* Recharts Pie Component */}
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend breakdown list */}
                  <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-2">
                    {categoryData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between border-b border-slate-50 dark:border-slate-850/50 pb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{item.name}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>

                </div>
              )}
            </div>

          </div>
        </>
      )}

    </div>
  );
};

export default Analytics;
