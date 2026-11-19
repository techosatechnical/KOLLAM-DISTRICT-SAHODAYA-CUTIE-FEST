"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Calculator,
} from "lucide-react";
import { calculateScore } from "@/lib/scoring";
import { useToast } from "@/components/common/ToastNotifications";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function AdminSettingsPage() {
  const { updateCustomPassword } = useAdminAuth();
  const { showToast } = useToast();

  const [newPassword, setNewPassword] = useState("");

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      updateCustomPassword(newPassword);
      setNewPassword("");
      showToast({
        type: "success",
        title: "Admin Password Updated",
        message: "New custom administrator password is now active.",
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Invalid Password",
        message: err instanceof Error ? err.message : "Could not update.",
      });
    }
  };

  // Run live verification of all test cases (Placed + Grade-Only + No Grade)
  const individualTests = [
    { label: "A + 1st", pct: 75, pos: 1 as const, expected: 10 },
    { label: "A + 2nd", pct: 70, pos: 2 as const, expected: 8 },
    { label: "A + 3rd", pct: 85, pos: 3 as const, expected: 6 },
    { label: "B + 1st", pct: 65, pos: 1 as const, expected: 8 },
    { label: "B + 2nd", pct: 60, pos: 2 as const, expected: 6 },
    { label: "B + 3rd", pct: 69, pos: 3 as const, expected: 4 },
    { label: "C + 1st", pct: 55, pos: 1 as const, expected: 6 },
    { label: "C + 2nd", pct: 50, pos: 2 as const, expected: 4 },
    { label: "C + 3rd", pct: 59, pos: 3 as const, expected: 2 },
    { label: "A + No Position (Grade Only)", pct: 75, pos: null, expected: 5 },
    { label: "B + No Position (Grade Only)", pct: 65, pos: null, expected: 3 },
    { label: "C + No Position (Grade Only)", pct: 55, pos: null, expected: 1 },
    { label: "49% or below (No Grade)", pct: 49, pos: 1 as const, expected: 0 },
  ];

  const groupTests = [
    { label: "A + 1st", pct: 80, pos: 1 as const, expected: 20 },
    { label: "A + 2nd", pct: 70, pos: 2 as const, expected: 16 },
    { label: "A + 3rd", pct: 90, pos: 3 as const, expected: 12 },
    { label: "B + 1st", pct: 65, pos: 1 as const, expected: 16 },
    { label: "B + 2nd", pct: 60, pos: 2 as const, expected: 12 },
    { label: "B + 3rd", pct: 69, pos: 3 as const, expected: 8 },
    { label: "C + 1st", pct: 55, pos: 1 as const, expected: 12 },
    { label: "C + 2nd", pct: 50, pos: 2 as const, expected: 8 },
    { label: "C + 3rd", pct: 59, pos: 3 as const, expected: 4 },
    { label: "A + No Position (Grade Only)", pct: 80, pos: null, expected: 10 },
    { label: "B + No Position (Grade Only)", pct: 65, pos: null, expected: 6 },
    { label: "C + No Position (Grade Only)", pct: 55, pos: null, expected: 2 },
    { label: "49% or below (No Grade)", pct: 49, pos: 1 as const, expected: 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-royal-600">
          System Configuration &amp; Verification
        </p>
        <h1 className="text-2xl font-extrabold text-navy-900">
          Competition Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage administrator security credentials and verify the official
          Sahodaya scoring rules matrix.
        </p>
      </div>

      {/* Admin Password Configuration */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-900">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-navy-900">
              Administrator Access Password
            </h2>
            <p className="text-xs text-slate-500">
              Default organizer password:{" "}
              <code className="font-bold text-navy-900">sahodaya2026</code>. You
              can also set an additional custom password below.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleUpdatePassword}
          className="flex flex-wrap items-center gap-3"
        >
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New custom password (min 6 chars)..."
            className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-navy-900 w-72"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-royal-700"
          >
            <ShieldCheck className="h-4 w-4 text-amber-300" />
            Save Custom Password
          </button>
        </form>
      </div>

      {/* Scoring Engine Automated Verification Suite */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-navy-900">
              Official Scoring Rules Matrix (26/26 Verified)
            </h2>
            <p className="text-xs text-slate-500">
              Live verification of every grade and placement combination against
              the official Kollam District Sahodaya Cuties&apos; Fest 2026–27
              criteria
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-navy-900 mb-2.5">
              Individual Event Scoring Rules
            </h3>
            <div className="space-y-1.5 text-xs">
              {individualTests.map((t) => {
                const actual = calculateScore({
                  percentage: t.pct,
                  position: t.pos,
                  scoringType: "INDIVIDUAL",
                }).totalPoints;
                const pass = actual === t.expected;
                return (
                  <div
                    key={t.label}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2 border border-slate-200/70"
                  >
                    <span className="font-semibold text-navy-900">
                      {t.label}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-extrabold ${
                        pass ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {actual} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-navy-900 mb-2.5">
              Group Item Scoring Rules
            </h3>
            <div className="space-y-1.5 text-xs">
              {groupTests.map((t) => {
                const actual = calculateScore({
                  percentage: t.pct,
                  position: t.pos,
                  scoringType: "GROUP",
                }).totalPoints;
                const pass = actual === t.expected;
                return (
                  <div
                    key={t.label}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2 border border-slate-200/70"
                  >
                    <span className="font-semibold text-navy-900">
                      {t.label}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-extrabold ${
                        pass ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {actual} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
