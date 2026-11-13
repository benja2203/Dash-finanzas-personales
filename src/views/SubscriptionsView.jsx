import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/helpers.jsx';
import { Plus, Trash2, Edit2, Repeat, CalendarClock, Pause, Play } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SubscriptionsView() {
  const { accounts, subscriptions, setSubscriptions, expenseCategories, defaultAccountId } = useFinance();

  const [newSub, setNewSub] = useState({
    name: '', amount: '', category: 'Servicios',
    accountId: defaultAccountId,
    nextPaymentDate: new Date().toISOString().split('T')[0]
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newSub.name || !newSub.amount || !newSub.accountId) return;
    setSubscriptions([...subscriptions, { ...newSub, id: Date.now(), amount: Number(newSub.amount), isActive: true, accountId: Number(newSub.accountId) }]);
    setNewSub({ ...newSub, name: '', amount: '' });
    toast.success('Gasto fijo programado');
  };

  const toggleActive = (id) => {
    setSubscriptions(subscriptions.map(s => {
      if (s.id === id) {
        toast.success(s.isActive ? 'Suscripción pausada' : 'Suscripción reanudada');
        return { ...s, isActive: !s.isActive };
      }
      return s;
    }));
  };
  const handleDelete = (id) => setSubscriptions(subscriptions.filter(s => s.id !== id));
  const startEdit = (sub) => { setEditingId(sub.id); setEditForm(sub); };
  const saveEdit = () => {
    setSubscriptions(subscriptions.map(s => s.id === editingId ? { ...editForm, amount: Number(editForm.amount), accountId: Number(editForm.accountId) } : s));
    setEditingId(null);
    toast.success('Gasto fijo actualizado');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Gastos Fijos y Suscripciones</h2>
      <p className="text-slate-500">La aplicación descontará automáticamente estos montos cada mes en la fecha indicada.</p>

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
            {accounts.length === 0 && <option value="">Sin cuentas</option>}
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
                <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Nombre" />
                <input type="number" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Monto Mensual" />
                <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                  {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={editForm.accountId} onChange={e => setEditForm({...editForm, accountId: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  {accounts.length === 0 && <option value="">Sin cuentas</option>}
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
                    <span className="text-[10px] sm:text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full inline-block mt-1.5">{sub.category}</span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => startEdit(sub)} className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"><Edit2 size={16}/></button>
                  <button onClick={() => toggleActive(sub.id)} className={`p-1.5 rounded-md transition-colors ${sub.isActive ? 'text-slate-400 hover:text-amber-500 hover:bg-amber-50' : 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100'}`}>
                    {sub.isActive ? <Pause size={16}/> : <Play size={16}/>}
                  </button>
                  <button onClick={() => { setSubscriptions(subscriptions.filter(s => s.id !== sub.id)); toast.error('Suscripción eliminada'); }} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16}/></button>
                </div>
              </div>
              <div className="flex justify-between items-end pt-3 border-t border-slate-50 gap-2 mt-auto">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><CalendarClock size={12} className="flex-shrink-0"/> Próximo cobro</p>
                  <p className={`font-medium truncate ${sub.isActive ? 'text-slate-700' : 'text-slate-400'}`}>{sub.nextPaymentDate}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium truncate">Desde: {accName}</p>
                </div>
                <p className={`text-lg sm:text-xl font-black flex-shrink-0 ${sub.isActive ? 'text-slate-800' : 'text-slate-500'}`}>{formatCurrency(sub.amount)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}