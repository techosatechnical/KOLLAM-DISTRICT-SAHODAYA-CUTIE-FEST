import React from "react";
import Link from "next/link";
import { Trophy, ShieldCheck, CheckCircle2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-navy-950 text-slate-300 mt-16">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-royal-600 text-white">
                <Trophy className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-royal-400">
                  KOLLAM DISTRICT SAHODAYA
                </p>
                <p className="text-lg font-extrabold text-white">
                  CUTIES&apos; FEST 2026–27
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Official Live Tournament Scoreboard &amp; Competition Management
              System for the Inter-School Cultural Competition featuring 20
              Sahodaya member schools across Category I (LKG &amp; UKG) and
              Category II (Class I &amp; II).
            </p>
            <div className="inline-flex items-center gap-2 rounded-lg bg-navy-900/90 border border-navy-800 px-3 py-1.5 text-xs text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Verified Official Grading &amp; Points Calculation Engine
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Public Scoreboard
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Live Standings
                </Link>
              </li>
              <li>
                <Link
                  href="/leaderboard"
                  className="hover:text-white transition-colors"
                >
                  Category &amp; Overall Leaderboards
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="hover:text-white transition-colors"
                >
                  All 23 Competition Events
                </Link>
              </li>
              <li>
                <Link
                  href="/schools"
                  className="hover:text-white transition-colors"
                >
                  20 Participating Schools
                </Link>
              </li>
              <li>
                <Link
                  href="/results"
                  className="hover:text-white transition-colors"
                >
                  Published Results Hub
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Competition Rules
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• Grade A (70%+): 5 pts (Ind) / 10 pts (Grp)</li>
              <li>• Grade B (60–69%): 3 pts (Ind) / 6 pts (Grp)</li>
              <li>• Grade C (50–59%): 1 pt (Ind) / 2 pts (Grp)</li>
              <li>• 49% &amp; Below: No Grade / 0 Points</li>
              <li>• Individual Places: 1st (5), 2nd (3), 3rd (1)</li>
              <li>• Group Item Places: 1st (10), 2nd (6), 3rd (2)</li>
            </ul>
            <div className="mt-4">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-royal-400 hover:text-royal-300"
              >
                <ShieldCheck className="h-4 w-4" />
                Authorized Scorer Login →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-navy-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>
            © 2026–27 Kollam District Sahodaya Complex. All rights reserved.
          </p>
          <p>Real-Time Firestore Scoreboard Architecture</p>
        </div>
      </div>
    </footer>
  );
}

