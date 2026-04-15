import React, { createContext, useContext, useState, useEffect } from 'react';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);


const resetAllData = () => {
  if (!window.confirm('¿Seguro que quieres borrar TODOS los datos? Esta acción no se puede deshacer.')) return;
  localStorage.clear();
  window.location.reload();
};


export const FinanceProvider = ({ children }) => {

  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem('mf_accounts');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('mf_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [subscriptions, setSubscriptions] = useState(() => {
    const saved = localStorage.getItem('mf_subscriptions');
    return saved ? JSON.parse(saved) : [];
  });

  const [debts, setDebts] = useState(() => {
    const saved = localStorage.getItem('mf_debts');
    return saved ? JSON.parse(saved) : [];
  });

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('mf_goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('mf_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('mf_budgets');
    return saved ? JSON.parse(saved) : [];
  });

  const [customExpenseCategories, setCustomExpenseCategories] = useState(() => {
    const saved = localStorage.getItem('mf_custom_expense_cats');
    return saved ? JSON.parse(saved) : [];
  });

  const [customIncomeCategories, setCustomIncomeCategories] = useState(() => {
    const saved = localStorage.getItem('mf_custom_income_cats');
    return saved ? JSON.parse(saved) : [];
  });

  const expenseCategories = ['Alimentación', 'Transporte', 'Vivienda', 'Servicios', 'Entretenimiento', 'Salud', 'Educación', 'Otros', ...customExpenseCategories];
  const incomeCategories = ['Salario', 'Inversiones', 'Negocios', 'Regalos', 'Otros', ...customIncomeCategories];

  // Motor de pagos automáticos
  useEffect(() => {
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
      setTransactions(prev => [...prev, ...newTxs]);
      setSubscriptions(updatedSubs);
    }
  }, [subscriptions]);

  // Persistencia
  useEffect(() => { localStorage.setItem('mf_accounts', JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem('mf_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('mf_subscriptions', JSON.stringify(subscriptions)); }, [subscriptions]);
  useEffect(() => { localStorage.setItem('mf_debts', JSON.stringify(debts)); }, [debts]);
  useEffect(() => { localStorage.setItem('mf_goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('mf_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('mf_budgets', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem('mf_custom_expense_cats', JSON.stringify(customExpenseCategories)); }, [customExpenseCategories]);
  useEffect(() => { localStorage.setItem('mf_custom_income_cats', JSON.stringify(customIncomeCategories)); }, [customIncomeCategories]);
  
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

  return (
    <FinanceContext.Provider value={{
      accounts, setAccounts,
      transactions, setTransactions,
      subscriptions, setSubscriptions,
      debts, setDebts,
      goals, setGoals,
      wishlist, setWishlist,
      budgets, setBudgets,
      getAccountBalance,
      totalNetWorth,
      expenseCategories,
      incomeCategories,
      resetAllData,
      customExpenseCategories, setCustomExpenseCategories,
      customIncomeCategories, setCustomIncomeCategories,
    }}>
      {children}
    </FinanceContext.Provider>
  );
};