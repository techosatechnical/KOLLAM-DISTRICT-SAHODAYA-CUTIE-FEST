import React from "react";
import { Medal, Award } from "lucide-react";
import { Position } from "@/types";

interface PositionBadgeProps {
  position: Position;
  isTied?: boolean;
  size?: "sm" | "md";
}

export function PositionBadge({
  position,
  isTied,
  size = "md",
}: PositionBadgeProps) {
  if (position === null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
        Grade Only
      </span>
    );
  }

  const config = {
    1: {
      label: "1st Place",
      classes:
        "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 border-amber-300 shadow-sm",
      iconColor: "text-amber-600",
    },
    2: {
      label: "2nd Place",
      classes:
        "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border-slate-300 shadow-sm",
      iconColor: "text-slate-600",
    },
    3: {
      label: "3rd Place",
      classes:
        "bg-gradient-to-r from-orange-100 to-amber-100/80 text-orange-900 border-orange-300 shadow-sm",
      iconColor: "text-orange-600",
    },
  }[position];

  const sizeClass =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold ${config.classes} ${sizeClass}`}
    >
      {position === 1 ? (
        <Medal className={`h-3.5 w-3.5 ${config.iconColor}`} />
      ) : (
        <Award className={`h-3.5 w-3.5 ${config.iconColor}`} />
      )}
      <span>{config.label}</span>
      {isTied && (
        <span className="ml-0.5 rounded bg-navy-900/10 px-1 py-0.2 text-[10px] uppercase tracking-wider">
          TIE
        </span>
      )}
    </span>
  );
}

