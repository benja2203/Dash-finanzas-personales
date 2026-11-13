import {
  Utensils, Car, Home, Zap, Film, HeartPulse, BookOpen,
  ShoppingBag, Briefcase, LineChart, Store, Gift,
  MoreHorizontal, ArrowRight
} from 'lucide-react';

// Formateamos el número nosotros y anteponemos el "$" a mano.
// Así evitamos que algunos navegadores muestren el nombre de la moneda
// ("dólares"/"CLP") en vez del símbolo, y queda siempre consistente.
export const formatCurrency = (amount) => {
  const n = Math.round(Number(amount) || 0);
  const formatted = new Intl.NumberFormat('es-CL').format(Math.abs(n));
  return n < 0 ? `-$${formatted}` : `$${formatted}`;
};

export const categoryIcons = {
  'Alimentación': Utensils,
  'Transporte': Car,
  'Vivienda': Home,
  'Servicios': Zap,
  'Entretenimiento': Film,
  'Salud': HeartPulse,
  'Educación': BookOpen,
  'Salario': Briefcase,
  'Inversiones': LineChart,
  'Negocios': Store,
  'Regalos': Gift,
  'Otros': MoreHorizontal,
  'Transferencia': ArrowRight
};

export const getCategoryIcon = (categoryName, size = 14, className = 'mr-1') => {
  const IconComponent = categoryIcons[categoryName] || ShoppingBag;
  return <IconComponent size={size} className={className} />;
};

export const exportToCSV = (transactions, accounts) => {
  const headers = ['Fecha', 'Tipo', 'Descripción', 'Categoría', 'Cuenta', 'Monto'];
  const rows = transactions.map(t => [
    t.date,
    t.type,
    t.description,
    t.category,
    accounts.find(a => a.id === t.accountId)?.name || '',
    t.amount
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mis-finanzas-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};