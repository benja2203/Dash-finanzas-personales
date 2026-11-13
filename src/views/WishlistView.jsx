import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/helpers.jsx';
import { Plus, Trash2, Edit2, CheckCircle2, Circle, Package, ShoppingBag, SlidersHorizontal, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

// Tipos de producto para organizar la lista de compras
const PRODUCT_TYPES = ['Tecnología', 'Hogar', 'Ropa y Accesorios', 'Supermercado', 'Salud y Belleza', 'Entretenimiento', 'Vehículo', 'Otros'];

// Orden de prioridad para que las "Alta" salgan siempre arriba
const PRIORITY_RANK = { 'Alta': 0, 'Media': 1, 'Baja': 2 };

export default function WishlistView() {
  // 👇 Traemos accounts, defaultAccountId y transactions del contexto
  const { wishlist, setWishlist, accounts, transactions, setTransactions, defaultAccountId } = useFinance();

  const [newItem, setNewItem] = useState({ name: '', price: '', priority: 'Media', category: 'Otros' });
  const [paymentAccounts, setPaymentAccounts] = useState({}); // Memoria para el selector de cuentas

  // 👇 Estados de edición
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // 👇 Filtros para no perderse en listas largas
  const [filterPriority, setFilterPriority] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('todas');
  const [filterType, setFilterType] = useState('Todos');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;
    setWishlist([...wishlist, { ...newItem, id: Date.now(), price: Number(newItem.price), purchased: false }]);
    setNewItem({ name: '', price: '', priority: 'Media', category: 'Otros' });
    toast.success('Artículo añadido a tu lista de deseos');
  };

  const startEdit = (item) => { setEditingId(item.id); setEditForm({ category: 'Otros', ...item }); };
  const saveEdit = () => {
    if (!editForm.name || !editForm.price) { toast.error('El nombre y el precio son obligatorios'); return; }
    setWishlist(wishlist.map(w => w.id === editingId ? { ...editForm, price: Number(editForm.price) } : w));
    setEditingId(null);
    toast.success('Artículo actualizado');
  };

  // 👇 Procesa la compra y genera el gasto en la cuenta
  const purchaseItem = (item) => {
    const rawAccountId = paymentAccounts[item.id] || defaultAccountId;
    const accountIdNumber = Number(rawAccountId);

    if (!accountIdNumber) {
      toast.error("Debes crear al menos una cuenta bancaria para comprar.");
      return;
    }

    // 1. Marcamos el artículo como comprado
    setWishlist(wishlist.map(w => w.id === item.id ? { ...w, purchased: true } : w));

    // 2. Generamos el movimiento de salida de dinero
    const newTx = {
      id: Date.now() + Math.random(),
      type: 'gasto',
      amount: item.price,
      description: `Compra: ${item.name}`,
      notes: 'Comprado desde Lista de Deseos',
      category: 'Otros', // Se va a la categoría general
      accountId: accountIdNumber,
      date: new Date().toISOString().split('T')[0]
    };

    // Le damos un respiro a Firebase antes de guardar la transacción
    setTimeout(() => {
      setTransactions([...transactions, newTx]);
    }, 500);

    toast.success('¡Artículo comprado y descontado de tu cuenta! 🎉');
  };

  // Aplicamos filtros y luego el orden: pendientes primero, y dentro por prioridad (Alta arriba)
  const visibleWishlist = wishlist
    .filter(w => filterPriority === 'Todas' || w.priority === filterPriority)
    .filter(w => filterStatus === 'todas' || (filterStatus === 'pendientes' ? !w.purchased : w.purchased))
    .filter(w => filterType === 'Todos' || (w.category || 'Otros') === filterType)
    .sort((a, b) => {
      if (a.purchased !== b.purchased) return a.purchased ? 1 : -1;
      return (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1);
    });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Cosas que Comprar</h2>

      <form onSubmit={handleAdd} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:flex-wrap gap-3">
        <input type="text" placeholder="¿Qué quieres comprar?" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="p-2 border rounded-lg flex-1 min-w-[160px] focus:ring-2 focus:ring-purple-500 outline-none" required />
        <input type="number" placeholder="Precio estimado" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="p-2 border rounded-lg md:w-40 focus:ring-2 focus:ring-purple-500 outline-none" required min="1" />
        <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-medium text-slate-600">
          {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={newItem.priority} onChange={e => setNewItem({...newItem, priority: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-medium text-slate-600">
          <option value="Baja">Prioridad Baja</option>
          <option value="Media">Prioridad Media</option>
          <option value="Alta">Prioridad Alta</option>
        </select>
        <button type="submit" className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 font-medium px-6 shadow-sm">
          <Plus size={20} /> Añadir
        </button>
      </form>

      {/* 👇 Barra de filtros */}
      {wishlist.length > 0 && (
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-500 flex-shrink-0">
            <SlidersHorizontal size={16} /> Filtrar:
          </span>
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-600 flex-1">
              <option value="Todos">Todos los tipos</option>
              {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-600 flex-1">
              <option value="Todas">Todas las prioridades</option>
              <option value="Alta">Prioridad Alta</option>
              <option value="Media">Prioridad Media</option>
              <option value="Baja">Prioridad Baja</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-600 flex-1">
              <option value="todas">Todas (pendientes y compradas)</option>
              <option value="pendientes">Solo pendientes</option>
              <option value="compradas">Solo compradas</option>
            </select>
          </div>
          <span className="text-xs text-slate-400 font-medium flex-shrink-0">{visibleWishlist.length} de {wishlist.length}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6">
        {visibleWishlist.map(w => {
          // 👇 Modo edición de la tarjeta
          if (editingId === w.id) {
            return (
              <div key={w.id} className="bg-white p-5 rounded-2xl shadow-sm border border-purple-300 flex flex-col gap-3">
                <p className="text-sm font-bold text-purple-600 mb-1">Editando Artículo</p>
                <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Nombre" />
                <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Precio estimado" min="1" />
                <select value={editForm.category || 'Otros'} onChange={e => setEditForm({...editForm, category: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-slate-600">
                  {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={editForm.priority} onChange={e => setEditForm({...editForm, priority: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-slate-600">
                  <option value="Baja">Prioridad Baja</option>
                  <option value="Media">Prioridad Media</option>
                  <option value="Alta">Prioridad Alta</option>
                </select>
                <div className="flex gap-2 mt-2">
                  <button onClick={saveEdit} className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">Guardar</button>
                  <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">Cancelar</button>
                </div>
              </div>
            );
          }

          return (
          <div key={w.id} className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col ${w.purchased ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="mt-1 flex-shrink-0">
                  {w.purchased ? <CheckCircle2 className="text-slate-400" size={24} /> : <Circle className="text-purple-200" size={24} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold flex items-start gap-2 leading-snug break-words ${w.purchased ? 'text-slate-500' : 'text-slate-800'}`}>
                    <Package className={`flex-shrink-0 mt-0.5 ${w.purchased ? 'text-slate-400' : 'text-purple-500'}`} size={18}/>
                    <span className="truncate">{w.name}</span>
                  </h3>
                  <p className="text-slate-500 font-medium mt-1">{formatCurrency(w.price)}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-2">
                    <Tag size={11} /> {w.category || 'Otros'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="flex items-center gap-1">
                  {!w.purchased && (
                    <button onClick={() => startEdit(w)} className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors">
                      <Edit2 size={16}/>
                    </button>
                  )}
                  <button onClick={() => { setWishlist(wishlist.filter(x => x.id !== w.id)); toast.error('Artículo eliminado'); }} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                    <Trash2 size={16}/>
                  </button>
                </div>
                {!w.purchased && (
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-md font-bold ${w.priority === 'Alta' ? 'bg-red-100 text-red-600' : w.priority === 'Media' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                    {w.priority}
                  </span>
                )}
              </div>
            </div>

            {/* 👇 RENDERIZADO CONDICIONAL DEL FOOTER */}
            {w.purchased ? (
              <div className="mt-4 pt-3 border-t border-slate-200">
                <button
                  onClick={() => { setWishlist(wishlist.filter(x => x.id !== w.id)); toast.success('¡Compra liquidada y archivada! 🎉'); }}
                  className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <CheckCircle2 size={18} /> Liquidar y Ocultar
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-3 border-t border-slate-50 mt-auto">
                <select
                  value={paymentAccounts[w.id] || defaultAccountId}
                  onChange={e => setPaymentAccounts({...paymentAccounts, [w.id]: e.target.value})}
                  className="flex-1 p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 outline-none text-slate-600 bg-slate-50"
                >
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  {accounts.length === 0 && <option value="">Sin cuentas</option>}
                </select>
                <button
                  onClick={() => purchaseItem(w)}
                  className="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl text-sm font-bold hover:bg-purple-100 transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={16}/> Comprar
                </button>
              </div>
            )}

          </div>
          );
        })}
        {wishlist.length === 0 && <p className="text-slate-400 font-medium col-span-full text-center py-8">No tienes nada en tu lista de deseos por ahora.</p>}
        {wishlist.length > 0 && visibleWishlist.length === 0 && <p className="text-slate-400 font-medium col-span-full text-center py-8">Ningún artículo coincide con los filtros seleccionados.</p>}
      </div>
    </div>
  );
}
