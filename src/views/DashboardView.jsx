import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, getCategoryIcon } from '../utils/helpers.jsx';
import {
  Landmark, Wallet, TrendingUp, TrendingDown, Activity, Target,
  Building2, Repeat, CalendarClock, ArrowUp, ArrowDown, CreditCard, AlertTriangle, PiggyBank
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, LineChart, Line, ResponsiveContainer, CartesianGrid
} from 'recharts';


export default function DashboardView() {
  const [timeFilter, setTimeFilter] = useState('mensual');
  const { accounts, transactions, goals, subscriptions, debts, budgets, getAccountBalance, totalNetWorth, expenseCategories } = useFinance();

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

  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalGoalsTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const globalGoalsProgress = totalGoalsTarget > 0 ? (totalSaved / totalGoalsTarget) * 100 : 0;
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  // 📈 COMPARATIVA CON EL PERIODO ANTERIOR
  const now = new Date();
  const prevKeys = (() => {
    if (timeFilter === 'diario') {
      const y = new Date(now); y.setDate(y.getDate() - 1);
      return { match: (t) => t.date === y.toISOString().split('T')[0], label: 'vs ayer' };
    }
    if (timeFilter === 'anual') {
      const prevYear = String(now.getFullYear() - 1);
      return { match: (t) => t.date.startsWith(prevYear), label: 'vs año anterior' };
    }
    // mensual (por defecto)
    const p = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = p.toISOString().substring(0, 7);
    return { match: (t) => t.date.startsWith(prevMonth), label: 'vs mes anterior' };
  })();
  const prevTransactions = transactions.filter(prevKeys.match);
  const prevIncome = prevTransactions.filter(t => t.type === 'ingreso').reduce((a, t) => a + t.amount, 0);
  const prevExpense = prevTransactions.filter(t => t.type === 'gasto').reduce((a, t) => a + t.amount, 0);
  const prevBalance = prevIncome - prevExpense;

  // Muestra el cambio porcentual con color según si subir es bueno o malo
  const renderDelta = (curr, prev, higherIsGood) => {
    if (!prev) return <span className="text-xs text-slate-400 mt-1 font-medium">Sin dato previo {prevKeys.label}</span>;
    const pct = ((curr - prev) / Math.abs(prev)) * 100;
    if (Math.abs(pct) < 0.1) return <span className="text-xs text-slate-400 mt-1 font-medium">Sin cambios {prevKeys.label}</span>;
    const up = pct > 0;
    const good = higherIsGood ? up : !up;
    const Icon = up ? ArrowUp : ArrowDown;
    return (
      <span className={`text-xs font-bold mt-1 flex items-center gap-0.5 ${good ? 'text-emerald-600' : 'text-red-500'}`}>
        <Icon size={13} /> {Math.abs(pct).toFixed(1)}% <span className="text-slate-400 font-medium ml-0.5">{prevKeys.label}</span>
      </span>
    );
  };

  // 📅 PRÓXIMOS PAGOS (gastos fijos + deudas por pagar) en los próximos 30 días
  const todayMid = new Date(); todayMid.setHours(0, 0, 0, 0);
  const horizon = new Date(todayMid); horizon.setDate(horizon.getDate() + 30);
  const horizonStr = horizon.toISOString().split('T')[0];
  const daysUntil = (dateStr) => Math.round((new Date(dateStr + 'T00:00:00') - todayMid) / 86400000);
  const whenLabel = (dateStr) => {
    const d = daysUntil(dateStr);
    if (d < 0) return { text: 'Vencido', urgent: true };
    if (d === 0) return { text: 'Hoy', urgent: true };
    if (d === 1) return { text: 'Mañana', urgent: false };
    return { text: `En ${d} días`, urgent: false };
  };
  const upcomingPayments = [
    ...subscriptions
      .filter(s => s.isActive && s.nextPaymentDate && s.nextPaymentDate <= horizonStr)
      .map(s => ({ id: 's' + s.id, name: s.name, date: s.nextPaymentDate, amount: s.amount, kind: 'Gasto fijo' })),
    ...debts
      .filter(d => d.type === 'por_pagar' && d.paidAmount < d.totalAmount && d.dueDate && d.dueDate <= horizonStr)
      .map(d => ({ id: 'd' + d.id, name: d.name, date: d.dueDate, amount: d.totalAmount - d.paidAmount, kind: 'Deuda' })),
  ].sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
  const upcomingTotal = upcomingPayments.reduce((s, p) => s + p.amount, 0);

  // 🔎 TUS MAYORES GASTOS del periodo seleccionado (top 5)
  const topExpenses = filteredTransactions
    .filter(t => t.type === 'gasto')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // 🐷 RESUMEN DE PRESUPUESTOS (del mes en curso)
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const budgetStatus = budgets.map(b => {
    const spent = transactions
      .filter(t => t.type === 'gasto' && t.category === b.category && t.date.startsWith(currentMonthStr))
      .reduce((s, t) => s + t.amount, 0);
    const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
    const state = spent > b.limit ? 'over' : pct >= 80 ? 'warn' : 'ok';
    return { ...b, spent, pct, state };
  });
  const budgetCounts = {
    ok: budgetStatus.filter(b => b.state === 'ok').length,
    warn: budgetStatus.filter(b => b.state === 'warn').length,
    over: budgetStatus.filter(b => b.state === 'over').length,
  };
  // Los que necesitan atención primero (excedidos, luego en alerta), ordenados por % gastado
  const budgetsAttention = budgetStatus
    .filter(b => b.state !== 'ok')
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 4);

  const CHART_COLORS = ['#378ADD','#1D9E75','#D85A30','#BA7517','#7F77DD','#E24B4A','#888780','#D4537E'];

  // 👇 Usamos las categorías dinámicas que trajimos arriba
  const expenseByCategory = expenseCategories.map(cat => ({
    name: cat,
    value: filteredTransactions.filter(t => t.type === 'gasto' && t.category === cat).reduce((s, t) => s + t.amount, 0)
  })).filter(d => d.value > 0);

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = d.toISOString().substring(0, 7);
    const label = d.toLocaleString('es-CL', { month: 'short' });
    const ingresos = transactions.filter(t => t.type === 'ingreso' && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0);
    const gastos = transactions.filter(t => t.type === 'gasto' && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0);
    return { label, ingresos, gastos };
  });

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
  const formatTooltip = (v) => formatCurrency(v);

  const projectionMonths = Array.from({ length: 3 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (2 - i));
    const key = d.toISOString().substring(0, 7);
    const inc = transactions.filter(t => t.type === 'ingreso' && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0);
    const exp = transactions.filter(t => t.type === 'gasto' && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0);
    return inc - exp;
  });
  const avgSaving = projectionMonths.reduce((s, m) => s + m, 0) / projectionMonths.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-2xl font-bold text-slate-800">Resumen</h2>
        <div className="flex bg-slate-200 p-1 rounded-lg">
          {['diario', 'mensual', 'anual'].map(f => (
            <button key={f} onClick={() => setTimeFilter(f)}
              className={`px-4 py-1 rounded-md text-sm font-medium capitalize transition-colors ${timeFilter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center text-slate-500 mb-2"><Landmark className="w-5 h-5 mr-2" /><span>Patrimonio Total</span></div>
          <span className={`text-2xl font-bold ${totalNetWorth >= 0 ? 'text-slate-800' : 'text-red-600'}`}>{formatCurrency(totalNetWorth)}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center text-slate-500 mb-2"><Wallet className="w-5 h-5 mr-2" /><span>Flujo {timeFilter}</span></div>
          <span className={`text-2xl font-bold ${balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>{formatCurrency(balance)}</span>
          {renderDelta(balance, prevBalance, true)}
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center text-emerald-500 mb-2"><TrendingUp className="w-5 h-5 mr-2" /><span>Ingresos</span></div>
          <span className="text-2xl font-bold text-slate-800">{formatCurrency(totalIncome)}</span>
          {renderDelta(totalIncome, prevIncome, true)}
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center text-red-500 mb-2"><TrendingDown className="w-5 h-5 mr-2" /><span>Gastos</span></div>
          <span className="text-2xl font-bold text-slate-800">{formatCurrency(totalExpense)}</span>
          {renderDelta(totalExpense, prevExpense, false)}
        </div>
      </div>

      {/* 📅 PRÓXIMOS PAGOS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><CalendarClock className="text-blue-500" size={20} />Próximos pagos <span className="text-xs font-medium text-slate-400">(30 días)</span></h3>
          {upcomingPayments.length > 0 && (
            <span className="text-sm font-bold text-slate-700">Total: {formatCurrency(upcomingTotal)}</span>
          )}
        </div>
        {upcomingPayments.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">No tienes pagos programados para los próximos 30 días. 🎉</p>
        ) : (
          <div className="space-y-2">
            {upcomingPayments.map(p => {
              const w = whenLabel(p.date);
              return (
                <div key={p.id} className="flex items-center justify-between gap-2 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${p.kind === 'Deuda' ? 'bg-red-50 text-red-500' : 'bg-purple-50 text-purple-500'}`}>
                      {p.kind === 'Deuda' ? <CreditCard size={18} /> : <Repeat size={18} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 text-sm leading-tight truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`text-xs font-bold flex items-center gap-1 ${w.urgent ? 'text-red-500' : 'text-slate-500'}`}>
                          {w.urgent && <AlertTriangle size={11} />}{w.text}
                        </span>
                        <span className="text-[11px] text-slate-400">{p.date}</span>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{p.kind}</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-slate-800 text-sm whitespace-nowrap flex-shrink-0">{formatCurrency(p.amount)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🐷 RESUMEN DE PRESUPUESTOS + 🔎 MAYORES GASTOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><PiggyBank className="text-emerald-500" size={20} />Presupuestos del mes</h3>
          {budgets.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">Aún no defines presupuestos. Créalos en la pestaña <span className="font-medium text-slate-500">Presupuestos</span> para controlar tus gastos por categoría.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-emerald-600">{budgetCounts.ok}</p>
                  <p className="text-[11px] font-medium text-emerald-700 mt-0.5">En orden</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-amber-600">{budgetCounts.warn}</p>
                  <p className="text-[11px] font-medium text-amber-700 mt-0.5">En alerta</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-red-600">{budgetCounts.over}</p>
                  <p className="text-[11px] font-medium text-red-700 mt-0.5">Excedidos</p>
                </div>
              </div>
              {budgetsAttention.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-2">Todos tus presupuestos van en orden 👍</p>
              ) : (
                <div className="space-y-3">
                  {budgetsAttention.map(b => (
                    <div key={b.id}>
                      <div className="flex justify-between items-center text-sm mb-1 gap-2">
                        <span className="font-medium text-slate-700 truncate flex items-center gap-1.5">{getCategoryIcon(b.category, 14, "")}{b.category}</span>
                        <span className={`font-semibold whitespace-nowrap ${b.state === 'over' ? 'text-red-600' : 'text-amber-600'}`}>{formatCurrency(b.spent)} / {formatCurrency(b.limit)}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className={`h-2 rounded-full ${b.state === 'over' ? 'bg-red-500' : 'bg-amber-400'}`} style={{ width: `${Math.min(b.pct, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-1"><TrendingDown className="text-red-500" size={20} />Tus mayores gastos</h3>
          <p className="text-xs text-slate-400 mb-4">Periodo: {timeFilter}</p>
          {topExpenses.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">Sin gastos en este periodo.</p>
          ) : (
            <div className="space-y-2">
              {topExpenses.map((t, i) => (
                <div key={t.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xs font-black text-slate-300 w-4 flex-shrink-0 text-center">{i + 1}</span>
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-600 flex-shrink-0">{getCategoryIcon(t.category, 16, "")}</div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 text-sm leading-tight truncate">{t.description}</p>
                      <p className="text-xs text-slate-400 truncate">{t.category} · {t.date}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-800 text-sm whitespace-nowrap flex-shrink-0">{formatCurrency(t.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Activity className="text-emerald-500" size={20} />Capacidad de Ahorro</h3>
            <span className={`text-sm font-bold px-2 py-1 rounded-full ${savingsRate >= 20 ? 'bg-emerald-100 text-emerald-700' : savingsRate > 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>{savingsRate.toFixed(1)}%</span>
          </div>
          <p className="text-sm text-slate-500 mb-3">
            {savingsRate >= 20 ? `¡Excelente! Estás guardando el ${savingsRate.toFixed(1)}% de tus ingresos.`
              : savingsRate > 0 ? `Estás guardando el ${savingsRate.toFixed(1)}%. Se recomienda apuntar al 20%.`
              : `Tus gastos superan tus ingresos este periodo.`}
          </p>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div className={`h-2.5 rounded-full transition-all duration-1000 ${savingsRate >= 20 ? 'bg-emerald-500' : savingsRate > 0 ? 'bg-blue-500' : 'bg-red-500'}`} style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Target className="text-purple-500" size={20} />Progreso de Metas</h3>
            <span className="text-sm font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-700">{globalGoalsProgress.toFixed(1)}%</span>
          </div>
          <p className="text-sm text-slate-500 mb-3">Has acumulado {formatCurrency(totalSaved)} de {formatCurrency(totalGoalsTarget)}.</p>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-purple-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${globalGoalsProgress}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Building2 className="text-blue-500" size={20} />Mis Cuentas</h3>
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
                const accIn = filteredTransactions.filter(t => t.type === 'ingreso' && t.accountId === acc.id).reduce((s, t) => s + t.amount, 0);
                const accOut = filteredTransactions.filter(t => t.type === 'gasto' && t.accountId === acc.id).reduce((s, t) => s + t.amount, 0);
                return (
                  <tr key={acc.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-2"><div className="font-semibold text-slate-800">{acc.name}</div><div className="text-xs text-slate-500">{acc.type}</div></td>
                    <td className="py-3 px-2 text-right text-emerald-600 font-medium">+{formatCurrency(accIn)}</td>
                    <td className="py-3 px-2 text-right text-red-600 font-medium">-{formatCurrency(accOut)}</td>
                    <td className="py-3 px-2 text-right font-bold text-slate-800">{formatCurrency(getAccountBalance(acc.id))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    <span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />{entry.name}
                  </span>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                    {expenseByCategory.map((entry, i) => <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatTooltip(v)} />
                </PieChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-800 mb-1">Ingresos vs Gastos</h3>
          <p className="text-xs text-slate-400 mb-4">Últimos 6 meses</p>
          <div className="flex gap-4 mb-4">
            <span className="flex items-center gap-1 text-xs text-slate-500"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#1D9E75' }} />Ingresos</span>
            <span className="flex items-center gap-1 text-xs text-slate-500"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#E24B4A' }} />Gastos</span>
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

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-base font-bold text-slate-800 mb-1">Evolución del patrimonio</h3>
        <p className="text-xs text-slate-400 mb-4">Últimos 6 meses</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={patrimonioEvolution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatM} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => formatTooltip(v)} />
            <Line type="monotone" dataKey="patrimonio" stroke="#378ADD" strokeWidth={2} dot={{ r: 4, fill: '#378ADD', strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Últimas Transacciones ({timeFilter})</h3>
        {filteredTransactions.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No hay movimientos en este periodo.</p>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.slice(0, 5).map(t => (
              <div key={t.id} className="flex justify-between items-center gap-2 p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-colors">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className={`p-3 rounded-full flex-shrink-0 ${t.isRecurring ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                    {t.isRecurring ? <Repeat size={20} /> : getCategoryIcon(t.category, 20, "")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 leading-tight truncate">{t.description}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-slate-500">{t.date}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full" />
                      <span className="text-xs text-slate-500">{t.category}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full" />
                      <span className="text-[10px] font-medium text-slate-600 flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        <Building2 size={10} />
                        {accounts.find(a => a.id === t.accountId)?.name || '?'}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`font-bold text-base whitespace-nowrap ml-2 flex-shrink-0 ${t.type === 'ingreso' ? 'text-emerald-600' : t.type === 'transferencia' ? 'text-blue-600' : 'text-slate-800'}`}>
                  {t.type === 'ingreso' ? '+' : t.type === 'transferencia' ? '' : '-'}{formatCurrency(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
          <TrendingUp className="text-emerald-500" size={20} />Proyección de Ahorro
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Promedio de ahorro últimos 3 meses: <span className="font-bold text-slate-600">{formatCurrency(Math.round(avgSaving))}/mes</span>
        </p>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[{ label: '3 meses', value: avgSaving * 3 }, { label: '6 meses', value: avgSaving * 6 }, { label: '12 meses', value: avgSaving * 12 }].map(p => (
            <div key={p.label} className={`p-3 sm:p-4 rounded-xl text-center ${p.value >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <p className="text-xs text-slate-500 mb-1">{p.label}</p>
              <p className={`text-sm sm:text-lg font-black break-words leading-tight ${p.value >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{formatCurrency(Math.round(p.value))}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}