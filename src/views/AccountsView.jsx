import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/helpers.jsx';
import { Landmark, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AccountsView() {
  const { accounts, setAccounts, getAccountBalance } = useFinance();
  const [newAccount, setNewAccount] = useState({ name: '', type: 'Débito', initialBalance: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newAccount.name || !newAccount.initialBalance) return;
    setAccounts([...accounts, { ...newAccount, id: Date.now(), initialBalance: Number(newAccount.initialBalance) }]);
    setNewAccount({ name: '', type: 'Débito', initialBalance: '' });
    toast.success('Cuenta creada exitosamente');
  };

  const handleDelete = (id) => setAccounts(accounts.filter(a => a.id !== id));
  const startEdit = (acc) => { setEditingId(acc.id); setEditForm(acc); };
  const saveEdit = () => {
    setAccounts(accounts.map(a => a.id === editingId ? { ...editForm, initialBalance: Number(editForm.initialBalance) } : a));
    setEditingId(null);
    toast.success('Cuenta creada exitosamente');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Mis Cuentas</h2>
      <form onSubmit={handleAdd} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3">
        <input type="text" placeholder="Nombre (ej. Banco de Chile)" value={newAccount.name} onChange={e => setNewAccount({...newAccount, name: e.target.value})} className="p-2 border rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 outline-none" required />
        <select value={newAccount.type} onChange={e => setNewAccount({...newAccount, type: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="Débito">Débito</option>
          <option value="Crédito">Crédito</option>
          <option value="Ahorro">Ahorro</option>
          <option value="Efectivo">Efectivo</option>
          <option value="Prepago">Prepago</option>
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
                  <option value="Débito">Débito</option>
                  <option value="Crédito">Crédito</option>
                  <option value="Ahorro">Ahorro</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Prepago">Prepago</option>
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
                    <span className="text-[10px] sm:text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full inline-block mt-1.5">{acc.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => startEdit(acc)} className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"><Edit2 size={16}/></button>
                  <button onClick={() => { setAccounts(accounts.filter(a => a.id !== acc.id)); toast.error('Cuenta eliminada'); }} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16}/></button>
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
}