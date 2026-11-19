import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "navy" | "royal" | "green" | "orange" | "red";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "royal",
}: StatCardProps) {
  const iconStyles = {
    navy: "bg-navy-900 text-white",
    royal: "bg-royal-50 text-royal-600 border border-royal-100",
    green: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    orange: "bg-amber-50 text-amber-600 border border-amber-200",
    red: "bg-red-50 text-red-600 border border-red-200",
  }[variant];

  const badgeAccent = {
    navy: "border-t-navy-900",
    royal: "border-t-royal-600",
    green: "border-t-emerald-500",
    orange: "border-t-amber-500",
    red: "border-t-red-500",
  }[variant];

  return (
    <div
      className={`rounded-2xl border border-slate-200 border-t-4 ${badgeAccent} bg-white p-5 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-navy-900">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p>
          )}
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconStyles}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

