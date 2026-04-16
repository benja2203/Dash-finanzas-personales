import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
// 👇 Importamos initializeFirestore y el caché local
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDLRfqmy1YcSslAIJhlb8yBlWuW2ocrAOo",
  authDomain: "mis-finanzas-app-cf5d1.firebaseapp.com",
  projectId: "mis-finanzas-app-cf5d1",
  storageBucket: "mis-finanzas-app-cf5d1.firebasestorage.app",
  messagingSenderId: "87230774145",
  appId: "1:87230774145:web:15f181cc2397c2f0c40680"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 👇 Inicializamos la base de datos CON soporte offline nativo
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
});