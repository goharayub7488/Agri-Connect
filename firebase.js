// firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
const firebaseConfig = {
  apiKey: "AIzaSyDhCIdvmC8phv3pCmcWQFKvj2qZNzHLbds",
  authDomain: "agri-connect-3fad9.firebaseapp.com",
  projectId: "agri-connect-3fad9",
  storageBucket: "agri-connect-3fad9.firebasestorage.app",
  messagingSenderId: "544604068666",
  appId: "1:544604068666:web:b254cbea6dd34630688e03",
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { auth, db };
