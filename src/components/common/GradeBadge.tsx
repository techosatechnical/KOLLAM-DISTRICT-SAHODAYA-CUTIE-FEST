import React from "react";
import { Grade } from "@/types";

interface GradeBadgeProps {
  grade: Grade;
  showPoints?: number;
  size?: "sm" | "md" | "lg";
}

export function GradeBadge({
  grade,
  showPoints,
  size = "md",
}: GradeBadgeProps) {
  const colorClasses = {
    A: "bg-emerald-50 text-emerald-700 border-emerald-200",
    B: "bg-royal-50 text-royal-700 border-royal-200",
    C: "bg-amber-50 text-amber-700 border-amber-200",
    "No Grade": "bg-red-50 text-red-700 border-red-200",
  }[grade];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold ${colorClasses} ${sizeClasses}`}
    >
      <span>{grade === "No Grade" ? "No Grade" : `Grade ${grade}`}</span>
      {typeof showPoints === "number" && (
        <span className="opacity-80 font-semibold">({showPoints} pts)</span>
      )}
    </span>
  );
}

