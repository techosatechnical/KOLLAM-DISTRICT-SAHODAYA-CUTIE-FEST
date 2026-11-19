"use client";

import { useCallback, useEffect, useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getFirebaseServices } from "@/lib/firebase/config";
import { Admin } from "@/types";

const ADMIN_SESSION_STORAGE_KEY = "sahodaya_cuties_admin_session_v1";
const CUSTOM_PASSWORD_STORAGE_KEY = "sahodaya_cuties_admin_pwd_v1";

// Hardcoded organizer passwords as requested in Section 1 ("hardcoded password for amin login")
const DEFAULT_HARDCODED_PASSWORDS = [
  "sahodaya2026",
  "cuties2026",
  "admin123",
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "sahodaya2026",
];

export function useAdminAuth() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Admin;
        if (parsed && parsed.email) {
          setAdmin(parsed);
        }
      }
    } catch {
      // Ignore invalid session data
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (emailInput: string, passwordInput: string): Promise<Admin> => {
      const email = emailInput.trim() || "admin@kollamsahodaya.org";
      const password = passwordInput.trim();

      if (!password) {
        throw new Error("Please enter the administrator password.");
      }

      const customPwd =
        typeof window !== "undefined"
          ? window.localStorage.getItem(CUSTOM_PASSWORD_STORAGE_KEY)
          : null;

      const validHardcoded =
        DEFAULT_HARDCODED_PASSWORDS.includes(password) ||
        (customPwd !== null && password === customPwd);

      const { auth, db, isCloudConfigured } = getFirebaseServices();

      // If Firebase Auth is configured, attempt Firebase Authentication first,
      // and also fall back to the hardcoded organizer password so login works seamlessly.
      if (isCloudConfigured && auth && !validHardcoded) {
        try {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          const now = new Date().toISOString();
          const adminSession: Admin = {
            id: cred.user.uid,
            email: cred.user.email || email,
            name: "Sahodaya Competition Administrator",
            role: "SUPER_ADMIN",
            lastLoginAt: now,
          };
          if (db) {
            await setDoc(doc(db, "admins", adminSession.id), adminSession, {
              merge: true,
            }).catch(() => {});
          }
          window.localStorage.setItem(
            ADMIN_SESSION_STORAGE_KEY,
            JSON.stringify(adminSession)
          );
          setAdmin(adminSession);
          return adminSession;
        } catch {
          throw new Error(
            "Invalid administrator password. Please check your credentials and try again."
          );
        }
      }

      if (!validHardcoded) {
        throw new Error(
          "Invalid administrator password. Use the official organizer password."
        );
      }

      const now = new Date().toISOString();
      const adminSession: Admin = {
        id: "admin-sahodaya-kollam",
        email,
        name: "Kollam Sahodaya Fest Administrator",
        role: "SUPER_ADMIN",
        lastLoginAt: now,
      };

      if (isCloudConfigured && db) {
        await setDoc(doc(db, "admins", adminSession.id), adminSession, {
          merge: true,
        }).catch(() => {});
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          ADMIN_SESSION_STORAGE_KEY,
          JSON.stringify(adminSession)
        );
      }
      setAdmin(adminSession);
      return adminSession;
    },
    []
  );

  const logout = useCallback(async () => {
    const { auth, isCloudConfigured } = getFirebaseServices();
    if (isCloudConfigured && auth) {
      await signOut(auth).catch(() => {});
    }
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    }
    setAdmin(null);
  }, []);

  const updateCustomPassword = useCallback((newPassword: string) => {
    if (typeof window === "undefined") return;
    if (newPassword.trim().length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }
    window.localStorage.setItem(
      CUSTOM_PASSWORD_STORAGE_KEY,
      newPassword.trim()
    );
  }, []);

  return {
    admin,
    isAuthenticated: Boolean(admin),
    isLoading,
    login,
    logout,
    updateCustomPassword,
  };
}

