// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgFDPTizGezZYC-AhxeIUCgBkGYio6QNc",
  authDomain: "accio-f8ec6.firebaseapp.com",
  projectId: "accio-f8ec6",
  storageBucket: "accio-f8ec6.firebasestorage.app",
  messagingSenderId: "574909238906",
  appId: "1:574909238906:web:2b4c25b8962705b038b5c3",
  measurementId: "G-6VM8MSDYKL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, auth };
