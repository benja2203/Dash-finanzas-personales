import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/helpers.jsx';
import { Plus, Trash2, Edit2, Banknote, ArrowUpRight, ArrowDownLeft, CheckCircle2, CalendarClock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DebtsView() {
  const { debts, setDebts, accounts, transactions, setTransactions, defaultAccountId } = useFinance();
  
  const [newDebt, setNewDebt] = useState({ name: '', totalAmount: '', type: 'por_pagar', dueDate: new Date().toISOString().split('T')[0] });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [paymentAccounts, setPaymentAccounts] = useState({});

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newDebt.name || !newDebt.totalAmount) return;
    setDebts([...debts, { ...newDebt, id: Date.now(), totalAmount: Number(newDebt.totalAmount), paidAmount: 0 }]);
    setNewDebt({ name: '', totalAmount: '', type: 'por_pagar', dueDate: new Date().toISOString().split('T')[0] });
    toast.success('Registro exitoso');
  };

  const startEdit = (debt) => { setEditingId(debt.id); setEditForm(debt); };
  
  const saveEdit = () => {
    setDebts(debts.map(d => d.id === editingId ? { ...editForm, totalAmount: Number(editForm.totalAmount) } : d));
    setEditingId(null);
    toast.success('Se ha editado correctamente');
  };

  const addPayment = (debt) => {
    const amount = Number(paymentAmounts[debt.id]);
    const rawAccountId = paymentAccounts[debt.id] || defaultAccountId;
    const accountIdNumber = Number(rawAccountId);

    if (!amount || amount <= 0) return;
    if (!accountIdNumber) {
      toast.success("Debes crear al menos una cuenta en la pestaña 'Cuentas' para poder hacer abonos.");
      return;
    }

    setDebts(debts.map(d => d.id === debt.id ? { ...d, paidAmount: Math.min(d.totalAmount, d.paidAmount + amount) } : d));
    
    const newTx = {
      id: Date.now() + Math.random(),
      type: debt.type === 'por_pagar' ? 'gasto' : 'ingreso',
      amount: amount,
      description: `Abono a deuda: ${debt.name}`,
      notes: 'Generado automáticamente',
      category: 'Otros',
      accountId: accountIdNumber,
      date: new Date().toISOString().split('T')[0]
    };
    
    setTimeout(() => {
      setTransactions([...transactions, newTx]);
    }, 500);

    setPaymentAmounts({ ...paymentAmounts, [debt.id]: '' });
    toast.success('Abono registrado en tu cuenta');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Deudas por Pagar / Cobrar</h2>
        <p className="text-slate-500 mt-1 text-sm">La fecha corresponde al <span className="font-semibold">plazo límite</span>: hasta cuándo tienes para pagar (o cobrar) la deuda.</p>
      </div>

      <form onSubmit={handleAdd} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3 items-stretch md:items-end">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto flex-shrink-0">
          <button type="button" onClick={() => setNewDebt({...newDebt, type: 'por_pagar'})} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${newDebt.type === 'por_pagar' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}>Yo debo</button>
          <button type="button" onClick={() => setNewDebt({...newDebt, type: 'por_cobrar'})} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${newDebt.type === 'por_cobrar' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>Me deben</button>
        </div>

        <input type="text" placeholder="Concepto o Persona" value={newDebt.name} onChange={e => setNewDebt({...newDebt, name: e.target.value})} className={`p-2 border rounded-lg flex-1 outline-none focus:ring-2 ${newDebt.type === 'por_pagar' ? 'focus:ring-red-500' : 'focus:ring-emerald-500'}`} required />
        <input type="number" placeholder="Monto Total" value={newDebt.totalAmount} onChange={e => setNewDebt({...newDebt, totalAmount: e.target.value})} className={`p-2 border rounded-lg w-full md:w-32 outline-none focus:ring-2 ${newDebt.type === 'por_pagar' ? 'focus:ring-red-500' : 'focus:ring-emerald-500'}`} required min="1" />
        <div className="flex flex-col w-full md:w-auto">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1 ml-1">
            {newDebt.type === 'por_pagar' ? 'Pagar antes de' : 'Cobrar antes de'}
          </label>
          <input type="date" value={newDebt.dueDate} onChange={e => setNewDebt({...newDebt, dueDate: e.target.value})} className={`p-2 border rounded-lg w-full md:w-auto outline-none focus:ring-2 ${newDebt.type === 'por_pagar' ? 'focus:ring-red-500' : 'focus:ring-emerald-500'}`} required />
        </div>
        <button type="submit" className={`${newDebt.type === 'por_pagar' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white p-2 rounded-lg flex items-center justify-center gap-2 font-medium w-full md:w-auto px-4 transition-colors`}>
          <Plus size={20} /> Nueva
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6">
        {debts.map(d => {
          const isPagar = d.type === 'por_pagar';
          const themeColor = isPagar ? 'red' : 'emerald';
          // 👇 Evaluamos si la deuda ya se pagó por completo
          const isCompleted = d.paidAmount >= d.totalAmount;

          if (editingId === d.id) {
            return (
              <div key={d.id} className={`bg-white p-5 rounded-2xl shadow-sm border border-${themeColor}-300 flex flex-col gap-3`}>
                <p className={`text-sm font-bold text-${themeColor}-600 mb-1`}>Editando Registro</p>
                <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className={`p-2 border rounded-lg focus:ring-2 focus:ring-${themeColor}-500 outline-none`} placeholder="Nombre" />
                <input type="number" value={editForm.totalAmount} onChange={e => setEditForm({...editForm, totalAmount: e.target.value})} className={`p-2 border rounded-lg focus:ring-2 focus:ring-${themeColor}-500 outline-none`} placeholder="Monto Total" />
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide -mb-1 ml-1">Plazo límite de pago / cobro</label>
                <input type="date" value={editForm.dueDate} onChange={e => setEditForm({...editForm, dueDate: e.target.value})} className={`p-2 border rounded-lg focus:ring-2 focus:ring-${themeColor}-500 outline-none`} />
                <div className="flex gap-2 mt-2">
                  <button onClick={saveEdit} className={`flex-1 bg-${themeColor}-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-${themeColor}-600 transition-colors`}>Guardar</button>
                  <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">Cancelar</button>
                </div>
              </div>
            );
          }

          const progress = (d.paidAmount / d.totalAmount) * 100;
          const todayStr = new Date().toISOString().split('T')[0];
          const isOverdue = !isCompleted && d.dueDate && d.dueDate < todayStr;
          return (
            <div key={d.id} className={`bg-white p-4 sm:p-5 rounded-2xl shadow-sm border flex flex-col transition-all ${isCompleted ? 'border-slate-200 bg-slate-50' : 'border-slate-100'}`}>
              <div className="flex justify-between mb-2 items-start gap-2">
                <h3 className={`font-bold flex items-start gap-2 flex-1 min-w-0 ${isCompleted ? 'text-slate-500' : 'text-slate-800'}`}>
                  <Banknote className={`flex-shrink-0 mt-0.5 ${isCompleted ? 'text-slate-400' : isPagar ? 'text-red-500' : 'text-emerald-500'}`} size={18}/>
                  <span className="leading-tight truncate">{d.name}</span>
                </h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${isCompleted ? 'bg-slate-200 text-slate-500' : isPagar ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {isCompleted ? 'Completado' : isPagar ? 'Yo debo' : 'Me deben'}
                  </span>
                  {!isCompleted && (
                    <button onClick={() => startEdit(d)} className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors ml-1"><Edit2 size={16}/></button>
                  )}
                  <button onClick={() => { setDebts(debts.filter(x => x.id !== d.id)); toast.error('Deuda eliminada'); }} className={`p-1.5 text-slate-300 rounded-md transition-colors ${isPagar ? 'hover:text-red-500 hover:bg-red-50' : 'hover:text-emerald-500 hover:bg-emerald-50'}`}><Trash2 size={16}/></button>
                </div>
              </div>
              
              <div className="flex justify-between text-sm text-slate-500 mb-4 mt-2 gap-2">
                <span className={`truncate flex items-center gap-1 ${isOverdue ? 'text-red-500 font-semibold' : ''}`}>
                  <CalendarClock size={13} className="flex-shrink-0" />
                  {isPagar ? 'Pagar antes:' : 'Cobrar antes:'} {d.dueDate}
                  {isOverdue && <span className="ml-1 text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase">Vencida</span>}
                </span>
                <span className="flex-shrink-0">Falta: {formatCurrency(d.totalAmount - d.paidAmount)}</span>
              </div>
              
              <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2 overflow-hidden mt-auto">
                <div className={`h-2.5 rounded-full transition-all duration-500 ${isCompleted ? 'bg-slate-400' : isPagar ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${progress}%` }} />
              </div>
              
              <div className="flex justify-between text-xs text-slate-500 font-medium mb-4">
                <span>{isPagar ? 'Pagado' : 'Recaudado'}: {formatCurrency(d.paidAmount)}</span>
                <span>Total: {formatCurrency(d.totalAmount)}</span>
              </div>
              
              {/* 👇 Renderizado Condicional: Si está completa, muestra el botón de liquidar. Si no, muestra los inputs de abono */}
              {isCompleted ? (
                <div className="mt-2 pt-3 border-t border-slate-200">
                  <button onClick={() => { setDebts(debts.filter(x => x.id !== d.id)); toast.success('¡Deuda liquidada y archivada! 🎉'); }} className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 shadow-sm">
                    <CheckCircle2 size={18} /> Liquidar y Ocultar
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 mt-2 pt-3 border-t border-slate-50">
                  <div className="flex flex-1 gap-2">
                    <select 
                      value={paymentAccounts[d.id] || defaultAccountId}
                      onChange={e => setPaymentAccounts({...paymentAccounts, [d.id]: e.target.value})}
                      className="flex-1 p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 outline-none max-w-[140px] text-slate-600"
                    >
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      {accounts.length === 0 && <option value="">Sin cuentas</option>}
                    </select>
                    <input 
                      type="number" placeholder="Monto" 
                      value={paymentAmounts[d.id] || ''} 
                      onChange={e => setPaymentAmounts({...paymentAmounts, [d.id]: e.target.value})} 
                      className={`flex-1 p-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 ${isPagar ? 'focus:ring-red-500' : 'focus:ring-emerald-500'}`} min="1" 
                    />
                  </div>
                  <button 
                    onClick={() => addPayment(d)} 
                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors flex items-center justify-center gap-1 ${isPagar ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                  >
                    {isPagar ? <ArrowUpRight size={16}/> : <ArrowDownLeft size={16}/>} Abono
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}