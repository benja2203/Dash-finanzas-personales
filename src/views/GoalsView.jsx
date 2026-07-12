import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/helpers.jsx';
import { Plus, Trash2, Edit2, Star, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GoalsView() {
  // 👇 Traemos cuentas y movimientos para que el ahorro salga de una cuenta real
  const { goals, setGoals, accounts, transactions, setTransactions } = useFinance();
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingAmounts, setSavingAmounts] = useState({});
  const [savingAccounts, setSavingAccounts] = useState({}); // Cuenta desde la que se ahorra/retira

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.targetAmount) return;
    setGoals([...goals, { ...newGoal, id: Date.now(), targetAmount: Number(newGoal.targetAmount), currentAmount: 0 }]);
    setNewGoal({ name: '', targetAmount: '' });
    toast.success('Meta creada');
  };

  const startEdit = (goal) => { setEditingId(goal.id); setEditForm(goal); };
  const saveEdit = () => {
    setGoals(goals.map(g => g.id === editingId ? { ...editForm, targetAmount: Number(editForm.targetAmount) } : g));
    setEditingId(null);
    toast.success('Meta editada');
  };

  // Resuelve la cuenta seleccionada (o la primera disponible)
  const resolveAccountId = (id) => {
    const raw = savingAccounts[id] || (accounts.length > 0 ? accounts[0].id : null);
    return Number(raw);
  };

  // Abonar: aparta dinero a la meta y lo descuenta de la cuenta elegida (genera un movimiento)
  const addSaving = (id) => {
    const goal = goals.find(g => g.id === id);
    const amount = Number(savingAmounts[id]);
    const accountIdNumber = resolveAccountId(id);

    if (!amount || amount <= 0) return;
    if (!accountIdNumber) {
      toast.error("Debes crear al menos una cuenta en 'Cuentas' para poder ahorrar.");
      return;
    }

    setGoals(goals.map(g => g.id === id ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) } : g));

    const newTx = {
      id: Date.now() + Math.random(),
      type: 'gasto',
      amount,
      description: `Ahorro: ${goal.name}`,
      notes: 'Apartado a meta de ahorro',
      category: 'Otros',
      accountId: accountIdNumber,
      date: new Date().toISOString().split('T')[0]
    };
    setTimeout(() => setTransactions([...transactions, newTx]), 500);

    setSavingAmounts({ ...savingAmounts, [id]: '' });
    toast.success('Ahorro registrado y descontado de tu cuenta');
  };

  // Retirar: devuelve dinero de la meta a la cuenta elegida (genera un ingreso)
  const withdrawSaving = (id) => {
    const goal = goals.find(g => g.id === id);
    const amount = Number(savingAmounts[id]);
    const accountIdNumber = resolveAccountId(id);

    if (!amount || amount <= 0) return;
    if (!accountIdNumber) {
      toast.error("Debes crear al menos una cuenta en 'Cuentas' para poder retirar.");
      return;
    }
    if (amount > goal.currentAmount) {
      toast.error('No puedes retirar más de lo que tienes ahorrado.');
      return;
    }

    setGoals(goals.map(g => g.id === id ? { ...g, currentAmount: Math.max(0, g.currentAmount - amount) } : g));

    const newTx = {
      id: Date.now() + Math.random(),
      type: 'ingreso',
      amount,
      description: `Retiro de ahorro: ${goal.name}`,
      notes: 'Devuelto desde meta de ahorro',
      category: 'Otros',
      accountId: accountIdNumber,
      date: new Date().toISOString().split('T')[0]
    };
    setTimeout(() => setTransactions([...transactions, newTx]), 500);

    setSavingAmounts({ ...savingAmounts, [id]: '' });
    toast.success('Retiro devuelto a tu cuenta');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Ahorros y Objetivos</h2>
        <p className="text-slate-500 mt-1 text-sm">Cada vez que abonas, el dinero <span className="font-semibold">se descuenta de la cuenta que elijas</span>. Si retiras, vuelve a esa cuenta.</p>
      </div>

      <form onSubmit={handleAdd} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3">
        <input type="text" placeholder="¿Qué quieres lograr?" value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} className="p-2 border rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 outline-none" required />
        <input type="number" placeholder="Monto Meta" value={newGoal.targetAmount} onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required min="1" />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium">
          <Plus size={20} /> Crear Meta
        </button>
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
                  <button onClick={() => { setGoals(goals.filter(x => x.id !== g.id)); toast.error('Ahorro eliminado'); }} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16}/></button>
                </div>
              </div>
              <div className="flex justify-center items-center mb-4">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-blue-500 transition-all duration-1000" strokeWidth="3" strokeDasharray={`${progress}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-bold text-slate-800">{Math.round(progress)}%</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-sm text-slate-500 font-medium mb-4 bg-slate-50 p-3 rounded-lg mt-auto">
                <div className="flex flex-col"><span className="text-xs text-slate-400">Ahorrado</span><span className="text-slate-800">{formatCurrency(g.currentAmount)}</span></div>
                <div className="flex flex-col text-right"><span className="text-xs text-slate-400">Meta</span><span className="text-slate-800">{formatCurrency(g.targetAmount)}</span></div>
              </div>
              <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-slate-50">
                <select
                  value={savingAccounts[g.id] || (accounts.length > 0 ? accounts[0].id : '')}
                  onChange={e => setSavingAccounts({...savingAccounts, [g.id]: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-600 bg-slate-50"
                >
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  {accounts.length === 0 && <option value="">Sin cuentas</option>}
                </select>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input type="number" placeholder="Monto" value={savingAmounts[g.id] || ''} onChange={e => setSavingAmounts({...savingAmounts, [g.id]: e.target.value})} className="flex-1 p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" min="1" />
                  <div className="flex gap-2">
                    <button onClick={() => addSaving(g.id)} className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors whitespace-nowrap flex items-center justify-center gap-1">
                      <ArrowUpRight size={16}/> Abonar
                    </button>
                    <button onClick={() => withdrawSaving(g.id)} className="flex-1 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors whitespace-nowrap flex items-center justify-center gap-1">
                      <ArrowDownLeft size={16}/> Retirar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}