import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const FinanceContext = createContext();
export const useFinance = () => useContext(FinanceContext);

// 👉 CORRECCIÓN 1: Todo empieza vacío, desde cero, como pediste.
const DEFAULT_DATA = {
  accounts: [], 
  transactions: [],
  subscriptions: [],
  debts: [],
  goals: [],
  wishlist: [],
  budgets: [],
  customExpenseCategories: [],
  customIncomeCategories: [],
};

const EXPENSE_CATS = ['Alimentación', 'Transporte', 'Vivienda', 'Servicios', 'Entretenimiento', 'Salud', 'Educación', 'Otros'];
const INCOME_CATS = ['Salario', 'Inversiones', 'Negocios', 'Regalos', 'Otros'];

export const FinanceProvider = ({ children }) => {
  const { user } = useAuth();

  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [debts, setDebts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [customExpenseCategories, setCustomExpenseCategories] = useState([]);
  const [customIncomeCategories, setCustomIncomeCategories] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const expenseCategories = [...EXPENSE_CATS, ...customExpenseCategories];
  const incomeCategories = [...INCOME_CATS, ...customIncomeCategories];

  // Cargar datos desde Firestore o localStorage
  useEffect(() => {
    const load = async () => {
      if (user) {
        // Usuario logueado: cargar desde Firestore
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        const data = snap.exists() ? snap.data() : DEFAULT_DATA;
        setAccounts(data.accounts ?? DEFAULT_DATA.accounts);
        setTransactions(data.transactions ?? []);
        setSubscriptions(data.subscriptions ?? []);
        setDebts(data.debts ?? []);
        setGoals(data.goals ?? []);
        setWishlist(data.wishlist ?? []);
        setBudgets(data.budgets ?? []);
        setCustomExpenseCategories(data.customExpenseCategories ?? []);
        setCustomIncomeCategories(data.customIncomeCategories ?? []);
      } else {
        // Sin login: usar localStorage como fallback
        const get = (key, fallback) => {
          const s = localStorage.getItem(key);
          return s ? JSON.parse(s) : fallback;
        };
        setAccounts(get('mf_accounts', DEFAULT_DATA.accounts));
        setTransactions(get('mf_transactions', []));
        setSubscriptions(get('mf_subscriptions', []));
        setDebts(get('mf_debts', []));
        setGoals(get('mf_goals', []));
        setWishlist(get('mf_wishlist', []));
        setBudgets(get('mf_budgets', []));
        setCustomExpenseCategories(get('mf_custom_expense_cats', []));
        setCustomIncomeCategories(get('mf_custom_income_cats', []));
      }
      setLoaded(true);
    };
    load();
  }, [user]);

  // Guardar datos - Firestore si hay user, localStorage si no
  const saveData = async (newState) => {
    if (user) {
      setSyncing(true);
      try {
        await setDoc(doc(db, 'users', user.uid), newState, { merge: true });
      } finally {
        setSyncing(false);
      }
    } else {
      Object.entries(newState).forEach(([key, value]) => {
        const map = {
          accounts: 'mf_accounts', transactions: 'mf_transactions',
          subscriptions: 'mf_subscriptions', debts: 'mf_debts',
          goals: 'mf_goals', wishlist: 'mf_wishlist', budgets: 'mf_budgets',
          customExpenseCategories: 'mf_custom_expense_cats',
          customIncomeCategories: 'mf_custom_income_cats',
        };
        if (map[key]) localStorage.setItem(map[key], JSON.stringify(value));
      });
    }
  };

  const getCurrentState = () => ({
    accounts, transactions, subscriptions, debts,
    goals, wishlist, budgets, customExpenseCategories, customIncomeCategories
  });

  // Wrappers que guardan automáticamente
  const update = (setter, key) => (val) => {
    setter(val);
    saveData({ ...getCurrentState(), [key]: val });
  };

  // Motor de pagos automáticos
  useEffect(() => {
    if (!loaded || subscriptions.length === 0) return;
    const todayStr = new Date().toISOString().split('T')[0];
    let hasChanges = false;
    let newTxs = [];
    const updatedSubs = subscriptions.map(sub => {
      let currentSub = { ...sub };
      let safetyCounter = 0;
      while (currentSub.isActive && currentSub.nextPaymentDate <= todayStr && safetyCounter < 24) {
        hasChanges = true;
        safetyCounter++;
        newTxs.push({
          id: Date.now() + Math.random(),
          type: 'gasto',
          amount: currentSub.amount,
          description: `${currentSub.name} (Automático)`,
          category: currentSub.category,
          accountId: currentSub.accountId,
          date: currentSub.nextPaymentDate,
          isRecurring: true
        });
        const dateObj = new Date(currentSub.nextPaymentDate + 'T12:00:00');
        dateObj.setMonth(dateObj.getMonth() + 1);
        currentSub.nextPaymentDate = dateObj.toISOString().split('T')[0];
      }
      return currentSub;
    });
    if (hasChanges) {
      const newTransactions = [...transactions, ...newTxs];
      setTransactions(newTransactions);
      setSubscriptions(updatedSubs);
      saveData({ ...getCurrentState(), transactions: newTransactions, subscriptions: updatedSubs });
    }
  }, [loaded]);

  const getAccountBalance = (accountId) => {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return 0;
    let bal = acc.initialBalance;
    transactions.forEach(t => {
      if (t.type === 'ingreso' && t.accountId === accountId) bal += t.amount;
      if (t.type === 'gasto' && t.accountId === accountId) bal -= t.amount;
      if (t.type === 'transferencia') {
        if (t.accountId === accountId) bal -= t.amount;
        if (t.targetAccountId === accountId) bal += t.amount;
      }
    });
    return bal;
  };

  const totalNetWorth = accounts.reduce((sum, acc) => sum + getAccountBalance(acc.id), 0);

  const resetAllData = async () => {
    if (!window.confirm('¿Seguro que quieres borrar TODOS los datos?')) return;
    if (user) {
      await setDoc(doc(db, 'users', user.uid), DEFAULT_DATA);
    }
    localStorage.clear();
    window.location.reload();
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Cargando datos...</div>
      </div>
    );
  }

  return (
    <FinanceContext.Provider value={{
      accounts, setAccounts: update(setAccounts, 'accounts'),
      transactions, setTransactions: update(setTransactions, 'transactions'),
      subscriptions, setSubscriptions: update(setSubscriptions, 'subscriptions'),
      debts, setDebts: update(setDebts, 'debts'),
      goals, setGoals: update(setGoals, 'goals'),
      wishlist, setWishlist: update(setWishlist, 'wishlist'),
      budgets, setBudgets: update(setBudgets, 'budgets'),
      customExpenseCategories, setCustomExpenseCategories: update(setCustomExpenseCategories, 'customExpenseCategories'),
      customIncomeCategories, setCustomIncomeCategories: update(setCustomIncomeCategories, 'customIncomeCategories'),
      expenseCategories, incomeCategories,
      getAccountBalance, totalNetWorth,
      resetAllData, syncing,
    }}>
      {children}
    </FinanceContext.Provider>
  );
};