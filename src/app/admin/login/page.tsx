"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trophy,
  ShieldCheck,
  Lock,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/components/common/ToastNotifications";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState("admin@kollamsahodaya.org");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      showToast({
        type: "success",
        title: "Welcome, Competition Administrator",
        message: "Signed in to Kollam District Sahodaya Cuties' Fest 2026–27.",
      });
      router.push("/admin/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Authentication failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-navy-950 via-navy-900 to-royal-900 px-4 py-12">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-royal-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Live Public Scoreboard
          </Link>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white p-7 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-white shadow-md">
              <Trophy className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-royal-600">
                KOLLAM DISTRICT SAHODAYA
              </p>
              <h1 className="text-xl font-extrabold text-navy-900">
                Admin &amp; Scorer Portal
              </h1>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm font-medium text-navy-900 focus:border-royal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Administrator Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Enter admin password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm font-medium text-navy-900 focus:border-royal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-royal-700 disabled:opacity-50 transition-colors"
            >
              <ShieldCheck className="h-4 w-4 text-amber-300" />
              {isSubmitting ? "Signing In..." : "Sign In to Admin Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
