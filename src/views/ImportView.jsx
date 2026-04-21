import { useState, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

export default function ImportView() {
  const { accounts, transactions, setTransactions } = useFinance();
  const fileInputRef = useRef(null);

  const [rawData, setRawData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts.length > 0 ? accounts[0].id : '');
  const [step, setStep] = useState(1); 
  
  // 👇 Nuevo estado para saber si el Excel tiene 1 o 2 columnas de dinero
  const [amountMode, setAmountMode] = useState('two'); // 'one' o 'two'
  const [mapping, setMapping] = useState({ date: '', description: '', amount: '', charge: '', deposit: '' });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        // Convertimos el excel a JSON, leyendo la primera fila como encabezados
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (data.length > 0) {
          setHeaders(data[0]); 
          setRawData(data.slice(1)); 
          setStep(2);
          toast.success('Excel leído correctamente');
        }
      } catch (err) {
        toast.error('Error al leer el archivo');
      }
    };
    reader.readAsBinaryString(file);
  };

  // 👇 FUNCIÓN CRÍTICA: Limpia formatos como "$ 120.000" a "120000"
  const cleanNumber = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    // Convierte a texto, quita $, espacios y puntos de miles. Cambia coma por punto decimal si hubiera.
    let cleaned = val.toString().replace(/\$/g, '').replace(/\s/g, '').replace(/\./g, '');
    cleaned = cleaned.replace(/,/g, '.'); 
    return parseFloat(cleaned) || 0;
  };

  // 👇 FUNCIÓN CRÍTICA: Convierte "17-04-2026" a "2026-04-17" para que React lo entienda
  const cleanDate = (val) => {
    if (!val) return new Date().toISOString().split('T')[0];
    if (typeof val === 'string' && val.includes('-')) {
      const parts = val.split('-');
      // Si viene en formato DD-MM-YYYY
      if (parts.length === 3 && parts[0].length <= 2 && parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return val;
  };

  const processImport = () => {
    // Validamos que los campos requeridos estén seleccionados
    if (!mapping.date || !mapping.description) {
      toast.error('Por favor mapea Fecha y Descripción');
      return;
    }
    if (amountMode === 'one' && !mapping.amount) {
      toast.error('Por favor mapea la columna de Monto');
      return;
    }
    if (amountMode === 'two' && (!mapping.charge || !mapping.deposit)) {
      toast.error('Por favor mapea las columnas Cargo y Abono');
      return;
    }

    const dateIdx = headers.indexOf(mapping.date);
    const descIdx = headers.indexOf(mapping.description);

    const importedTxs = rawData.map((row, index) => {
      let finalAmount = 0;
      let type = 'gasto';

      // 1. EXTRAER EL DINERO SEGÚN EL MODO
      if (amountMode === 'two') {
        const cargoVal = cleanNumber(row[headers.indexOf(mapping.charge)]);
        const abonoVal = cleanNumber(row[headers.indexOf(mapping.deposit)]);

        if (cargoVal > 0) {
          finalAmount = cargoVal;
          type = 'gasto';
        } else if (abonoVal > 0) {
          finalAmount = abonoVal;
          type = 'ingreso';
        } else {
          return null; // Fila vacía o sin dinero
        }
      } else {
        const amtVal = cleanNumber(row[headers.indexOf(mapping.amount)]);
        if (amtVal === 0) return null;
        finalAmount = Math.abs(amtVal);
        // En bancos, los gastos suelen venir en negativo
        type = amtVal < 0 ? 'gasto' : 'ingreso';
      }

      if (!finalAmount) return null;

      // 2. CONSTRUIR LA TRANSACCIÓN
      return {
        id: Date.now() + index, // Añadimos index para que no hayan empates de milisegundos
        date: cleanDate(row[dateIdx]),
        description: row[descIdx] || 'Sin descripción',
        amount: finalAmount,
        type: type,
        category: type === 'gasto' ? 'Otros' : 'Salario', // Categoría genérica por defecto
        accountId: Number(selectedAccountId),
        notes: 'Importado de Excel'
      };
    }).filter(tx => tx !== null); // Quitamos las filas que eran texto vacío o nulas

    if (importedTxs.length === 0) {
      toast.error('No se detectaron movimientos. Revisa las columnas.');
      return;
    }

    setTransactions([...transactions, ...importedTxs]);
    toast.success(`¡${importedTxs.length} movimientos agregados con éxito!`);
    reset();
  };

  const reset = () => {
    setStep(1);
    setRawData([]);
    setMapping({ date: '', description: '', amount: '', charge: '', deposit: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Importador Bancario</h2>
          <p className="text-slate-500">Sube tu cartola (Excel/CSV) y ahorra tiempo registrando.</p>
        </div>
        {step > 1 && (
          <button onClick={reset} className="text-sm font-medium text-red-500 hover:underline">Cancelar</button>
        )}
      </div>

      {step === 1 && (
        <div 
          onClick={() => fileInputRef.current.click()}
          className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group"
        >
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv, .xlsx, .xls" className="hidden" />
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full group-hover:scale-110 transition-transform">
            <Upload size={32} />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-700">Haz clic para subir tu Excel o CSV</p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="text-emerald-500" size={20}/> 
              Configura tu importación
            </h3>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">¿A qué cuenta pertenece?</label>
                <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">¿Cómo vienen los montos en tu Excel?</label>
                <select value={amountMode} onChange={e => setAmountMode(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="two">Separado en dos columnas (Cargo y Abono)</option>
                  <option value="one">Todo en una columna (+ y -)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Columna Fecha</label>
                <select value={mapping.date} onChange={e => setMapping({...mapping, date: e.target.value})} className="w-full p-2 bg-white rounded-lg outline-none border focus:border-blue-500 text-sm">
                  <option value="">Seleccionar...</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Columna Descripción</label>
                <select value={mapping.description} onChange={e => setMapping({...mapping, description: e.target.value})} className="w-full p-2 bg-white rounded-lg outline-none border focus:border-blue-500 text-sm">
                  <option value="">Seleccionar...</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* RENDERIZADO CONDICIONAL DE COLUMNAS DE DINERO */}
              {amountMode === 'two' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1 text-red-500">Col. Cargo (Salida)</label>
                    <select value={mapping.charge} onChange={e => setMapping({...mapping, charge: e.target.value})} className="w-full p-2 bg-white rounded-lg outline-none border focus:border-blue-500 text-sm">
                      <option value="">Seleccionar...</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1 text-emerald-500">Col. Abono (Entrada)</label>
                    <select value={mapping.deposit} onChange={e => setMapping({...mapping, deposit: e.target.value})} className="w-full p-2 bg-white rounded-lg outline-none border focus:border-blue-500 text-sm">
                      <option value="">Seleccionar...</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </>
              ) : (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1 text-blue-500">Columna Monto (Única)</label>
                  <select value={mapping.amount} onChange={e => setMapping({...mapping, amount: e.target.value})} className="w-full p-2 bg-white rounded-lg outline-none border focus:border-blue-500 text-sm">
                    <option value="">Seleccionar...</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              )}
            </div>

            <button 
              onClick={processImport}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
            >
              Procesar e Importar Archivo <ArrowRight size={20}/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}