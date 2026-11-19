"use client";

import React from "react";
import Link from "next/link";
import { Trophy, Medal, Award, ChevronRight } from "lucide-react";
import { CompetitionCategory, LeaderboardEntry } from "@/types";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  mode: CompetitionCategory | "OVERALL";
  title?: string;
  subtitle?: string;
  compact?: boolean;
  maxRows?: number;
  linkToSchoolDetails?: boolean;
}

export function LeaderboardTable({
  entries,
  mode,
  title,
  subtitle,
  compact = false,
  maxRows,
  linkToSchoolDetails = true,
}: LeaderboardTableProps) {
  const displayedEntries = maxRows ? entries.slice(0, maxRows) : entries;

  const getRankStyle = (rank: number, points: number) => {
    if (points === 0) {
      return {
        row: "bg-white hover:bg-slate-50/80 border-b border-slate-100",
        badge:
          "bg-slate-100 text-slate-600 border border-slate-200 font-semibold",
        icon: null,
        label: `#${rank}`,
      };
    }

    if (rank === 1) {
      return {
        row: "bg-gradient-to-r from-amber-50/90 via-yellow-50/50 to-white hover:from-amber-100/70 border-b border-amber-200/80",
        badge:
          "bg-gradient-to-br from-amber-400 to-yellow-500 text-navy-950 border border-amber-500 shadow-sm font-extrabold",
        icon: <Trophy className="h-3.5 w-3.5 text-navy-950" />,
        label: "1st",
      };
    }
    if (rank === 2) {
      return {
        row: "bg-gradient-to-r from-slate-100/90 via-slate-50/60 to-white hover:from-slate-200/60 border-b border-slate-200",
        badge:
          "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-950 border border-slate-400 shadow-sm font-extrabold",
        icon: <Medal className="h-3.5 w-3.5 text-slate-900" />,
        label: "2nd",
      };
    }
    if (rank === 3) {
      return {
        row: "bg-gradient-to-r from-orange-50/90 via-amber-50/30 to-white hover:from-orange-100/60 border-b border-orange-200/80",
        badge:
          "bg-gradient-to-br from-orange-300 to-amber-600 text-white border border-orange-500 shadow-sm font-extrabold",
        icon: <Award className="h-3.5 w-3.5 text-white" />,
        label: "3rd",
      };
    }

    return {
      row: "bg-white hover:bg-royal-50/30 border-b border-slate-100",
      badge: "bg-navy-50 text-navy-800 border border-navy-200 font-bold",
      icon: null,
      label: `#${rank}`,
    };
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {(title || subtitle) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 bg-gradient-to-r from-navy-900 to-navy-800 px-5 py-4 text-white">
          <div>
            {title && (
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-300 shrink-0" />
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-300 mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-royal-200">
            <span className="rounded-full bg-white/10 px-2.5 py-1">
              {entries.length} Schools Ranked
            </span>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 pl-4 pr-2 sm:px-5 w-24">Rank</th>
              <th className="py-3.5 px-3 sm:px-4">School</th>
              {!compact && mode === "OVERALL" && (
                <>
                  <th className="hidden md:table-cell py-3.5 px-3 text-right">
                    Cat I (LKG/UKG)
                  </th>
                  <th className="hidden md:table-cell py-3.5 px-3 text-right">
                    Cat II (Class I/II)
                  </th>
                </>
              )}
              {!compact && (
                <th className="hidden sm:table-cell py-3.5 px-3 text-center">
                  Placements (1st / 2nd / 3rd)
                </th>
              )}
              <th className="py-3.5 pl-3 pr-4 sm:px-5 text-right w-32">
                {mode === "OVERALL" ? "Combined Points" : "Total Points"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {displayedEntries.map((entry) => {
              const rankStyle = getRankStyle(entry.rank, entry.points);

              return (
                <tr
                  key={entry.school.id}
                  className={`transition-colors ${rankStyle.row}`}
                >
                  {/* Rank cell */}
                  <td className="py-3.5 pl-4 pr-2 sm:px-5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center justify-center gap-1 rounded-xl px-2.5 py-1 text-xs min-w-[44px] ${rankStyle.badge}`}
                      >
                        {rankStyle.icon}
                        <span>{rankStyle.label}</span>
                      </span>
                      {entry.isTiedRank && (
                        <span className="rounded bg-amber-100 border border-amber-300 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-800 uppercase">
                          TIE
                        </span>
                      )}
                    </div>
                  </td>

                  {/* School cell */}
                  <td className="py-3.5 px-3 sm:px-4">
                    <div className="flex flex-col">
                      {linkToSchoolDetails ? (
                        <Link
                          href={`/schools/${entry.school.id}`}
                          className="group inline-flex items-center gap-1 font-bold text-navy-900 hover:text-royal-600 transition-colors leading-snug"
                        >
                          <span>{entry.school.name}</span>
                          <ChevronRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-royal-600 shrink-0" />
                        </Link>
                      ) : (
                        <span className="font-bold text-navy-900 leading-snug">
                          {entry.school.name}
                        </span>
                      )}

                      {/* Mobile sub-row for overall category distinction */}
                      {mode === "OVERALL" && (
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 md:hidden">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium">
                            Cat I:{" "}
                            <strong className="text-navy-900">
                              {entry.school.category1Points}
                            </strong>{" "}
                            pts
                          </span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium">
                            Cat II:{" "}
                            <strong className="text-navy-900">
                              {entry.school.category2Points}
                            </strong>{" "}
                            pts
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Desktop Cat I & Cat II columns when in OVERALL mode */}
                  {!compact && mode === "OVERALL" && (
                    <>
                      <td className="hidden md:table-cell py-3.5 px-3 text-right font-semibold text-slate-700">
                        {entry.school.category1Participation ? (
                          <span>{entry.school.category1Points} pts</span>
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="hidden md:table-cell py-3.5 px-3 text-right font-semibold text-slate-700">
                        {entry.school.category2Participation ? (
                          <span>{entry.school.category2Points} pts</span>
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </td>
                    </>
                  )}

                  {/* Placements breakdown */}
                  {!compact && (
                    <td className="hidden sm:table-cell py-3.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5 text-xs">
                        <span
                          title="1st Places"
                          className="inline-flex items-center justify-center rounded-md bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 font-bold min-w-[28px]"
                        >
                          {entry.firstPlaces}
                        </span>
                        <span
                          title="2nd Places"
                          className="inline-flex items-center justify-center rounded-md bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 font-bold min-w-[28px]"
                        >
                          {entry.secondPlaces}
                        </span>
                        <span
                          title="3rd Places"
                          className="inline-flex items-center justify-center rounded-md bg-orange-100 text-orange-900 border border-orange-200 px-2 py-0.5 font-bold min-w-[28px]"
                        >
                          {entry.thirdPlaces}
                        </span>
                      </div>
                    </td>
                  )}

                  {/* Total Points cell */}
                  <td className="py-3.5 pl-3 pr-4 sm:px-5 text-right whitespace-nowrap">
                    <span
                      className={`inline-flex items-baseline gap-1 rounded-xl px-3 py-1 font-extrabold ${
                        entry.rank === 1 && entry.points > 0
                          ? "bg-amber-500/15 text-amber-950 text-base sm:text-lg"
                          : entry.points > 0
                          ? "bg-royal-50 text-royal-700 text-base"
                          : "text-slate-400 text-sm"
                      }`}
                    >
                      <span>{entry.points}</span>
                      <span className="text-[11px] font-semibold uppercase opacity-75">
                        pts
                      </span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

