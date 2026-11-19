"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Calendar,
  FilePlus2,
  ClipboardList,
  Trophy,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const ADMIN_NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/schools", label: "Schools (20)", icon: Building2 },
  { href: "/admin/events", label: "Events (23)", icon: Calendar },
  { href: "/admin/enter-results", label: "Enter Results", icon: FilePlus2 },
  { href: "/admin/manage-results", label: "Manage Results", icon: ClipboardList },
  { href: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-navy-950 text-slate-200 w-64 shrink-0 border-r border-navy-800">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-navy-800 px-5 py-4">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-royal-600 text-white shadow">
              <Trophy className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-royal-400">
                SAHODAYA ADMIN
              </p>
              <p className="text-sm font-extrabold text-white">
                CUTIES&apos; FEST 26–27
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-royal-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-navy-900 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User & Logout */}
      <div className="border-t border-navy-800 p-4 space-y-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between rounded-xl bg-navy-900 px-3.5 py-2 text-xs font-semibold text-royal-300 hover:bg-navy-800 transition-colors"
        >
          <span>View Public Scoreboard</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>

        {admin && (
          <div className="px-1">
            <p className="text-xs font-bold text-white truncate">{admin.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{admin.email}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl border border-red-900/50 bg-red-950/40 px-3.5 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-900/50 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>8. Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-navy-950 px-4 py-3 text-white">
        <div className="flex items-center gap-2.5">
          <Trophy className="h-5 w-5 text-amber-300" />
          <span className="text-sm font-extrabold">
            CUTIES&apos; FEST ADMIN
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg border border-navy-800 p-1.5 text-slate-200"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 flex h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}

