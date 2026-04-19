import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, getCategoryIcon, exportToCSV } from '../utils/helpers.jsx';
import { Plus, Trash2, Edit2, ArrowRight, Building2, Repeat, FileText } from 'lucide-react';

export default function TransactionsView() {
  const { accounts, transactions, setTransactions, expenseCategories, incomeCategories } = useFinance();

  const [newTx, setNewTx] = useState({
    type: 'gasto', amount: '', description: '', notes: '', 
    date: new Date().toISOString().split('T')[0],
    category: 'Alimentación', accountId: accounts.length > 0 ? accounts[0].id : '',
    targetAccountId: accounts.length > 1 ? accounts[1].id : ''
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
      ...newTx, 
      id: Date.now(), 
      amount: Number(newTx.amount), 
      accountId: newTx.accountId, // Quitamos el Number() por si tus IDs son alfanuméricos
      // 👇 AQUÍ ESTÁ LA MAGIA: Cambiamos undefined por null
      targetAccountId: newTx.type === 'transferencia' ? newTx.targetAccountId : null
    };
    
    setTransactions([...transactions, newTransaction]);
    setNewTx({ 
      ...newTx, 
      amount: '', 
      description: '', 
      notes: '', 
      category: newTx.type === 'gasto' ? 'Alimentación' : newTx.type === 'transferencia' ? 'Transferencia' : 'Salario' 
    });
  };

  const handleDelete = (id) => setTransactions(transactions.filter(t => t.id !== id));

  const saveEditTx = () => {
    setTransactions(transactions.map(t => t.id === editingTxId ? {
      ...editTxForm, amount: Number(editTxForm.amount), accountId: Number(editTxForm.accountId)
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
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredIn = displayedTransactions.filter(t => t.type === 'ingreso').reduce((s, t) => s + t.amount, 0);
  const filteredOut = displayedTransactions.filter(t => t.type === 'gasto').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800">Transacciones</h2>
          <button onClick={() => exportToCSV(transactions, accounts)} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors border border-emerald-200">
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
            {periodFilter === 'mes' && <input type="month" value={specificMonth} onChange={e => setSpecificMonth(e.target.value)} className="p-2 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 w-full sm:w-auto" />}
            {periodFilter === 'dia' && <input type="date" value={specificDate} onChange={e => setSpecificDate(e.target.value)} className="p-2 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 w-full sm:w-auto" />}
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
          <input type="text" placeholder="Descripción" value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} className="p-2 border rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 outline-none w-full" required />
          <input type="text" placeholder="Nota opcional" value={newTx.notes} onChange={e => setNewTx({...newTx, notes: e.target.value})} className="p-2 border rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 outline-none w-full"/>
          <input type="number" placeholder="Monto" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} className="p-2 border rounded-lg md:w-48 focus:ring-2 focus:ring-blue-500 outline-none w-full" required min="1"/>
          <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium w-full md:w-auto px-6">
            <Plus size={20} /> Registrar
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
                    {/* NUEVO INPUT DE NOTAS PARA EDICIÓN */}
                    <input type="text" placeholder="Nota opcional" value={editTxForm.notes || ''} onChange={e => setEditTxForm({...editTxForm, notes: e.target.value})} className="p-2 border rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 outline-none"/>
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
                      {/* ESTO MUESTRA LA NOTA SI ES QUE EXISTE */}
                      {t.notes && ( <p className="text-xs text-slate-400 mt-0.5 italic">{t.notes}</p>)}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-sm text-slate-500">{t.date}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"/>
                        <span className="text-sm text-slate-500">{t.category}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"/>
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
                      <Edit2 size={18}/>
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18}/>
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
}