import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

export interface FirebaseConfigInput {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const RUNTIME_CONFIG_STORAGE_KEY = "sahodaya_cuties_firebase_config_v1";

const DEFAULT_PROJECT_FIREBASE_CONFIG: FirebaseConfigInput = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyA9voCdl6grV0ZPXjhf0wIQnaqHum7MfqA",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "cutie-fest.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "cutie-fest",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "cutie-fest.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "920265304330",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:920265304330:web:d888f05f428318395732f3",
};

export function getStoredFirebaseConfig(): FirebaseConfigInput | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(RUNTIME_CONFIG_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FirebaseConfigInput;
    if (parsed && parsed.apiKey && parsed.projectId) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveRuntimeFirebaseConfig(
  config: FirebaseConfigInput | null
): void {
  if (typeof window === "undefined") return;
  if (!config) {
    window.localStorage.removeItem(RUNTIME_CONFIG_STORAGE_KEY);
  } else {
    window.localStorage.setItem(
      RUNTIME_CONFIG_STORAGE_KEY,
      JSON.stringify(config)
    );
  }
}

export function getActiveFirebaseConfig(): FirebaseConfigInput | null {
  const stored = getStoredFirebaseConfig();
  if (stored) {
    return stored;
  }
  return DEFAULT_PROJECT_FIREBASE_CONFIG;
}

let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;
let cachedAuth: Auth | null = null;

export function getFirebaseServices(): {
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
  isCloudConfigured: boolean;
  projectId: string | null;
} {
  const config = getActiveFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return {
      app: null,
      db: null,
      auth: null,
      isCloudConfigured: false,
      projectId: null,
    };
  }

  try {
    if (!cachedApp) {
      cachedApp = getApps().length > 0 ? getApp() : initializeApp(config);
    }
    if (!cachedDb) {
      cachedDb = getFirestore(cachedApp);
    }
    if (!cachedAuth && typeof window !== "undefined") {
      cachedAuth = getAuth(cachedApp);
    }
    return {
      app: cachedApp,
      db: cachedDb,
      auth: cachedAuth,
      isCloudConfigured: true,
      projectId: config.projectId,
    };
  } catch (error) {
    console.error("Firebase initialization error:", error);
    return {
      app: null,
      db: null,
      auth: null,
      isCloudConfigured: false,
      projectId: null,
    };
  }
}
