// firebase.js
import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDNtUG-gfnY3lfPMOBUGRMKH_hG6Kzx3gk",
  authDomain: "food4u-a0784.firebaseapp.com",
  projectId: "food4u-a0784",
  storageBucket: "food4u-a0784.appspot.com",
  messagingSenderId: "513163503693",
  appId: "1:513163503693:web:62308158970b1e2caa5404",
  measurementId: "G-0FMMB9KSJY"
};


// Initialize Firebase App
const FIREBASE_APP = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth with persistence on all React Native platforms
const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Firestore & Storage
const FIREBASE_DB = getFirestore(FIREBASE_APP);
const FIREBASE_STORAGE = getStorage(FIREBASE_APP);

export { FIREBASE_AUTH, FIREBASE_DB, FIREBASE_APP, FIREBASE_STORAGE };
