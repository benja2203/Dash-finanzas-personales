import { useState } from 'react';
import {
  LayoutDashboard, ArrowRightLeft, CreditCard, Target,
  ShoppingCart, Wallet, Landmark, Repeat, FileText, PiggyBank, Tag, User
} from 'lucide-react';

// 👇 1. Importamos los nuevos componentes de Auth
import { useAuth } from './context/AuthContext';
import LoginView from './views/LoginView';

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
  
  // 👇 2. Extraemos las variables de Auth y agregamos "syncing" de Finance
  const { user, logout } = useAuth();
  const { resetAllData, syncing } = useFinance();

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

  // 👇 3. Bloqueo de seguridad: Si no hay usuario logueado, mostramos la pantalla de Login
  if (!user) return <LoginView />;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 z-10">
        
        <div className="p-6 pb-4 flex justify-between items-center">
          <h1 className="text-2xl font-black text-blue-600 flex items-center gap-2">
            <Wallet size={28} /> Mis Finanzas
          </h1>
          {/* 👇 4. Indicador de guardado */}
          {syncing && <span className="text-xs text-blue-400 font-medium animate-pulse">Guardando...</span>}
        </div>

        {/* 👇 5. Perfil de usuario en el menú lateral */}
        <div className="px-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            {/* El referrerPolicy ayuda a que la imagen de Google cargue sin bloqueos de seguridad */}
            <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full bg-slate-100" referrerPolicy="no-referrer" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{user.displayName}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
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
        
        <div className="p-4 border-t border-slate-200 space-y-2">
          {/* 👇 6. Botón de Cerrar Sesión */}
          <button
            onClick={logout}
            className="w-full px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cerrar sesión
          </button>
          <button
            onClick={resetAllData}
            className="w-full px-4 py-2 text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Resetear todos los datos
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="md:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-10 flex justify-between items-center">
          <h1 className="text-xl font-black text-blue-600 flex items-center gap-2">
            <Wallet size={24} /> Mis Finanzas
          </h1>
          {/* Indicador de guardado también en la vista de celular */}
          {syncing && <span className="text-xs text-blue-400 font-medium animate-pulse">Guardando...</span>}
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

            {/* 👇 Vista de Perfil exclusiva para móvil */}
            {currentView === 'profile' && (
              <div className="flex flex-col items-center justify-center pt-8 space-y-8 md:hidden">
                <div className="flex flex-col items-center space-y-2">
                  <img src={user.photoURL} alt={user.displayName} className="w-24 h-24 rounded-full border-4 border-white shadow-md" referrerPolicy="no-referrer" />
                  <h2 className="text-xl font-bold text-slate-800 mt-2">{user.displayName}</h2>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <div className="w-full max-w-xs space-y-4">
                  <button
                    onClick={logout}
                    className="w-full px-4 py-3 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all"
                  >
                    Cerrar sesión
                  </button>
                  <button
                    onClick={resetAllData}
                    className="w-full px-4 py-3 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl shadow-sm hover:bg-red-100 transition-all"
                  >
                    Resetear todos los datos
                  </button>
                </div>
              </div>
            )}
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

          {/* 👇 Botón de Perfil fijo al final de la barra para móviles */}
          <button
            onClick={() => setCurrentView('profile')}
            className={`flex flex-col items-center justify-center p-2 min-w-[72px] flex-shrink-0 transition-colors ${
              currentView === 'profile' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <User size={24} />
            <span className="text-[10px] font-medium mt-1">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}