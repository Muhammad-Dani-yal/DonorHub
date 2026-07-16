import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "",
};

const isConfigValid = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

let app = null;
let analytics = null;
let auth = null;
let database = null;

if (isConfigValid) {
  try {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    database = getDatabase(app);
  } catch (error) {
    console.warn("Firebase initialization failed:", error);
  }

  if (app && typeof window !== "undefined") {
    try {
      analytics = getAnalytics(app);
    } catch (error) {
      console.warn("Firebase Analytics is unavailable:", error);
    }
  }
}

if (!app) {
  console.warn("Firebase is not configured correctly. Auth and database features will be unavailable until valid environment variables are provided.");
}

export { analytics, auth, database };
export default app;
