import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDR7j6_oHbqAk6_rVhexRIR8NY5-GzahMg",
  authDomain: "itemshub-9074c.firebaseapp.com",
  projectId: "itemshub-9074c",
  storageBucket: "itemshub-9074c.firebasestorage.app",
  messagingSenderId: "921561412093",
  appId: "1:921561412093:web:d459421b1a89675f5da994",
  measurementId: "G-Q03JM13XGP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Set persistence to local (keep user logged in)
setPersistence(auth, browserLocalPersistence);

export { db, auth, analytics };