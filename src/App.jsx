import { useState } from 'react';
import {
  LayoutDashboard, ArrowRightLeft, CreditCard, Target,
  ShoppingCart, Wallet, Landmark, Repeat, FileText, PiggyBank, Tag
} from 'lucide-react';

import DashboardView from './views/DashboardView';
import AccountsView from './views/AccountsView';
import TransactionsView from './views/TransactionsView';
import ImportView from './views/ImportView';
import SubscriptionsView from './views/SubscriptionsView';
import DebtsView from './views/DebtsView';
import GoalsView from './views/GoalsView';
import WishlistView from './views/WishlistView';
import BudgetsView from './views/BudgetsView';
import CategoriesView from './views/CategoriesView';
import { useFinance } from './context/FinanceContext';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const { resetAllData } = useFinance();
  const navItems = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'accounts', label: 'Cuentas', icon: Landmark },
    { id: 'transactions', label: 'Movimientos', icon: ArrowRightLeft },
    { id: 'import', label: 'Importar', icon: FileText },
    { id: 'subscriptions', label: 'Gastos Fijos', icon: Repeat },
    { id: 'debts', label: 'Deudas', icon: CreditCard },
    { id: 'goals', label: 'Ahorros', icon: Target },
    { id: 'wishlist', label: 'Compras', icon: ShoppingCart },
    { id: 'budgets', label: 'Presupuestos', icon: PiggyBank },
    { id: 'categories', label: 'Categorías', icon: Tag },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 z-10">
        <div className="p-6">
          <h1 className="text-2xl font-black text-blue-600 flex items-center gap-2">
            <Wallet size={28} /> Mis Finanzas
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                currentView === item.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={resetAllData}
            className="w-full px-4 py-2 text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Resetear todos los datos
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="md:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
          <h1 className="text-xl font-black text-blue-600 flex items-center justify-center gap-2">
            <Wallet size={24} /> Mis Finanzas
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-5xl mx-auto">
            {currentView === 'dashboard' && <DashboardView />}
            {currentView === 'accounts' && <AccountsView />}
            {currentView === 'transactions' && <TransactionsView />}
            {currentView === 'import' && <ImportView />}
            {currentView === 'subscriptions' && <SubscriptionsView />}
            {currentView === 'debts' && <DebtsView />}
            {currentView === 'goals' && <GoalsView />}
            {currentView === 'wishlist' && <WishlistView />}
            {currentView === 'budgets' && <BudgetsView />}
            {currentView === 'categories' && <CategoriesView />}
          </div>
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex overflow-x-auto z-20 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style dangerouslySetInnerHTML={{__html: `nav::-webkit-scrollbar { display: none; }`}} />
        <div className="flex w-full px-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center justify-center p-2 min-w-[72px] flex-shrink-0 transition-colors ${
                currentView === item.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <item.icon size={24} />
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}