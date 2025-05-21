// Import Firebase packages
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB51Mvu5wA4I7SvANV5q45Eu18n4-o5odY",
  authDomain: "bakery-b426a.firebaseapp.com",
  projectId: "bakery-b426a",
  storageBucket: "bakery-b426a.firebasestorage.app",
  messagingSenderId: "548551748923",
  appId: "1:548551748923:web:ead31619ed09678c5d5b1e",
  measurementId: "G-8SSYMZT17F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytics only works in browser environment
let analytics = null;
let messaging = null;

// Initialize Firebase services only in browser environment
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
  
  // Initialize Firebase Cloud Messaging
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error("Firebase messaging initialization error:", error);
  }
}

export { app, analytics, messaging, getToken, onMessage };