import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "deadline-guardian-ai-8d2a8.firebaseapp.com",
  projectId: "deadline-guardian-ai-8d2a8",
  storageBucket: "deadline-guardian-ai-8d2a8.firebasestorage.app",
  messagingSenderId: "672201435646",
  appId: "1:672201435646:web:97cc53cdf0dfe3fb69b8af",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);