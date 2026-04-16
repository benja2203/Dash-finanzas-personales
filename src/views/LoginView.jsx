import { useAuth } from '../context/AuthContext';
import { Wallet } from 'lucide-react';

export default function LoginView() {
  const { loginWithGoogle } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 flex flex-col items-center gap-6 max-w-sm w-full">
        <div className="flex items-center gap-3">
          <Wallet size={36} className="text-blue-600" />
          <h1 className="text-3xl font-black text-blue-600">Mis Finanzas</h1>
        </div>
        <p className="text-slate-500 text-center text-sm">Tu dashboard financiero personal. Inicia sesión para acceder a tus datos.</p>
        <button
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Continuar con Google
        </button>
        <p className="text-xs text-slate-400 text-center">Tus datos se guardan en la nube y son privados para tu cuenta.</p>
      </div>
    </div>
  );
}