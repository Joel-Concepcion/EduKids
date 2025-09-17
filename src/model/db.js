// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkhh1IxjVskHVvGaOZeSfRCfgBs2QZIIc",
  authDomain: "edukid-s.firebaseapp.com",
  projectId: "edukid-s",
  storageBucket: "edukid-s.firebasestorage.app",
  messagingSenderId: "797959761292",
  appId: "1:797959761292:web:cdacbb8bac6e973714faa9",
  measurementId: "G-75LTM2R1JZ"
};

// Initialize Firebase
// Initialize Firebase
const appFirebase = initializeApp(firebaseConfig);

export default appFirebase;

//const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);