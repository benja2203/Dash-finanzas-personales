import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/helpers.jsx';
import { Plus, Trash2, CheckCircle2, Circle, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WishlistView() {
  const { wishlist, setWishlist } = useFinance();
  const [newItem, setNewItem] = useState({ name: '', price: '', priority: 'Media' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;
    setWishlist([...wishlist, { ...newItem, id: Date.now(), price: Number(newItem.price), purchased: false }]);
    setNewItem({ name: '', price: '', priority: 'Media' });
    toast.success('Artículo añadido a tu lista de deseos');
  };

  const togglePurchased = (id) => setWishlist(wishlist.map(w => w.id === id ? { ...w, purchased: !w.purchased } : w));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Cosas que Comprar</h2>

      <form onSubmit={handleAdd} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3">
        <input type="text" placeholder="¿Qué quieres comprar?" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="p-2 border rounded-lg flex-1 focus:ring-2 focus:ring-purple-500 outline-none" required />
        <input type="number" placeholder="Precio estimado" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" required min="1" />
        <select value={newItem.priority} onChange={e => setNewItem({...newItem, priority: e.target.value})} className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
          <option value="Baja">Prioridad Baja</option>
          <option value="Media">Prioridad Media</option>
          <option value="Alta">Prioridad Alta</option>
        </select>
        <button type="submit" className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 font-medium">
          <Plus size={20} /> Añadir
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6">
        {wishlist.sort((a, b) => a.purchased === b.purchased ? 0 : a.purchased ? 1 : -1).map(w => (
          <div key={w.id} className={`p-4 rounded-2xl border transition-all ${w.purchased ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button onClick={() => {togglePurchased(w.id); toast.success(w.purchased ? 'Marcado como pendiente' : '¡Artículo comprado! 🎉'); }}  
                  className="mt-1 flex-shrink-0">{w.purchased ? <CheckCircle2 className="text-emerald-500" size={24} /> : <Circle className="text-slate-300 hover:text-purple-500" size={24} />}</button>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold flex items-start gap-2 leading-snug break-words ${w.purchased ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                    <Package className={`flex-shrink-0 mt-0.5 ${w.purchased ? 'text-slate-400' : 'text-purple-500'}`} size={18}/>
                    <span className="truncate">{w.name}</span>
                  </h3>
                  <p className="text-slate-500 font-medium mt-1">{formatCurrency(w.price)}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <button onClick={() => { setWishlist(wishlist.filter(x => x.id !== w.id)); toast.error('Artículo eliminado'); }} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                  <Trash2 size={16}/>
                </button>
                {!w.purchased && (
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${w.priority === 'Alta' ? 'bg-red-100 text-red-600' : w.priority === 'Media' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                    {w.priority}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}