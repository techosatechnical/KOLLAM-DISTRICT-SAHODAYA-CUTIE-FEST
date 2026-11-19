"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Trophy,
  Calendar,
  Building2,
  Award,
  BarChart3,
  ShieldCheck,
  Menu,
  X,
  Radio,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Live Scoreboard", icon: Trophy },
  { href: "/leaderboard", label: "Standings", icon: BarChart3 },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/schools", label: "Schools", icon: Building2 },
  { href: "/results", label: "Results Hub", icon: Award },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Competition Logo Placeholder & Official Title */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-navy-900 via-navy-800 to-royal-600 text-white shadow-md group-hover:scale-105 transition-transform">
            <Trophy className="h-6 w-6 text-amber-300" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-royal-600">
                KOLLAM DISTRICT SAHODAYA
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200">
                <Radio className="h-2.5 w-2.5 animate-pulse text-emerald-600" />
                LIVE
              </span>
            </div>
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-navy-900">
              CUTIES&apos; FEST 2026–27
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-royal-50 text-royal-700 border border-royal-200/80"
                    : "text-slate-600 hover:bg-slate-100 hover:text-navy-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Admin Login Button */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-royal-700 transition-colors"
          >
            <ShieldCheck className="h-4 w-4 text-amber-300" />
            Admin Portal
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex md:hidden items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1.5 shadow-lg">
          {NAV_LINKS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold ${
                  isActive
                    ? "bg-royal-50 text-royal-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <ShieldCheck className="h-4 w-4 text-amber-300" />
              Admin Login / Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

