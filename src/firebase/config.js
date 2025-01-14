import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBdLmQfNdvuymGoE-Vlk89llHoOUB5SsPM",
  authDomain: "gloryvirtual-bcedf.firebaseapp.com",
  projectId: "gloryvirtual-bcedf",
  storageBucket: "gloryvirtual-bcedf.firebasestorage.app",
  messagingSenderId: "896675937589",
  appId: "1:896675937589:web:3abf79e7d74509c33ba07c",
  measurementId: "G-N9VJD9021F"
};

// Initialize Firebase
let app;
let db;
let storage;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

export { db, storage };