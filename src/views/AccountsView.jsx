import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/helpers.jsx';
import { Landmark, Plus, Edit2, Trash2, ChevronUp, ChevronDown, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AccountsView() {
  const { accounts, setAccounts, getAccountBalance, defaultAccountId } = useFinance();
  const [newAccount, setNewAccount] = useState({ name: '', type: 'Débito', initialBalance: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newAccount.name || !newAccount.initialBalance) return;
    // La primera cuenta que se crea queda como predeterminada automáticamente
    const isFirst = accounts.length === 0;
    setAccounts([...accounts, { ...newAccount, id: Date.now(), initialBalance: Number(newAccount.initialBalance), isDefault: isFirst }]);
    setNewAccount({ name: '', type: 'Débito', initialBalance: '' });
    toast.success('Cuenta creada exitosamente');
  };

  // Reordenar: intercambia la cuenta con su vecina (sube o baja una posición)
  const move = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= accounts.length) return;
    const arr = [...accounts];
    [arr[index], arr[target]] = [arr[target], arr[index]];
    setAccounts(arr);
  };

  // Marca una cuenta como predeterminada (y desmarca el resto)
  const setDefault = (id) => {
    setAccounts(accounts.map(a => ({ ...a, isDefault: a.id === id })));
    toast.success('Cuenta predeterminada actualizada');
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

      {accounts.length > 1 && (
        <p className="text-xs text-slate-400 -mt-2">Usa las flechas para reordenar tus cuentas y la estrella para elegir la predeterminada (la que aparece preseleccionada en toda la app).</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6">
        {accounts.map((acc, index) => {
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
          const isDefault = acc.id === defaultAccountId;
          return (
            <div key={acc.id} className={`bg-white p-4 sm:p-5 rounded-2xl shadow-sm border transition-colors flex flex-col ${isDefault ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-100 hover:border-blue-200'}`}>
              <div className="flex justify-between items-start mb-4 gap-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 sm:p-3 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0 mt-0.5"><Landmark className="w-5 h-5" /></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 leading-tight truncate">{acc.name}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] sm:text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full inline-block">{acc.type}</span>
                      {isDefault && <span className="text-[10px] sm:text-xs font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full inline-flex items-center gap-1"><Star size={11} className="fill-blue-500 text-blue-500" /> Predeterminada</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <div className="flex flex-col">
                    <button onClick={() => move(index, -1)} disabled={index === 0} className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Subir"><ChevronUp size={16}/></button>
                    <button onClick={() => move(index, 1)} disabled={index === accounts.length - 1} className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Bajar"><ChevronDown size={16}/></button>
                  </div>
                  <button onClick={() => setDefault(acc.id)} disabled={isDefault} className={`p-1.5 rounded-md transition-colors ${isDefault ? 'text-blue-500' : 'text-slate-300 hover:text-blue-500 hover:bg-blue-50'}`} title={isDefault ? 'Cuenta predeterminada' : 'Marcar como predeterminada'}><Star size={16} className={isDefault ? 'fill-blue-500' : ''}/></button>
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