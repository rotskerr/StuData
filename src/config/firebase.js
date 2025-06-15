// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCyDZDdBbhVpnE2Oi5AfsE0qwuUlLDLuHk",
  authDomain: "studata-13d40.firebaseapp.com",
  projectId: "studata-13d40",
  storageBucket: "studata-13d40.firebasestorage.app",
  messagingSenderId: "886376311850",
  appId: "1:886376311850:web:4ccb3e8ae78aa48a766753",
  measurementId: "G-ND4SJ0KSSQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase auth with AsyncStorage persistence for Hermes compatibility
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const firestore = getFirestore(app);

export { auth, firestore };