"use client";

import React, { useState } from "react";
import {
  CategoryTabs,
  CategoryTabMode,
} from "@/components/common/CategoryTabs";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { DownloadScoreboardPdfBar } from "@/components/leaderboard/DownloadScoreboardPdfBar";
import { StandingsChart } from "@/components/leaderboard/StandingsChart";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useCompetitionData } from "@/hooks/useCompetitionData";

export default function AdminLeaderboardPage() {
  const {
    events,
    enrichedResults,
    category1LeaderboardPublic,
    category2LeaderboardPublic,
    overallLeaderboardPublic,
    category1LeaderboardAdmin,
    category2LeaderboardAdmin,
    overallLeaderboardAdmin,
    isLoading,
  } = useCompetitionData();

  const [activeTab, setActiveTab] = useState<CategoryTabMode>("OVERALL");
  const [includeDrafts, setIncludeDrafts] = useState<boolean>(false);

  if (isLoading) {
    return <LoadingSpinner label="Calculating Live Standings..." />;
  }

  const cat1 = includeDrafts
    ? category1LeaderboardAdmin
    : category1LeaderboardPublic;
  const cat2 = includeDrafts
    ? category2LeaderboardAdmin
    : category2LeaderboardPublic;
  const overall = includeDrafts
    ? overallLeaderboardAdmin
    : overallLeaderboardPublic;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-royal-600">
            Derived Real-Time Standings Engine
          </p>
          <h1 className="text-2xl font-extrabold text-navy-900">
            Leaderboard &amp; Point Breakdown
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            All school point totals are dynamically derived from saved event
            results so corrections never leave stale totals.
          </p>
        </div>

        <label className="inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-navy-900 shadow-xs cursor-pointer">
          <input
            type="checkbox"
            checked={includeDrafts}
            onChange={(e) => setIncludeDrafts(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-royal-600"
          />
          <span>Include Unpublished Draft Results in Preview</span>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <CategoryTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          includeOverall={true}
          counts={{
            category1: cat1.length,
            category2: cat2.length,
            overall: overall.length,
          }}
        />
      </div>

      <DownloadScoreboardPdfBar
        category1Entries={cat1}
        category2Entries={cat2}
        overallEntries={overall}
      />

      {activeTab === "CATEGORY_I" && (
        <LeaderboardTable
          entries={cat1}
          mode="CATEGORY_I"
          title="CATEGORY I – LKG & UKG STANDINGS"
          subtitle={
            includeDrafts
              ? "Preview including draft & published results"
              : "Public standings (published results only)"
          }
        />
      )}

      {activeTab === "CATEGORY_II" && (
        <LeaderboardTable
          entries={cat2}
          mode="CATEGORY_II"
          title="CATEGORY II – CLASS I & II STANDINGS"
          subtitle={
            includeDrafts
              ? "Preview including draft & published results"
              : "Public standings (published results only)"
          }
        />
      )}

      {activeTab === "OVERALL" && (
        <LeaderboardTable
          entries={overall}
          mode="OVERALL"
          title="OVERALL COMBINED STANDINGS"
          subtitle="Category I + Category II points breakdown"
        />
      )}

      <StandingsChart entries={overall} maxSchools={10} />

      {/* Event-wise Point Breakdown Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-navy-900">
            Event-Wise Points Distribution Breakdown (All 23 Events)
          </h2>
          <p className="text-xs text-slate-500">
            Summary of points awarded per competition event
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Scoring Type</th>
                <th className="py-3 px-3 text-center">Results Entered</th>
                <th className="py-3 px-4 text-right">Total Points Awarded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((evt) => {
                const evtResults = enrichedResults.filter(
                  (r) =>
                    r.eventId === evt.id &&
                    (includeDrafts || r.publicationStatus === "PUBLISHED")
                );
                const pointsSum = evtResults.reduce(
                  (acc, curr) => acc + curr.totalPoints,
                  0
                );

                return (
                  <tr key={evt.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-navy-900">
                      {evt.serialNumber}. {evt.name}
                    </td>
                    <td className="py-3 px-3 text-xs font-semibold text-slate-600">
                      {evt.category === "CATEGORY_I"
                        ? "Category I (LKG & UKG)"
                        : "Category II (Class I & II)"}
                    </td>
                    <td className="py-3 px-3 text-xs font-bold text-royal-700">
                      {evt.scoringType}
                    </td>
                    <td className="py-3 px-3 text-center font-semibold">
                      {evtResults.length}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-navy-900">
                      {pointsSum} pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

