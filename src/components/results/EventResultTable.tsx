"use client";

import React from "react";
import Link from "next/link";
import { EnrichedResult } from "@/types";
import { GradeBadge } from "@/components/common/GradeBadge";
import { PositionBadge } from "@/components/common/PositionBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { getGradeCriteriaLabel } from "@/lib/scoring";
import { Award } from "lucide-react";

interface EventResultTableProps {
  results: EnrichedResult[];
  showEventColumn?: boolean;
  showSchoolColumn?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function EventResultTable({
  results,
  showEventColumn = false,
  showSchoolColumn = true,
  emptyTitle = "No Published Results Yet",
  emptyDescription = "Results for this selection will appear live as soon as they are verified and published by the competition scorer.",
}: EventResultTableProps) {
  if (results.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={Award}
      />
    );
  }

  // Sort results by position (1, 2, 3, then null) and then by totalPoints descending
  const sortedResults = [...results].sort((a, b) => {
    const posA = a.position ?? 99;
    const posB = b.position ?? 99;
    if (posA !== posB) return posA - posB;
    return b.totalPoints - a.totalPoints;
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 pl-4 pr-2 sm:px-5">Position</th>
              {showSchoolColumn && (
                <th className="py-3.5 px-3 sm:px-4">Participating School</th>
              )}
              {showEventColumn && (
                <th className="py-3.5 px-3 sm:px-4">Event</th>
              )}
              <th className="py-3.5 px-3 text-center">Grade</th>
              <th className="hidden sm:table-cell py-3.5 px-3 text-right">
                Grade Criteria
              </th>
              <th className="hidden md:table-cell py-3.5 px-3 text-right">
                Grade + Place Pts
              </th>
              <th className="py-3.5 pl-3 pr-4 sm:px-5 text-right">
                Total Points
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sortedResults.map((res) => (
              <tr
                key={res.id}
                className={`transition-colors ${
                  res.position === 1 && res.totalPoints > 0
                    ? "bg-amber-50/40 hover:bg-amber-50/80"
                    : "hover:bg-slate-50"
                }`}
              >
                <td className="py-3.5 pl-4 pr-2 sm:px-5 whitespace-nowrap">
                  <PositionBadge position={res.position} isTied={res.isTied} />
                </td>

                {showSchoolColumn && (
                  <td className="py-3.5 px-3 sm:px-4 font-bold text-navy-900">
                    <Link
                      href={`/schools/${res.schoolId}`}
                      className="hover:text-royal-600 transition-colors"
                    >
                      {res.schoolName}
                    </Link>
                  </td>
                )}

                {showEventColumn && (
                  <td className="py-3.5 px-3 sm:px-4">
                    <Link
                      href={`/events/${res.eventId}`}
                      className="font-semibold text-navy-900 hover:text-royal-600 transition-colors"
                    >
                      {res.eventName}
                    </Link>
                    <span className="block text-xs text-slate-500">
                      {res.category === "CATEGORY_I"
                        ? "Category I (LKG & UKG)"
                        : "Category II (Class I & II)"}{" "}
                      • {res.scoringType === "GROUP" ? "Group Item" : "Individual"}
                    </span>
                  </td>
                )}

                <td className="py-3.5 px-3 text-center whitespace-nowrap">
                  <GradeBadge grade={res.grade} size="sm" />
                </td>

                <td className="hidden sm:table-cell py-3.5 px-3 text-right text-xs font-medium text-slate-500 whitespace-nowrap">
                  {getGradeCriteriaLabel(res.grade)}
                </td>

                <td className="hidden md:table-cell py-3.5 px-3 text-right text-xs text-slate-500 whitespace-nowrap">
                  {res.gradePoints} + {res.placePoints}
                </td>

                <td className="py-3.5 pl-3 pr-4 sm:px-5 text-right whitespace-nowrap">
                  <span className="inline-flex items-baseline gap-1 rounded-xl bg-royal-50 px-3 py-1 font-extrabold text-royal-700">
                    <span>{res.totalPoints}</span>
                    <span className="text-[11px] font-semibold uppercase">
                      pts
                    </span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
