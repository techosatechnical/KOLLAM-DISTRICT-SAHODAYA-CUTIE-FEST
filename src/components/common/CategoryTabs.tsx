"use client";

import React from "react";
import { CompetitionCategory } from "@/types";
import { Trophy, Sparkles, Layers } from "lucide-react";

export type CategoryTabMode = CompetitionCategory | "OVERALL";

interface CategoryTabsProps {
  activeTab: CategoryTabMode;
  onChange: (tab: CategoryTabMode) => void;
  includeOverall?: boolean;
  counts?: {
    category1?: number;
    category2?: number;
    overall?: number;
  };
}

export function CategoryTabs({
  activeTab,
  onChange,
  includeOverall = true,
  counts,
}: CategoryTabsProps) {
  const tabs: {
    id: CategoryTabMode;
    label: string;
    shortLabel: string;
    count?: number;
    icon: React.ElementType;
  }[] = [
    {
      id: "CATEGORY_I",
      label: "CATEGORY I – LKG & UKG",
      shortLabel: "Cat I (LKG & UKG)",
      count: counts?.category1,
      icon: Sparkles,
    },
    {
      id: "CATEGORY_II",
      label: "CATEGORY II – CLASS I & II",
      shortLabel: "Cat II (Class I & II)",
      count: counts?.category2,
      icon: Trophy,
    },
  ];

  if (includeOverall) {
    tabs.push({
      id: "OVERALL",
      label: "OVERALL CHAMPIONSHIP",
      shortLabel: "Overall Combined",
      count: counts?.overall,
      icon: Layers,
    });
  }

  return (
    <div className="inline-flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-100 p-1.5 border border-slate-200/80">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all ${
              isActive
                ? "bg-navy-900 text-white shadow-sm"
                : "text-slate-600 hover:text-navy-900 hover:bg-white/60"
            }`}
          >
            <Icon
              className={`h-4 w-4 ${
                isActive ? "text-amber-300" : "text-slate-500"
              }`}
            />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
            {typeof tab.count === "number" && (
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                  isActive
                    ? "bg-royal-600 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

