import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CategoriesView() {
  const { customExpenseCategories, setCustomExpenseCategories, customIncomeCategories, setCustomIncomeCategories } = useFinance();
  const [newExpCat, setNewExpCat] = useState('');
  const [newIncCat, setNewIncCat] = useState('');

  const addExpense = (e) => {
    e.preventDefault();
    if (!newExpCat.trim()) return;
    setCustomExpenseCategories([...customExpenseCategories, newExpCat.trim()]);
    setNewExpCat('');
    toast.success('Categoría de gasto creada');
  };

  const addIncome = (e) => {
    e.preventDefault();
    if (!newIncCat.trim()) return;
    setCustomIncomeCategories([...customIncomeCategories, newIncCat.trim()]);
    setNewIncCat('');
    toast.success('Categoría de ingreso creada');
  };

  const defaultExpense = ['Alimentación', 'Transporte', 'Vivienda', 'Servicios', 'Entretenimiento', 'Salud', 'Educación', 'Otros'];
  const defaultIncome = ['Salario', 'Inversiones', 'Negocios', 'Regalos', 'Otros'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Categorías</h2>
        <p className="text-slate-500 mt-1">Agrega categorías personalizadas además de las predeterminadas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
          <h3 className="font-bold text-slate-800">Categorías de Gasto</h3>
          <form onSubmit={addExpense} className="flex gap-2">
            <input type="text" placeholder="Nueva categoría" value={newExpCat} onChange={e => setNewExpCat(e.target.value)} className="p-2 border rounded-lg flex-1 focus:ring-2 focus:ring-red-400 outline-none text-sm" />
            <button type="submit" className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors">
              <Plus size={18}/>
            </button>
          </form>
          <div className="space-y-2">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Predeterminadas</p>
            {defaultExpense.map(c => (
              <div key={c} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg text-sm text-slate-500">{c}</div>
            ))}
            {customExpenseCategories.length > 0 && (
              <>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider pt-2">Personalizadas</p>
                {customExpenseCategories.map(c => (
                  <div key={c} className="flex items-center justify-between px-3 py-2 bg-red-50 rounded-lg text-sm text-red-700">
                    {c}
                    <button onClick={() => { setCustomExpenseCategories(customExpenseCategories.filter(x => x !== c)); toast.error('Categoría eliminada'); }} className="text-red-300 hover:text-red-600 transition-colors">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
          <h3 className="font-bold text-slate-800">Categorías de Ingreso</h3>
          <form onSubmit={addIncome} className="flex gap-2">
            <input type="text" placeholder="Nueva categoría" value={newIncCat} onChange={e => setNewIncCat(e.target.value)} className="p-2 border rounded-lg flex-1 focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
            <button type="submit" className="bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
              <Plus size={18}/>
            </button>
          </form>
          <div className="space-y-2">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Predeterminadas</p>
            {defaultIncome.map(c => (
              <div key={c} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg text-sm text-slate-500">{c}</div>
            ))}
            {customIncomeCategories.length > 0 && (
              <>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider pt-2">Personalizadas</p>
                {customIncomeCategories.map(c => (
                  <div key={c} className="flex items-center justify-between px-3 py-2 bg-emerald-50 rounded-lg text-sm text-emerald-700">
                    {c}
                    <button onClick={() => { setCustomIncomeCategories(customIncomeCategories.filter(x => x !== c)); toast.error('Categoría eliminada'); }} className="text-emerald-300 hover:text-emerald-600 transition-colors">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}