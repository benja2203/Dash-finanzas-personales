import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, getCategoryIcon } from '../utils/helpers.jsx';
import { Plus, Trash2 } from 'lucide-react';

export default function BudgetsView() {
  const { budgets, setBudgets, transactions, expenseCategories } = useFinance();
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
        <select value={newBudget.category} onChange={e => setNewBudget({...newBudget, category: e.target.value})} className="p-2 border rounded-lg flex-1 focus:ring-2 focus:ring-emerald-500 outline-none">
          {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="number" placeholder="Límite mensual" value={newBudget.limit} onChange={e => setNewBudget({...newBudget, limit: e.target.value})} className="p-2 border rounded-lg md:w-52 focus:ring-2 focus:ring-emerald-500 outline-none" required min="1" />
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
                    {isOver && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">Excedido</span>}
                    {isWarning && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">Cuidado</span>}
                  </div>
                  <button onClick={() => handleDelete(b.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                    <Trash2 size={16}/>
                  </button>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className={`h-3 rounded-full transition-all duration-700 ${isOver ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Gastado: <span className={`font-bold ${isOver ? 'text-red-600' : 'text-slate-800'}`}>{formatCurrency(spent)}</span></span>
                  <span className="text-slate-500">Límite: <span className="font-bold text-slate-800">{formatCurrency(b.limit)}</span></span>
                </div>
                <div className={`text-sm font-medium rounded-lg px-3 py-2 ${isOver ? 'bg-red-50 text-red-700' : isWarning ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {isOver ? `Te pasaste por ${formatCurrency(Math.abs(remaining))}` : `Te quedan ${formatCurrency(remaining)} para el resto del mes`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}