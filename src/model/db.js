import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBkhh1IxjVskHVvGaOZeSfRCfgBs2QZIIc",
  authDomain: "edukid-s.firebaseapp.com",
  projectId: "edukid-s",
  storageBucket: "edukid-s.appspot.com",
  messagingSenderId: "797959761292",
  appId: "1:797959761292:web:cdacbb8bac6e973714faa9",
  measurementId: "G-75LTM2R1JZ"
};

// Solo inicializa si no existe
//const appFirebase = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export default appFirebase;

// Inicializar app solo si no existe
const appFirebase = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

//Inicializar Firestore y Auth
const db = getFirestore(appFirebase);
const auth = getAuth(appFirebase);

//Exportar todo lo necesario
export { appFirebase, db, auth };
