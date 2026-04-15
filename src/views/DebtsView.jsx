import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/helpers.jsx';
import { Plus, Trash2, Edit2, Banknote } from 'lucide-react';

export default function DebtsView() {
  const { debts, setDebts } = useFinance();
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
  const saveEdit = () => {
    setDebts(debts.map(d => d.id === editingId ? { ...editForm, totalAmount: Number(editForm.totalAmount) } : d));
    setEditingId(null);
  };

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
        <input type="text" placeholder="Nombre de la deuda" value={newDebt.name} onChange={e => setNewDebt({...newDebt, name: e.target.value})} className="p-2 border rounded-lg flex-1 focus:ring-2 focus:ring-red-500 outline-none" required />
        <input type="number" placeholder="Monto Total" value={newDebt.totalAmount} onChange={e => setNewDebt({...newDebt, totalAmount: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" required min="1" />
        <input type="date" value={newDebt.dueDate} onChange={e => setNewDebt({...newDebt, dueDate: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" required />
        <button type="submit" className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 font-medium">
          <Plus size={20} /> Nueva
        </button>
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
              <div className="flex justify-between text-sm text-slate-500 mb-4 mt-2 gap-2">
                <span className="truncate">Vence: {d.dueDate}</span>
                <span className="flex-shrink-0">Falta: {formatCurrency(d.totalAmount - d.paidAmount)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden mt-auto">
                <div className="bg-red-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between text-xs text-slate-500 font-medium mb-4">
                <span>Pagado: {formatCurrency(d.paidAmount)}</span>
                <span>Total: {formatCurrency(d.totalAmount)}</span>
              </div>
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
}