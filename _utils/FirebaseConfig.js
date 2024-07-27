// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from 'react-native';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDNtUG-gfnY3lfPMOBUGRMKH_hG6Kzx3gk",
  authDomain: "food4u-a0784.firebaseapp.com",
  projectId: "food4u-a0784",
  storageBucket: "food4u-a0784.appspot.com",
  messagingSenderId: "513163503693",
  appId: "1:513163503693:web:62308158970b1e2caa5404",
  measurementId: "G-0FMMB9KSJY"
};

// Initialize Firebase
const FIREBASE_APP = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence
let FIREBASE_AUTH;
if (Platform.OS === 'android') {
  FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} else {
  FIREBASE_AUTH = getAuth(FIREBASE_APP);
}

const FIREBASE_DB = getFirestore(FIREBASE_APP);
const FIREBASE_STORAGE = getStorage(FIREBASE_APP);

export { FIREBASE_AUTH, FIREBASE_DB, FIREBASE_APP, FIREBASE_STORAGE };
