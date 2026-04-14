import React, { useState, useEffect } from 'react';

import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  CreditCard, 
  Target, 
  ShoppingCart, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Trash2,
  CheckCircle2,
  Circle,
  PiggyBank,
  Activity,
  Utensils,
  Car,
  Home,
  Zap,
  Film,
  HeartPulse,
  BookOpen,
  ShoppingBag,
  Briefcase,
  LineChart as LineChartIcon,
  Store,
  Gift,
  Banknote,
  Star,
  Package,
  MoreHorizontal,
  Landmark,
  ArrowRight,
  Building2,
  Edit2,
  Repeat,
  Play,
  Pause,
  CalendarClock,
  FileText,
  Upload,
  Check,
  AlertCircle
} from 'lucide-react';

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [timeFilter, setTimeFilter] = useState('mensual');

  const expenseCategories = ['Alimentación', 'Transporte', 'Vivienda', 'Servicios', 'Entretenimiento', 'Salud', 'Educación', 'Otros'];
  const incomeCategories = ['Salario', 'Inversiones', 'Negocios', 'Regalos', 'Otros'];

  // --- ESTADO DE LA APLICACIÓN ---
const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem('mf_accounts');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Cuenta Corriente', type: 'Débito', initialBalance: 500000 },
      { id: 2, name: 'Tarjeta de Crédito', type: 'Crédito', initialBalance: 0 },
      { id: 3, name: 'Ahorros', type: 'Ahorro', initialBalance: 1200000 },
    ];
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('mf_transactions');
    return saved ? JSON.parse(saved) : [
      { id: 1, type: 'ingreso', amount: 1500000, date: '2026-04-01', description: 'Sueldo', category: 'Salario', accountId: 1 },
      { id: 2, type: 'gasto', amount: 45000, date: '2026-04-02', description: 'Supermercado', category: 'Alimentación', accountId: 1 },
      { id: 3, type: 'gasto', amount: 25000, date: '2026-04-03', description: 'Internet', category: 'Servicios', accountId: 2 },
    ];
  });

  const [subscriptions, setSubscriptions] = useState(() => {
    const saved = localStorage.getItem('mf_subscriptions');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Netflix', amount: 8000, category: 'Entretenimiento', accountId: 2, nextPaymentDate: '2026-04-15', isActive: true },
      { id: 2, name: 'Gimnasio', amount: 30000, category: 'Salud', accountId: 1, nextPaymentDate: '2026-04-05', isActive: true }, 
    ];
  });

  const [debts, setDebts] = useState(() => {
    const saved = localStorage.getItem('mf_debts');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Tarjeta de Crédito', totalAmount: 500000, paidAmount: 150000, dueDate: '2026-04-15' },
      { id: 2, name: 'Préstamo Auto', totalAmount: 3000000, paidAmount: 500000, dueDate: '2026-05-01' },
    ];
  });

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('mf_goals');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Fondo de Emergencia', targetAmount: 2000000, currentAmount: 500000 },
      { id: 2, name: 'Viaje a la playa', targetAmount: 800000, currentAmount: 200000 },
    ];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('mf_wishlist');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Zapatillas nuevas', price: 60000, priority: 'Alta', purchased: false },
      { id: 2, name: 'Monitor 27"', price: 180000, priority: 'Media', purchased: false },
    ];
  });

  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('mf_budgets');
    return saved ? JSON.parse(saved) : [];
  });

  // --- MOTOR DE PAGOS AUTOMÁTICOS ---
  // --- PERSISTENCIA EN LOCALSTORAGE ---
  useEffect(() => { localStorage.setItem('mf_accounts', JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem('mf_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('mf_subscriptions', JSON.stringify(subscriptions)); }, [subscriptions]);
  useEffect(() => { localStorage.setItem('mf_debts', JSON.stringify(debts)); }, [debts]);
  useEffect(() => { localStorage.setItem('mf_goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('mf_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('mf_budgets', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let hasChanges = false;
    let newTxs = [];
    
    const updatedSubs = subscriptions.map(sub => {
      let currentSub = { ...sub };
      let safetyCounter = 0; 
      
      while (currentSub.isActive && currentSub.nextPaymentDate <= todayStr && safetyCounter < 24) {
        hasChanges = true;
        safetyCounter++;
        
        newTxs.push({
          id: Date.now() + Math.random(),
          type: 'gasto',
          amount: currentSub.amount,
          description: `${currentSub.name} (Automático)`,
          category: currentSub.category,
          accountId: currentSub.accountId,
          date: currentSub.nextPaymentDate,
          isRecurring: true
        });
        
        const dateObj = new Date(currentSub.nextPaymentDate + 'T12:00:00'); 
        dateObj.setMonth(dateObj.getMonth() + 1);
        currentSub.nextPaymentDate = dateObj.toISOString().split('T')[0];
      }
      return currentSub;
    });

    if (hasChanges) {
      setTransactions(prev => [...prev, ...newTxs]);
      setSubscriptions(updatedSubs);
    }
  }, [subscriptions]);

  // --- FUNCIONES AUXILIARES ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  const getFilteredTransactions = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentMonthStr = todayStr.substring(0, 7);
    const currentYearStr = todayStr.substring(0, 4);

    return transactions.filter(t => {
      if (timeFilter === 'diario') return t.date === todayStr;
      if (timeFilter === 'mensual') return t.date.startsWith(currentMonthStr);
      if (timeFilter === 'anual') return t.date.startsWith(currentYearStr);
      return true;
    });
  };

  const filteredTransactions = getFilteredTransactions();
  
  const totalIncome = filteredTransactions.filter(t => t.type === 'ingreso').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'gasto').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const getAccountBalance = (accountId) => {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return 0;
    let bal = acc.initialBalance;
    transactions.forEach(t => {
      if (t.type === 'ingreso' && t.accountId === accountId) bal += t.amount;
      if (t.type === 'gasto' && t.accountId === accountId) bal -= t.amount;
      if (t.type === 'transferencia') {
        if (t.accountId === accountId) bal -= t.amount;
        if (t.targetAccountId === accountId) bal += t.amount;
      }
    });
    return bal;
  };

  const totalNetWorth = accounts.reduce((sum, acc) => sum + getAccountBalance(acc.id), 0);

  const categoryIcons = {
    'Alimentación': Utensils,
    'Transporte': Car,
    'Vivienda': Home,
    'Servicios': Zap,
    'Entretenimiento': Film,
    'Salud': HeartPulse,
    'Educación': BookOpen,
    'Salario': Briefcase,
    'Inversiones': LineChartIcon,
    'Negocios': Store,
    'Regalos': Gift,
    'Otros': MoreHorizontal,
    'Transferencia': ArrowRight
  };

  const getCategoryIcon = (categoryName, size = 14, className = "mr-1") => {
    const IconComponent = categoryIcons[categoryName] || ShoppingBag;
    return <IconComponent size={size} className={className} />;
  };


// --- EXPORTAR CSV ---
const exportToCSV = () => {
  const headers = ['Fecha', 'Tipo', 'Descripción', 'Categoría', 'Cuenta', 'Monto'];
  const rows = transactions.map(t => [
    t.date,
    t.type,
    t.description,
    t.category,
    accounts.find(a => a.id === t.accountId)?.name || '',
    t.amount
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mis-finanzas-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

  // --- COMPONENTES DE VISTAS ---

const DashboardView = () => {
    const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
    const totalGoalsTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
    const globalGoalsProgress = totalGoalsTarget > 0 ? (totalSaved / totalGoalsTarget) * 100 : 0;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    // --- DATOS PARA GRÁFICOS ---

    // 1. Torta: gastos por categoría (mes actual)
    const CHART_COLORS = ['#378ADD','#1D9E75','#D85A30','#BA7517','#7F77DD','#E24B4A','#888780','#D4537E'];
    const expenseByCategory = expenseCategories.map(cat => ({
      name: cat,
      value: filteredTransactions
        .filter(t => t.type === 'gasto' && t.category === cat)
        .reduce((s, t) => s + t.amount, 0)
    })).filter(d => d.value > 0);

    // 2. Barras: ingresos vs gastos últimos 6 meses
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const key = d.toISOString().substring(0, 7);
      const label = d.toLocaleString('es-CL', { month: 'short' });
      const ingresos = transactions.filter(t => t.type === 'ingreso' && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0);
      const gastos = transactions.filter(t => t.type === 'gasto' && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0);
      return { label, ingresos, gastos };
    });

    // 3. Línea: evolución del patrimonio mes a mes
    const patrimonioEvolution = last6Months.map(({ label }, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const key = d.toISOString().substring(0, 7);
      const netWorthAtMonth = accounts.reduce((sum, acc) => {
        let bal = acc.initialBalance;
        transactions.forEach(t => {
          if (t.date <= key + '-31') {
            if (t.type === 'ingreso' && t.accountId === acc.id) bal += t.amount;
            if (t.type === 'gasto' && t.accountId === acc.id) bal -= t.amount;
          }
        });
        return sum + bal;
      }, 0);
      return { label, patrimonio: netWorthAtMonth };
    });

    const formatM = (v) => `$${(v / 1000000).toFixed(1)}M`;
    const formatTooltip = (v) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(v);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Resumen</h2>
          <div className="flex bg-slate-200 p-1 rounded-lg">
            {['diario', 'mensual', 'anual'].map(f => (
              <button
                key={f}
                onClick={() => setTimeFilter(f)}
                className={`px-4 py-1 rounded-md text-sm font-medium capitalize transition-colors ${
                  timeFilter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center text-slate-500 mb-2">
              <Landmark className="w-5 h-5 mr-2" />
              <span>Patrimonio Total</span>
            </div>
            <span className={`text-2xl font-bold ${totalNetWorth >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
              {formatCurrency(totalNetWorth)}
            </span>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center text-slate-500 mb-2">
              <Wallet className="w-5 h-5 mr-2" />
              <span>Flujo {timeFilter}</span>
            </div>
            <span className={`text-2xl font-bold ${balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </span>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center text-emerald-500 mb-2">
              <TrendingUp className="w-5 h-5 mr-2" />
              <span>Ingresos</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">{formatCurrency(totalIncome)}</span>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center text-red-500 mb-2">
              <TrendingDown className="w-5 h-5 mr-2" />
              <span>Gastos</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">{formatCurrency(totalExpense)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Activity className="text-emerald-500" size={20} /> 
                Capacidad de Ahorro
              </h3>
              <span className={`text-sm font-bold px-2 py-1 rounded-full ${savingsRate >= 20 ? 'bg-emerald-100 text-emerald-700' : savingsRate > 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                {savingsRate.toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-3">
              {savingsRate >= 20 
                ? `¡Excelente! Estás guardando el ${savingsRate.toFixed(1)}% de tus ingresos en este periodo.`
                : savingsRate > 0 
                ? `Estás guardando el ${savingsRate.toFixed(1)}% de tus ingresos. Los expertos recomiendan apuntar al 20%.`
                : `Tus gastos superan tus ingresos este periodo. ¡Cuidado con el presupuesto!`}
            </p>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className={`h-2.5 rounded-full transition-all duration-1000 ${savingsRate >= 20 ? 'bg-emerald-500' : savingsRate > 0 ? 'bg-blue-500' : 'bg-red-500'}`} style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Target className="text-purple-500" size={20} /> 
                Progreso de Metas
              </h3>
              <span className="text-sm font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                {globalGoalsProgress.toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-3">
              Has acumulado {formatCurrency(totalSaved)} de tu objetivo total de {formatCurrency(totalGoalsTarget)}.
            </p>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-purple-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${globalGoalsProgress}%` }}></div>
            </div>
          </div>
        </div>

        {/* Tabla de Cuentas */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Building2 className="text-blue-500" size={20} /> Mis Cuentas
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 text-sm text-slate-500">
                  <th className="pb-3 font-medium">Cuenta</th>
                  <th className="pb-3 font-medium text-right">Ingresos ({timeFilter})</th>
                  <th className="pb-3 font-medium text-right">Gastos ({timeFilter})</th>
                  <th className="pb-3 font-medium text-right">Saldo Actual</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(acc => {
                   const accTransactions = filteredTransactions.filter(t => t.accountId === acc.id || t.targetAccountId === acc.id);
                   const accIn = accTransactions.filter(t => t.type === 'ingreso' && t.accountId === acc.id).reduce((s, t) => s + t.amount, 0);
                   const accOut = accTransactions.filter(t => t.type === 'gasto' && t.accountId === acc.id).reduce((s, t) => s + t.amount, 0);
                   return (
                     <tr key={acc.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-2">
                          <div className="font-semibold text-slate-800">{acc.name}</div>
                          <div className="text-xs text-slate-500">{acc.type}</div>
                        </td>
                        <td className="py-3 px-2 text-right text-emerald-600 font-medium">+{formatCurrency(accIn)}</td>
                        <td className="py-3 px-2 text-right text-red-600 font-medium">-{formatCurrency(accOut)}</td>
                        <td className="py-3 px-2 text-right font-bold text-slate-800">{formatCurrency(getAccountBalance(acc.id))}</td>
                     </tr>
                   )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* === GRÁFICOS === */}

        {/* Fila 1: Torta + Barras */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Torta: gastos por categoría */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-base font-bold text-slate-800 mb-1">Gastos por categoría</h3>
            <p className="text-xs text-slate-400 mb-4">Periodo: {timeFilter}</p>
            {expenseByCategory.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Sin gastos en este periodo.</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mb-4">
                  {expenseByCategory.map((entry, i) => (
                    <span key={entry.name} className="flex items-center gap-1 text-xs text-slate-500">
                      <span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}></span>
                      {entry.name}
                    </span>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {expenseByCategory.map((entry, i) => (
                        <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatTooltip(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </>
            )}
          </div>

          {/* Barras: ingresos vs gastos */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-base font-bold text-slate-800 mb-1">Ingresos vs Gastos</h3>
            <p className="text-xs text-slate-400 mb-4">Últimos 6 meses</p>
            <div className="flex gap-4 mb-4">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#1D9E75' }}></span>Ingresos
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#E24B4A' }}></span>Gastos
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={last6Months} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatM} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => formatTooltip(v)} />
                <Bar dataKey="ingresos" fill="#1D9E75" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gastos" fill="#E24B4A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Línea: evolución del patrimonio */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-800 mb-1">Evolución del patrimonio</h3>
          <p className="text-xs text-slate-400 mb-4">Últimos 6 meses — suma de todas las cuentas</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={patrimonioEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={formatM} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => formatTooltip(v)} />
              <Line
                type="monotone"
                dataKey="patrimonio"
                stroke="#378ADD"
                strokeWidth={2}
                dot={{ r: 4, fill: '#378ADD', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

{/* Últimas Transacciones */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Últimas Transacciones ({timeFilter})</h3>
          {filteredTransactions.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No hay movimientos en este periodo.</p>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.slice(0, 5).map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full flex-shrink-0 ${t.isRecurring ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                      {t.isRecurring ? <Repeat size={20}/> : getCategoryIcon(t.category, 20, "")}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 leading-tight">{t.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">{t.date}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="text-xs text-slate-500">{t.category}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="text-[10px] font-medium text-slate-600 flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-md">
                          <Building2 size={10}/> 
                          {t.type === 'transferencia' 
                            ? `${accounts.find(a => a.id === t.accountId)?.name || '?'} → ${accounts.find(a => a.id === t.targetAccountId)?.name || '?'}`
                            : accounts.find(a => a.id === t.accountId)?.name || '?'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`font-bold text-base whitespace-nowrap ml-2 ${t.type === 'ingreso' ? 'text-emerald-600' : t.type === 'transferencia' ? 'text-blue-600' : 'text-slate-800'}`}>
                    {t.type === 'ingreso' ? '+' : t.type === 'transferencia' ? '' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Proyección de ahorro */}
        {(() => {
          const months = Array.from({ length: 3 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (2 - i));
            const key = d.toISOString().substring(0, 7);
            const inc = transactions.filter(t => t.type === 'ingreso' && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0);
            const exp = transactions.filter(t => t.type === 'gasto' && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0);
            return inc - exp;
          });
          const avgSaving = months.reduce((s, m) => s + m, 0) / months.length;
          const proj3 = avgSaving * 3;
          const proj6 = avgSaving * 6;
          const proj12 = avgSaving * 12;
          return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
                <TrendingUp className="text-emerald-500" size={20} /> Proyección de Ahorro
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Basado en tu promedio de ahorro de los últimos 3 meses:{' '}
                <span className="font-bold text-slate-600">{formatCurrency(Math.round(avgSaving))}/mes</span>
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: '3 meses', value: proj3 },
                  { label: '6 meses', value: proj6 },
                  { label: '12 meses', value: proj12 }
                ].map(p => (
                  <div key={p.label} className={`p-4 rounded-xl text-center ${p.value >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <p className="text-xs text-slate-500 mb-1">{p.label}</p>
                    <p className={`text-lg font-black ${p.value >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {formatCurrency(Math.round(p.value))}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

      </div>
    );
  };

  const SubscriptionsView = () => {
    const [newSub, setNewSub] = useState({ 
      name: '', 
      amount: '', 
      category: 'Servicios', 
      accountId: accounts.length > 0 ? accounts[0].id : '', 
      nextPaymentDate: new Date().toISOString().split('T')[0] 
    });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const handleAdd = (e) => {
      e.preventDefault();
      if (!newSub.name || !newSub.amount || !newSub.accountId) return;
      setSubscriptions([...subscriptions, { ...newSub, id: Date.now(), amount: Number(newSub.amount), isActive: true, accountId: Number(newSub.accountId) }]);
      setNewSub({ ...newSub, name: '', amount: '' });
    };

    const toggleActive = (id) => {
      setSubscriptions(subscriptions.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
    };

    const handleDelete = (id) => {
      setSubscriptions(subscriptions.filter(s => s.id !== id));
    };

    const startEdit = (sub) => {
      setEditingId(sub.id);
      setEditForm(sub);
    };

    const saveEdit = () => {
      setSubscriptions(subscriptions.map(s => s.id === editingId ? { 
        ...editForm, 
        amount: Number(editForm.amount),
        accountId: Number(editForm.accountId)
      } : s));
      setEditingId(null);
    };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Gastos Fijos y Suscripciones</h2>
        <p className="text-slate-500 mb-4">La aplicación descontará automáticamente estos montos de tus cuentas cada mes en la fecha indicada.</p>
        
        <form onSubmit={handleAdd} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-3">
            <input type="text" placeholder="Nombre (ej. Netflix, Arriendo)" value={newSub.name} onChange={e => setNewSub({...newSub, name: e.target.value})} className="p-2 border rounded-lg flex-1 focus:ring-2 focus:ring-purple-500 outline-none" required />
            <input type="number" placeholder="Monto Mensual" value={newSub.amount} onChange={e => setNewSub({...newSub, amount: e.target.value})} className="p-2 border rounded-lg md:w-48 focus:ring-2 focus:ring-purple-500 outline-none" required min="1" />
          </div>
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <select value={newSub.category} onChange={e => setNewSub({...newSub, category: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none flex-1 w-full">
              {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={newSub.accountId} onChange={e => setNewSub({...newSub, accountId: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none flex-1 w-full" required>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <div className="flex w-full md:w-auto items-center gap-2">
              <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Cobrar el:</span>
              <input type="date" value={newSub.nextPaymentDate} onChange={e => setNewSub({...newSub, nextPaymentDate: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none w-full md:w-auto" required />
            </div>
            <button type="submit" className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 font-medium w-full md:w-auto px-6">
              <Plus size={20} /> Programar
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6">
          {subscriptions.map(sub => {
            if (editingId === sub.id) {
              return (
                <div key={sub.id} className="bg-white p-5 rounded-2xl shadow-sm border border-purple-300 flex flex-col gap-3">
                  <p className="text-sm font-bold text-purple-600 mb-1">Editando Gasto Fijo</p>
                  <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Nombre (ej. Netflix)" />
                  <input type="number" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Monto Mensual" />
                  <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                    {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={editForm.accountId} onChange={e => setEditForm({...editForm, accountId: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <input type="date" value={editForm.nextPaymentDate} onChange={e => setEditForm({...editForm, nextPaymentDate: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                  <div className="flex gap-2 mt-2">
                    <button onClick={saveEdit} className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">Guardar</button>
                    <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">Cancelar</button>
                  </div>
                </div>
              );
            }

            const accName = accounts.find(a => a.id === sub.accountId)?.name || 'Cuenta eliminada';
            return (
              <div key={sub.id} className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all flex flex-col ${sub.isActive ? 'border-slate-100 shadow-sm' : 'border-slate-200 bg-slate-50 opacity-75'}`}>
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2 sm:p-3 rounded-xl flex-shrink-0 mt-0.5 ${sub.isActive ? 'bg-purple-50 text-purple-600' : 'bg-slate-200 text-slate-500'}`}>
                      <Repeat className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold leading-snug truncate ${sub.isActive ? 'text-slate-800' : 'text-slate-500'}`}>{sub.name}</h3>
                      <span className="text-[10px] sm:text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full inline-block mt-1.5 truncate max-w-full">{sub.category}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => startEdit(sub)} className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors" title="Editar">
                      <Edit2 size={16}/>
                    </button>
                    <button onClick={() => toggleActive(sub.id)} className={`p-1.5 rounded-md transition-colors ${sub.isActive ? 'text-slate-400 hover:text-amber-500 hover:bg-amber-50' : 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100'}`} title={sub.isActive ? "Pausar" : "Reanudar"}>
                      {sub.isActive ? <Pause size={16}/> : <Play size={16}/>}
                    </button>
                    <button onClick={() => handleDelete(sub.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Eliminar">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-end pt-3 border-t border-slate-50 gap-2 mt-auto">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1 truncate"><CalendarClock size={12} className="flex-shrink-0"/> <span className="truncate">Próximo cobro</span></p>
                    <p className={`font-medium truncate ${sub.isActive ? 'text-slate-700' : 'text-slate-400'}`}>{sub.nextPaymentDate}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium leading-snug truncate">Desde: {accName}</p>
                  </div>
                  <p className={`text-lg sm:text-xl font-black flex-shrink-0 ${sub.isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                    {formatCurrency(sub.amount)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

const TransactionsView = () => {
    const [newTx, setNewTx] = useState({ 
      type: 'gasto', amount: '', description: '', date: new Date().toISOString().split('T')[0],
      category: 'Alimentación', accountId: accounts.length > 0 ? accounts[0].id : '', targetAccountId: accounts.length > 1 ? accounts[1].id : ''
    });
    const [categoryFilter, setCategoryFilter] = useState('Todas');
    const [periodFilter, setPeriodFilter] = useState('mes');
    const [specificDate, setSpecificDate] = useState(new Date().toISOString().split('T')[0]);
    const [specificMonth, setSpecificMonth] = useState(new Date().toISOString().substring(0, 7));
    const [editingTxId, setEditingTxId] = useState(null);
    const [editTxForm, setEditTxForm] = useState({});

    const handleTypeChange = (e) => {
      const newType = e.target.value;
      let newCategory = newType === 'gasto' ? 'Alimentación' : 'Salario';
      if (newType === 'transferencia') newCategory = 'Transferencia';
      setNewTx({...newTx, type: newType, category: newCategory});
    };

    const handleAdd = (e) => {
      e.preventDefault();
      if (!newTx.amount || !newTx.description || !newTx.accountId) return;
      if (newTx.type === 'transferencia' && newTx.accountId === newTx.targetAccountId) return;
      const newTransaction = { 
        ...newTx, id: Date.now(), amount: Number(newTx.amount), accountId: Number(newTx.accountId),
        targetAccountId: newTx.type === 'transferencia' ? Number(newTx.targetAccountId) : undefined
      };
      setTransactions([...transactions, newTransaction]);
      setNewTx({ ...newTx, amount: '', description: '', category: newTx.type === 'gasto' ? 'Alimentación' : newTx.type === 'transferencia' ? 'Transferencia' : 'Salario' });
    };

    const handleDelete = (id) => setTransactions(transactions.filter(t => t.id !== id));

    const saveEditTx = () => {
      setTransactions(transactions.map(t => t.id === editingTxId ? {
        ...editTxForm,
        amount: Number(editTxForm.amount),
        accountId: Number(editTxForm.accountId)
      } : t));
      setEditingTxId(null);
    };

    const availableCategories = newTx.type === 'gasto' ? expenseCategories : newTx.type === 'ingreso' ? incomeCategories : ['Transferencia'];
    const allUsedCategories = Array.from(new Set(transactions.map(t => t.category))).sort();
    
    const displayedTransactions = transactions
      .filter(t => categoryFilter === 'Todas' || t.category === categoryFilter)
      .filter(t => {
        if (periodFilter === 'todo') return true;
        if (periodFilter === 'dia') return t.date === specificDate;
        if (periodFilter === 'mes') return t.date.startsWith(specificMonth);
        return true;
      })
      .sort((a,b) => new Date(b.date) - new Date(a.date));

    const filteredIn = displayedTransactions.filter(t => t.type === 'ingreso').reduce((s, t) => s + t.amount, 0);
    const filteredOut = displayedTransactions.filter(t => t.type === 'gasto').reduce((s, t) => s + t.amount, 0);

    return (
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800">Transacciones</h2>
            <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors border border-emerald-200">
              <FileText size={16} /> Exportar CSV
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
            <div className="flex gap-2 flex-1 sm:flex-none">
              <select value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} className="p-2 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 flex-1 sm:w-auto font-medium">
                <option value="todo">Todo el tiempo</option>
                <option value="mes">Por Mes</option>
                <option value="dia">Por Día</option>
              </select>
              {periodFilter === 'mes' && (
                <input type="month" value={specificMonth} onChange={e => setSpecificMonth(e.target.value)} className="p-2 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 w-full sm:w-auto" />
              )}
              {periodFilter === 'dia' && (
                <input type="date" value={specificDate} onChange={e => setSpecificDate(e.target.value)} className="p-2 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 w-full sm:w-auto" />
              )}
            </div>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="p-2 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 flex-1 sm:min-w-[180px]">
              <option value="Todas">Todas las categorías</option>
              {allUsedCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        
        <form onSubmit={handleAdd} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-3">
            <input type="date" value={newTx.date} onChange={e => setNewTx({...newTx, date: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-auto" required />
            <select value={newTx.type} onChange={handleTypeChange} className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-auto font-medium">
              <option value="gasto">Gasto</option>
              <option value="ingreso">Ingreso</option>
              <option value="transferencia">Transferencia</option>
            </select>
            {newTx.type === 'transferencia' ? (
              <div className="flex flex-1 gap-2 items-center">
                <select value={newTx.accountId} onChange={e => setNewTx({...newTx, accountId: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none flex-1" required>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <ArrowRight className="text-slate-400 flex-shrink-0" size={20}/>
                <select value={newTx.targetAccountId} onChange={e => setNewTx({...newTx, targetAccountId: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none flex-1" required>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            ) : (
              <select value={newTx.accountId} onChange={e => setNewTx({...newTx, accountId: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none flex-1 md:w-auto" required>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            )}
            {newTx.type !== 'transferencia' && (
              <select value={newTx.category} onChange={e => setNewTx({...newTx, category: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-auto">
                {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <input type="text" placeholder="Descripción (ej. Compra supermercado)" value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} className="p-2 border rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 outline-none w-full" required />
            <input type="number" placeholder="Monto" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} className="p-2 border rounded-lg md:w-48 focus:ring-2 focus:ring-blue-500 outline-none w-full" required min="1"/>
            <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium w-full md:w-auto px-6">
              <Plus size={20} /> <span className="md:hidden lg:inline">Registrar</span>
            </button>
          </div>
        </form>

        <div className="flex justify-between items-center bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
          <span className="text-sm font-bold text-blue-800">Resumen de esta vista:</span>
          <div className="flex gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Ingresos</span>
              <span className="text-sm sm:text-base font-black text-emerald-600">+{formatCurrency(filteredIn)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Gastos</span>
              <span className="text-sm sm:text-base font-black text-red-600">-{formatCurrency(filteredOut)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {displayedTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No hay transacciones para mostrar.</div>
          ) : (
            displayedTransactions.map(t => (
              <div key={t.id}>
                {editingTxId === t.id ? (
                  <div className="p-4 border-b border-slate-100 bg-blue-50/40 flex flex-col gap-3">
                    <p className="text-sm font-bold text-blue-600">Editando transacción</p>
                    <div className="flex flex-col md:flex-row gap-3">
                      <input type="date" value={editTxForm.date} onChange={e => setEditTxForm({...editTxForm, date: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                      <input type="text" value={editTxForm.description} onChange={e => setEditTxForm({...editTxForm, description: e.target.value})} className="p-2 border rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Descripción" />
                      <input type="number" value={editTxForm.amount} onChange={e => setEditTxForm({...editTxForm, amount: e.target.value})} className="p-2 border rounded-lg md:w-40 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Monto" />
                    </div>
                    <div className="flex flex-col md:flex-row gap-3">
                      <select value={editTxForm.category} onChange={e => setEditTxForm({...editTxForm, category: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none flex-1">
                        {(editTxForm.type === 'gasto' ? expenseCategories : incomeCategories).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select value={editTxForm.accountId} onChange={e => setEditTxForm({...editTxForm, accountId: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none flex-1">
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                      <div className="flex gap-2">
                        <button onClick={saveEditTx} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Guardar</button>
                        <button onClick={() => setEditingTxId(null)} className="flex-1 bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">Cancelar</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full flex-shrink-0 bg-slate-100 ${t.isRecurring ? 'text-purple-600' : t.type === 'ingreso' ? 'text-emerald-600' : t.type === 'transferencia' ? 'text-blue-600' : 'text-slate-600'}`}>
                        {t.isRecurring ? <Repeat size={22}/> : getCategoryIcon(t.category, 22, "")}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-base leading-tight">{t.description}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-sm text-slate-500">{t.date}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="text-sm text-slate-500">{t.category}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Building2 size={12}/> 
                            {t.type === 'transferencia' 
                              ? `${accounts.find(a => a.id === t.accountId)?.name || '?'} → ${accounts.find(a => a.id === t.targetAccountId)?.name || '?'}`
                              : accounts.find(a => a.id === t.accountId)?.name || '?'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-lg whitespace-nowrap ${t.type === 'ingreso' ? 'text-emerald-600' : t.type === 'transferencia' ? 'text-blue-600' : 'text-slate-800'}`}>
                        {t.type === 'ingreso' ? '+' : t.type === 'transferencia' ? '' : '-'}{formatCurrency(t.amount)}
                      </span>
                      <button onClick={() => { setEditingTxId(t.id); setEditTxForm({...t}); }} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const AccountsView = () => {
    const [newAccount, setNewAccount] = useState({ name: '', type: 'Débito', initialBalance: '' });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const handleAdd = (e) => {
      e.preventDefault();
      if (!newAccount.name || !newAccount.initialBalance) return;
      setAccounts([...accounts, { ...newAccount, id: Date.now(), initialBalance: Number(newAccount.initialBalance) }]);
      setNewAccount({ name: '', type: 'Débito', initialBalance: '' });
    };

    const handleDelete = (id) => setAccounts(accounts.filter(a => a.id !== id));
    const startEdit = (acc) => { setEditingId(acc.id); setEditForm(acc); };
    const saveEdit = () => { setAccounts(accounts.map(a => a.id === editingId ? { ...editForm, initialBalance: Number(editForm.initialBalance) } : a)); setEditingId(null); };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Mis Cuentas</h2>
        <form onSubmit={handleAdd} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3">
          <input type="text" placeholder="Nombre (ej. Banco de Chile, BCI)" value={newAccount.name} onChange={e => setNewAccount({...newAccount, name: e.target.value})} className="p-2 border rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 outline-none" required />
          <select value={newAccount.type} onChange={e => setNewAccount({...newAccount, type: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="Débito">Débito</option> <option value="Crédito">Crédito</option> <option value="Ahorro">Ahorro</option> <option value="Efectivo">Efectivo</option> <option value="Prepago">Prepago</option>
          </select>
          <input type="number" placeholder="Saldo Inicial" value={newAccount.initialBalance} onChange={e => setNewAccount({...newAccount, initialBalance: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium">
            <Plus size={20} /> Crear
          </button>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6">
          {accounts.map(acc => {
            if (editingId === acc.id) {
              return (
                <div key={acc.id} className="bg-white p-5 rounded-2xl shadow-sm border border-blue-300 flex flex-col gap-3">
                  <p className="text-sm font-bold text-blue-600 mb-1">Editando Cuenta</p>
                  <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <select value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="Débito">Débito</option> <option value="Crédito">Crédito</option> <option value="Ahorro">Ahorro</option> <option value="Efectivo">Efectivo</option> <option value="Prepago">Prepago</option>
                  </select>
                  <input type="number" value={editForm.initialBalance} onChange={e => setEditForm({...editForm, initialBalance: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Saldo Inicial" />
                  <div className="flex gap-2 mt-2">
                    <button onClick={saveEdit} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Guardar</button>
                    <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">Cancelar</button>
                  </div>
                </div>
              );
            }
            const currentBalance = getAccountBalance(acc.id);
            return (
              <div key={acc.id} className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 transition-colors flex flex-col">
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 sm:p-3 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0 mt-0.5"><Landmark className="w-5 h-5" /></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 leading-tight truncate">{acc.name}</h3>
                      <span className="text-[10px] sm:text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full inline-block mt-1.5 truncate max-w-full">{acc.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => startEdit(acc)} className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"><Edit2 size={16}/></button>
                    <button onClick={() => handleDelete(acc.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16}/></button>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-50 mt-auto">
                  <p className="text-sm text-slate-500 mb-1">Saldo Actual</p>
                  <p className={`text-2xl font-black ${currentBalance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>{formatCurrency(currentBalance)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const DebtsView = () => {
    const [newDebt, setNewDebt] = useState({ name: '', totalAmount: '', dueDate: new Date().toISOString().split('T')[0] });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [paymentAmounts, setPaymentAmounts] = useState({});

    const handleAdd = (e) => {
      e.preventDefault();
      if (!newDebt.name || !newDebt.totalAmount) return;
      setDebts([...debts, { ...newDebt, id: Date.now(), totalAmount: Number(newDebt.totalAmount), paidAmount: 0 }]);
      setNewDebt({ name: '', totalAmount: '', dueDate: new Date().toISOString().split('T')[0] });
    };

    const startEdit = (debt) => { setEditingId(debt.id); setEditForm(debt); };
    const saveEdit = () => { setDebts(debts.map(d => d.id === editingId ? { ...editForm, totalAmount: Number(editForm.totalAmount) } : d)); setEditingId(null); };

    const addPayment = (id) => {
      const amount = Number(paymentAmounts[id]);
      if (!amount || amount <= 0) return;
      setDebts(debts.map(d => d.id === id ? { ...d, paidAmount: Math.min(d.totalAmount, d.paidAmount + amount) } : d));
      setPaymentAmounts({ ...paymentAmounts, [id]: '' });
    };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Deudas por Pagar</h2>
        <form onSubmit={handleAdd} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3">
          <input type="text" placeholder="Nombre de la deuda" value={newDebt.name} onChange={e => setNewDebt({...newDebt, name: e.target.value})} className="p-2 border rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 outline-none" required />
          <input type="number" placeholder="Monto Total" value={newDebt.totalAmount} onChange={e => setNewDebt({...newDebt, totalAmount: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required min="1" />
          <input type="date" value={newDebt.dueDate} onChange={e => setNewDebt({...newDebt, dueDate: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          <button type="submit" className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 font-medium"><Plus size={20} /> Nueva</button>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6">
          {debts.map(d => {
            if (editingId === d.id) {
              return (
                <div key={d.id} className="bg-white p-5 rounded-2xl shadow-sm border border-red-300 flex flex-col gap-3">
                  <p className="text-sm font-bold text-red-600 mb-1">Editando Deuda</p>
                  <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="Nombre" />
                  <input type="number" value={editForm.totalAmount} onChange={e => setEditForm({...editForm, totalAmount: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="Monto Total" />
                  <input type="date" value={editForm.dueDate} onChange={e => setEditForm({...editForm, dueDate: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                  <div className="flex gap-2 mt-2">
                    <button onClick={saveEdit} className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">Guardar</button>
                    <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">Cancelar</button>
                  </div>
                </div>
              );
            }
            const progress = (d.paidAmount / d.totalAmount) * 100;
            return (
              <div key={d.id} className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                <div className="flex justify-between mb-2 items-start gap-2">
                  <h3 className="font-bold text-slate-800 flex items-start gap-2 flex-1 min-w-0">
                    <Banknote className="text-red-500 flex-shrink-0 mt-0.5" size={18}/> 
                    <span className="leading-tight truncate">{d.name}</span>
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => startEdit(d)} className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"><Edit2 size={16}/></button>
                    <button onClick={() => setDebts(debts.filter(x => x.id !== d.id))} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16}/></button>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-slate-500 mb-4 mt-2 gap-2"><span className="truncate">Vence: {d.dueDate}</span><span className="flex-shrink-0">Falta: {formatCurrency(d.totalAmount - d.paidAmount)}</span></div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden mt-auto"><div className="bg-red-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div></div>
                <div className="flex justify-between text-xs text-slate-500 font-medium mb-4"><span>Pagado: {formatCurrency(d.paidAmount)}</span><span>Total: {formatCurrency(d.totalAmount)}</span></div>
                <div className="flex gap-2 mt-2">
                  <input type="number" placeholder="Monto a abonar" value={paymentAmounts[d.id] || ''} onChange={e => setPaymentAmounts({...paymentAmounts, [d.id]: e.target.value})} className="flex-1 p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none" min="1" />
                  <button onClick={() => addPayment(d.id)} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors whitespace-nowrap">+ Abono</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const GoalsView = () => {
    const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '' });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [savingAmounts, setSavingAmounts] = useState({});

    const handleAdd = (e) => {
      e.preventDefault();
      if (!newGoal.name || !newGoal.targetAmount) return;
      setGoals([...goals, { ...newGoal, id: Date.now(), targetAmount: Number(newGoal.targetAmount), currentAmount: 0 }]);
      setNewGoal({ name: '', targetAmount: '' });
    };

    const startEdit = (goal) => { setEditingId(goal.id); setEditForm(goal); };
    const saveEdit = () => { setGoals(goals.map(g => g.id === editingId ? { ...editForm, targetAmount: Number(editForm.targetAmount) } : g)); setEditingId(null); };

    const addSaving = (id) => {
      const amount = Number(savingAmounts[id]);
      if (!amount || amount <= 0) return;
      setGoals(goals.map(g => g.id === id ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) } : g));
      setSavingAmounts({ ...savingAmounts, [id]: '' });
    };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Ahorros y Objetivos</h2>
        <form onSubmit={handleAdd} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3">
          <input type="text" placeholder="¿Qué quieres lograr?" value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} className="p-2 border rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 outline-none" required />
          <input type="number" placeholder="Monto Meta" value={newGoal.targetAmount} onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required min="1" />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium"><Plus size={20} /> Crear Meta</button>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6">
          {goals.map(g => {
            if (editingId === g.id) {
              return (
                <div key={g.id} className="bg-white p-5 rounded-2xl shadow-sm border border-blue-300 flex flex-col gap-3">
                  <p className="text-sm font-bold text-blue-600 mb-1">Editando Ahorro</p>
                  <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nombre" />
                  <input type="number" value={editForm.targetAmount} onChange={e => setEditForm({...editForm, targetAmount: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Monto Meta" />
                  <div className="flex gap-2 mt-2">
                    <button onClick={saveEdit} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Guardar</button>
                    <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">Cancelar</button>
                  </div>
                </div>
              );
            }
            const progress = (g.currentAmount / g.targetAmount) * 100;
            return (
              <div key={g.id} className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                <div className="flex justify-between mb-4 items-start gap-2">
                  <h3 className="font-bold text-slate-800 flex items-start gap-2 flex-1 min-w-0">
                    <Star className="text-blue-500 flex-shrink-0 mt-0.5" size={18}/> 
                    <span className="leading-tight truncate">{g.name}</span>
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => startEdit(g)} className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"><Edit2 size={16}/></button>
                    <button onClick={() => setGoals(goals.filter(x => x.id !== g.id))} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16}/></button>
                  </div>
                </div>
                <div className="flex justify-center items-center mb-4">
                   <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-blue-500 transition-all duration-1000" strokeWidth="3" strokeDasharray={`${progress}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="absolute flex flex-col items-center"><span className="text-xl font-bold text-slate-800">{Math.round(progress)}%</span></div>
                   </div>
                </div>
                <div className="flex justify-between text-sm text-slate-500 font-medium mb-4 bg-slate-50 p-3 rounded-lg mt-auto">
                  <div className="flex flex-col"><span className="text-xs text-slate-400">Ahorrado</span><span className="text-slate-800">{formatCurrency(g.currentAmount)}</span></div>
                  <div className="flex flex-col text-right"><span className="text-xs text-slate-400">Meta</span><span className="text-slate-800">{formatCurrency(g.targetAmount)}</span></div>
                </div>
                <div className="flex gap-2 mt-2">
                  <input type="number" placeholder="Monto a ahorrar" value={savingAmounts[g.id] || ''} onChange={e => setSavingAmounts({...savingAmounts, [g.id]: e.target.value})} className="flex-1 p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" min="1" />
                  <button onClick={() => addSaving(g.id)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors whitespace-nowrap">+ Ahorrar</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const WishlistView = () => {
    const [newItem, setNewItem] = useState({ name: '', price: '', priority: 'Media' });

    const handleAdd = (e) => {
      e.preventDefault();
      if (!newItem.name || !newItem.price) return;
      setWishlist([...wishlist, { ...newItem, id: Date.now(), price: Number(newItem.price), purchased: false }]);
      setNewItem({ name: '', price: '', priority: 'Media' });
    };

    const togglePurchased = (id) => setWishlist(wishlist.map(w => w.id === id ? { ...w, purchased: !w.purchased } : w));

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Cosas que Comprar</h2>
        <form onSubmit={handleAdd} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3">
          <input type="text" placeholder="¿Qué quieres comprar?" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="p-2 border rounded-lg flex-1 focus:ring-2 focus:ring-purple-500 outline-none" required />
          <input type="number" placeholder="Precio estimado" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" required min="1" />
          <select value={newItem.priority} onChange={e => setNewItem({...newItem, priority: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
            <option value="Baja">Prioridad Baja</option><option value="Media">Prioridad Media</option><option value="Alta">Prioridad Alta</option>
          </select>
          <button type="submit" className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 font-medium"><Plus size={20} /> Añadir</button>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6">
          {wishlist.sort((a, b) => a.purchased === b.purchased ? 0 : a.purchased ? 1 : -1).map(w => (
            <div key={w.id} className={`p-4 rounded-2xl border transition-all ${w.purchased ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button onClick={() => togglePurchased(w.id)} className="mt-1 flex-shrink-0">{w.purchased ? <CheckCircle2 className="text-emerald-500" size={24} /> : <Circle className="text-slate-300 hover:text-purple-500" size={24} />}</button>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold flex items-start gap-2 leading-snug break-words ${w.purchased ? 'line-through text-slate-500' : 'text-slate-800'}`}><Package className={`flex-shrink-0 mt-0.5 ${w.purchased ? "text-slate-400" : "text-purple-500"}`} size={18}/><span className="truncate">{w.name}</span></h3>
                    <p className="text-slate-500 font-medium mt-1">{formatCurrency(w.price)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                   <button onClick={() => setWishlist(wishlist.filter(x => x.id !== w.id))} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16}/></button>
                   {!w.purchased && (<span className={`text-xs px-2 py-1 rounded-full font-medium ${w.priority === 'Alta' ? 'bg-red-100 text-red-600' : w.priority === 'Media' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>{w.priority}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ImportView = () => {
    const [rawText, setRawText] = useState('');
    const [parsedData, setParsedData] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState(accounts.length > 0 ? accounts[0].id : '');

    const handleParse = () => {
      const lines = rawText.split('\n');
      const results = [];
      // Buscar fechas tipo DD/MM/AAAA o DD-MM-AAAA
      const dateRegex = /\b(\d{2})[\/\-](\d{2})[\/\-](\d{4}|\d{2})\b/;

      lines.forEach((line, index) => {
        if(!line.trim()) return;

        // 1. Extraer la fecha
        const dateMatch = line.match(dateRegex);
        let dateObj = new Date().toISOString().split('T')[0]; 
        
        if (dateMatch) {
          const d = dateMatch[1];
          const m = dateMatch[2];
          let y = dateMatch[3];
          if(y.length === 2) y = '20' + y;
          dateObj = `${y}-${m}-${d}`;
        }

        // 2. Extraer el monto y la descripción
        let textWithoutDate = line.replace(dateRegex, '').trim();
        
        // Buscar números al final o en la línea que parezcan montos (con o sin signo, con o sin puntos/comas)
        const amountRegex = /(?:- ?)?\$?\s?(\d{1,3}(?:\.\d{3})*|\d+)(?:,\d+)?/g;
        const amounts = [...textWithoutDate.matchAll(amountRegex)];

        if (amounts.length > 0) {
          // Tomar el último número de la línea (suele ser el monto en cartolas de banco)
          const rawAmountStr = amounts[amounts.length - 1][0]; 
          const isNegative = rawAmountStr.includes('-') || line.toUpperCase().includes('COMPRA') || line.toUpperCase().includes('PAGO');

          let amountClean = rawAmountStr.replace(/[^\d]/g, ''); 
          let amountNum = Number(amountClean);

          if (amountNum > 0) {
            // Limpiar la descripción (quitar el monto de la línea)
            let desc = textWithoutDate.replace(rawAmountStr, '').replace(/\$|\./g, '').trim();
            desc = desc.replace(/\s{2,}/g, ' '); // quitar espacios múltiples
            if(desc.length > 35) desc = desc.substring(0, 35) + '...';
            if(!desc) desc = 'Movimiento Bancario';

            results.push({
              id: 'imp_' + index + '_' + Date.now(),
              date: dateObj,
              description: desc,
              amount: amountNum,
              type: isNegative ? 'gasto' : 'ingreso',
              category: isNegative ? 'Otros' : 'Salario',
              accountId: Number(selectedAccountId)
            });
          }
        }
      });
      setParsedTransactions(results);
    };

    const setParsedTransactions = (data) => {
      setParsedData(data);
    };

    const updateParsedItem = (id, field, value) => {
      setParsedData(parsedData.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const removeParsedItem = (id) => {
      setParsedData(parsedData.filter(item => item.id !== id));
    };

    const importToMain = () => {
      setTransactions([...transactions, ...parsedData]);
      setParsedData([]);
      setRawText('');
      alert(`${parsedData.length} transacciones importadas correctamente.`); // Simple alert for completion inside preview
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Upload className="text-blue-600" /> Importador Inteligente
          </h2>
          <p className="text-slate-500 mt-2">Abre el PDF o Excel de tu banco, copia todo el texto de tus movimientos y pégalo aquí abajo.</p>
        </div>

        {parsedData.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
              <AlertCircle className="text-blue-500 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <strong>¿A qué cuenta irán estos movimientos?</strong> Selecciona la cuenta bancaria de esta cartola antes de pegar el texto.
              </div>
              <select 
                value={selectedAccountId} 
                onChange={e => setSelectedAccountId(e.target.value)} 
                className="p-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-w-[200px] ml-auto font-medium"
              >
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <textarea 
              className="w-full h-64 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm bg-slate-50"
              placeholder={`Ejemplo de formato aceptado:\n\n12/04/2026 SUPERMERCADO LIDER -45.000\n13-04-2026 TRANSFERENCIA JUAN PEREZ $150.000\n15/04/2026 PAGO SPOTIFY 6.500`}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
            <button 
              onClick={handleParse}
              disabled={!rawText.trim()}
              className="w-full md:w-auto ml-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Activity size={20} /> Analizar Texto
            </button>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Vista Previa ({parsedData.length} transacciones)</h3>
              <button onClick={() => setParsedData([])} className="text-sm text-slate-500 hover:text-slate-800">Cancelar</button>
            </div>
            
            <p className="text-sm text-slate-500">Revisa la lista, ajusta si es Gasto o Ingreso y asigna las categorías correctas antes de importar.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-200 text-sm text-slate-500">
                    <th className="pb-3 font-medium w-24">Fecha</th>
                    <th className="pb-3 font-medium">Descripción</th>
                    <th className="pb-3 font-medium w-32">Tipo</th>
                    <th className="pb-3 font-medium w-32 text-right">Monto</th>
                    <th className="pb-3 font-medium w-40 pl-4">Categoría</th>
                    <th className="pb-3 font-medium w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map(item => (
                    <tr key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                      <td className="py-2 pr-2">
                        <input type="date" value={item.date} onChange={(e) => updateParsedItem(item.id, 'date', e.target.value)} className="w-full text-xs p-1 border rounded bg-transparent outline-none"/>
                      </td>
                      <td className="py-2 pr-2">
                        <input type="text" value={item.description} onChange={(e) => updateParsedItem(item.id, 'description', e.target.value)} className="w-full text-sm font-semibold p-1 border border-transparent hover:border-slate-200 rounded bg-transparent outline-none"/>
                      </td>
                      <td className="py-2 pr-2">
                        <select value={item.type} onChange={(e) => updateParsedItem(item.id, 'type', e.target.value)} className={`w-full text-xs p-1.5 border rounded outline-none font-bold ${item.type === 'ingreso' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          <option value="gasto">Gasto (-)</option>
                          <option value="ingreso">Ingreso (+)</option>
                        </select>
                      </td>
                      <td className="py-2 pr-2 text-right">
                        <div className="flex items-center justify-end font-bold text-sm">
                          <span className={item.type === 'ingreso' ? 'text-emerald-600' : 'text-red-600'}>
                             {item.type === 'ingreso' ? '+' : '-'}{formatCurrency(item.amount)}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 pl-4 pr-2">
                        <select value={item.category} onChange={(e) => updateParsedItem(item.id, 'category', e.target.value)} className="w-full text-xs p-1.5 border rounded bg-white outline-none">
                           {(item.type === 'gasto' ? expenseCategories : incomeCategories).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </td>
                      <td className="py-2 text-right">
                        <button onClick={() => removeParsedItem(item.id)} className="p-1 text-slate-300 hover:text-red-500 rounded"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button 
              onClick={importToMain}
              className="w-full px-6 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 mt-4 text-lg shadow-sm"
            >
              <Check size={24} /> Confirmar e Importar al Resumen
            </button>
          </div>
        )}
      </div>
    );
  };

  // --- NAVEGACIÓN ---
const BudgetsView = () => {
  const [newBudget, setNewBudget] = useState({ category: 'Alimentación', limit: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newBudget.limit) return;
    const exists = budgets.find(b => b.category === newBudget.category);
    if (exists) {
      setBudgets(budgets.map(b => b.category === newBudget.category ? { ...b, limit: Number(newBudget.limit) } : b));
    } else {
      setBudgets([...budgets, { id: Date.now(), category: newBudget.category, limit: Number(newBudget.limit) }]);
    }
    setNewBudget({ ...newBudget, limit: '' });
  };

  const handleDelete = (id) => setBudgets(budgets.filter(b => b.id !== id));

  const currentMonth = new Date().toISOString().substring(0, 7);
  const getSpent = (category) => transactions
    .filter(t => t.type === 'gasto' && t.category === category && t.date.startsWith(currentMonth))
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Presupuestos</h2>
        <p className="text-slate-500 mt-1">Define cuánto puedes gastar por categoría cada mes.</p>
      </div>

      <form onSubmit={handleAdd} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3">
        <select
          value={newBudget.category}
          onChange={e => setNewBudget({...newBudget, category: e.target.value})}
          className="p-2 border rounded-lg flex-1 focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          type="number"
          placeholder="Límite mensual"
          value={newBudget.limit}
          onChange={e => setNewBudget({...newBudget, limit: e.target.value})}
          className="p-2 border rounded-lg md:w-52 focus:ring-2 focus:ring-emerald-500 outline-none"
          required min="1"
        />
        <button type="submit" className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2 font-medium px-6">
          <Plus size={20} /> Guardar
        </button>
      </form>

      {budgets.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-slate-100 text-center text-slate-400">
          No tienes presupuestos definidos. Agrega uno arriba.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {budgets.map(b => {
            const spent = getSpent(b.category);
            const pct = Math.min((spent / b.limit) * 100, 100);
            const remaining = b.limit - spent;
            const isOver = spent > b.limit;
            const isWarning = pct >= 80 && !isOver;

            return (
              <div key={b.id} className={`bg-white p-5 rounded-2xl border shadow-sm flex flex-col gap-3 ${isOver ? 'border-red-200' : isWarning ? 'border-amber-200' : 'border-slate-100'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(b.category, 18, "")}
                    <h3 className="font-bold text-slate-800">{b.category}</h3>
                    {isOver && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">Excedido</span>
                    )}
                    {isWarning && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">Cuidado</span>
                    )}
                  </div>
                  <button onClick={() => handleDelete(b.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                    <Trash2 size={16}/>
                  </button>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-700 ${isOver ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Gastado: <span className={`font-bold ${isOver ? 'text-red-600' : 'text-slate-800'}`}>{formatCurrency(spent)}</span>
                  </span>
                  <span className="text-slate-500">
                    Límite: <span className="font-bold text-slate-800">{formatCurrency(b.limit)}</span>
                  </span>
                </div>

                <div className={`text-sm font-medium rounded-lg px-3 py-2 ${isOver ? 'bg-red-50 text-red-700' : isWarning ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {isOver
                    ? `Te pasaste por ${formatCurrency(Math.abs(remaining))}`
                    : `Te quedan ${formatCurrency(remaining)} para el resto del mes`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

  const navItems = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'accounts', label: 'Cuentas', icon: Landmark },
    { id: 'transactions', label: 'Movimientos', icon: ArrowRightLeft },
    { id: 'import', label: 'Importar', icon: FileText },
    { id: 'subscriptions', label: 'Gastos Fijos', icon: Repeat },
    { id: 'debts', label: 'Deudas', icon: CreditCard },
    { id: 'goals', label: 'Ahorros', icon: Target },
    { id: 'wishlist', label: 'Compras', icon: ShoppingCart },
    { id: 'budgets', label: 'Presupuestos', icon: PiggyBank },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 z-10">
        <div className="p-6">
          <h1 className="text-2xl font-black text-blue-600 flex items-center gap-2">
            <Wallet size={28} /> Mis Finanzas
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                currentView === item.id 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="md:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
          <h1 className="text-xl font-black text-blue-600 flex items-center justify-center gap-2">
             <Wallet size={24} /> Mis Finanzas
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-5xl mx-auto">
            {currentView === 'dashboard' && <DashboardView />}
            {currentView === 'accounts' && <AccountsView />}
            {currentView === 'transactions' && <TransactionsView />}
            {currentView === 'import' && <ImportView />}
            {currentView === 'subscriptions' && <SubscriptionsView />}
            {currentView === 'debts' && <DebtsView />}
            {currentView === 'goals' && <GoalsView />}
            {currentView === 'wishlist' && <WishlistView />}
            {currentView === 'budgets' && <BudgetsView />}
          </div>
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex overflow-x-auto z-20 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style dangerouslySetInnerHTML={{__html: `nav::-webkit-scrollbar { display: none; }`}} />
        <div className="flex w-full px-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center justify-center p-2 min-w-[72px] flex-shrink-0 transition-colors ${
                currentView === item.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <item.icon size={24} className={currentView === item.id ? 'fill-blue-50' : ''} />
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

    </div>
  );
}