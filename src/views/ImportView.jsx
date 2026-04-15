import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/helpers.jsx';
import { Upload, Activity, Check, Trash2, AlertCircle } from 'lucide-react';

export default function ImportView() {
  const { accounts, transactions, setTransactions, expenseCategories, incomeCategories } = useFinance();
  const [rawText, setRawText] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts.length > 0 ? accounts[0].id : '');

  const handleParse = () => {
    const lines = rawText.split('\n');
    const results = [];
    const dateRegex = /\b(\d{2})[\/\-](\d{2})[\/\-](\d{4}|\d{2})\b/;

    lines.forEach((line, index) => {
      if (!line.trim()) return;
      const dateMatch = line.match(dateRegex);
      let dateObj = new Date().toISOString().split('T')[0];
      if (dateMatch) {
        const d = dateMatch[1], m = dateMatch[2];
        let y = dateMatch[3];
        if (y.length === 2) y = '20' + y;
        dateObj = `${y}-${m}-${d}`;
      }
      let textWithoutDate = line.replace(dateRegex, '').trim();
      const amountRegex = /(?:- ?)?\$?\s?(\d{1,3}(?:\.\d{3})*|\d+)(?:,\d+)?/g;
      const amounts = [...textWithoutDate.matchAll(amountRegex)];
      if (amounts.length > 0) {
        const rawAmountStr = amounts[amounts.length - 1][0];
        const isNegative = rawAmountStr.includes('-') || line.toUpperCase().includes('COMPRA') || line.toUpperCase().includes('PAGO');
        let amountNum = Number(rawAmountStr.replace(/[^\d]/g, ''));
        if (amountNum > 0) {
          let desc = textWithoutDate.replace(rawAmountStr, '').replace(/\$|\./g, '').trim().replace(/\s{2,}/g, ' ');
          if (desc.length > 35) desc = desc.substring(0, 35) + '...';
          if (!desc) desc = 'Movimiento Bancario';
          results.push({
            id: 'imp_' + index + '_' + Date.now(),
            date: dateObj, description: desc, amount: amountNum,
            type: isNegative ? 'gasto' : 'ingreso',
            category: isNegative ? 'Otros' : 'Salario',
            accountId: Number(selectedAccountId)
          });
        }
      }
    });
    setParsedData(results);
  };

  const updateParsedItem = (id, field, value) => setParsedData(parsedData.map(item => item.id === id ? { ...item, [field]: value } : item));
  const removeParsedItem = (id) => setParsedData(parsedData.filter(item => item.id !== id));

  const importToMain = () => {
    setTransactions([...transactions, ...parsedData]);
    setParsedData([]);
    setRawText('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Upload className="text-blue-600" /> Importador Inteligente
        </h2>
        <p className="text-slate-500 mt-2">Copia el texto de tus movimientos bancarios y pégalo aquí abajo.</p>
      </div>

      {parsedData.length === 0 ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
            <AlertCircle className="text-blue-500 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <strong>¿A qué cuenta irán estos movimientos?</strong> Selecciona la cuenta antes de pegar el texto.
            </div>
            <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} className="p-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-w-[200px] ml-auto font-medium">
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <textarea
            className="w-full h-64 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm bg-slate-50"
            placeholder={`Ejemplo:\n\n12/04/2026 SUPERMERCADO LIDER -45.000\n13-04-2026 TRANSFERENCIA JUAN PEREZ $150.000\n15/04/2026 PAGO SPOTIFY 6.500`}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
          <button onClick={handleParse} disabled={!rawText.trim()} className="w-full md:w-auto ml-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <Activity size={20} /> Analizar Texto
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Vista Previa ({parsedData.length} transacciones)</h3>
            <button onClick={() => setParsedData([])} className="text-sm text-slate-500 hover:text-slate-800">Cancelar</button>
          </div>
          <p className="text-sm text-slate-500">Revisa y ajusta antes de importar.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 text-sm text-slate-500">
                  <th className="pb-3 font-medium w-24">Fecha</th>
                  <th className="pb-3 font-medium">Descripción</th>
                  <th className="pb-3 font-medium w-32">Tipo</th>
                  <th className="pb-3 font-medium w-32 text-right">Monto</th>
                  <th className="pb-3 font-medium w-40 pl-4">Categoría</th>
                  <th className="pb-3 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {parsedData.map(item => (
                  <tr key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="py-2 pr-2">
                      <input type="date" value={item.date} onChange={e => updateParsedItem(item.id, 'date', e.target.value)} className="w-full text-xs p-1 border rounded bg-transparent outline-none"/>
                    </td>
                    <td className="py-2 pr-2">
                      <input type="text" value={item.description} onChange={e => updateParsedItem(item.id, 'description', e.target.value)} className="w-full text-sm font-semibold p-1 border border-transparent hover:border-slate-200 rounded bg-transparent outline-none"/>
                    </td>
                    <td className="py-2 pr-2">
                      <select value={item.type} onChange={e => updateParsedItem(item.id, 'type', e.target.value)} className={`w-full text-xs p-1.5 border rounded outline-none font-bold ${item.type === 'ingreso' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        <option value="gasto">Gasto (-)</option>
                        <option value="ingreso">Ingreso (+)</option>
                      </select>
                    </td>
                    <td className="py-2 pr-2 text-right">
                      <span className={`font-bold text-sm ${item.type === 'ingreso' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {item.type === 'ingreso' ? '+' : '-'}{formatCurrency(item.amount)}
                      </span>
                    </td>
                    <td className="py-2 pl-4 pr-2">
                      <select value={item.category} onChange={e => updateParsedItem(item.id, 'category', e.target.value)} className="w-full text-xs p-1.5 border rounded bg-white outline-none">
                        {(item.type === 'gasto' ? expenseCategories : incomeCategories).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="py-2 text-right">
                      <button onClick={() => removeParsedItem(item.id)} className="p-1 text-slate-300 hover:text-red-500 rounded"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={importToMain} className="w-full px-6 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 mt-4 text-lg shadow-sm">
            <Check size={24} /> Confirmar e Importar
          </button>
        </div>
      )}
    </div>
  );
}