import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBCzGDD7GBzueuu0FeokI-2-OFBE4mB7hA",
  authDomain: "tarefas-7f4f5.firebaseapp.com",
  projectId: "tarefas-7f4f5",
  storageBucket: "tarefas-7f4f5.appspot.com",
  messagingSenderId: "484294766399",
  appId: "1:484294766399:web:82d1a1b3fbe00eb478ed8a"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);

export { db };