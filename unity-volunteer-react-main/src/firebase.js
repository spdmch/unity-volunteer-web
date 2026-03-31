
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            'AIzaSyDO6M25Gd85lCQKsXEofQLeT5hHdgI98XA',
  authDomain:        'unity-volunteer-eb328.firebaseapp.com',
  projectId:         'unity-volunteer-eb328',
  storageBucket:     'unity-volunteer-eb328.firebasestorage.app',
  messagingSenderId: '681346490743',
  appId:             '1:681346490743:web:157dbad2158a2ca9344172',
  measurementId:     'G-S94H51QKKB',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);

export default app;