"use client";

import React, { useState } from "react";
import { Trophy } from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import {
  CategoryTabs,
  CategoryTabMode,
} from "@/components/common/CategoryTabs";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { DownloadScoreboardPdfBar } from "@/components/leaderboard/DownloadScoreboardPdfBar";
import { StandingsChart } from "@/components/leaderboard/StandingsChart";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useCompetitionData } from "@/hooks/useCompetitionData";

export default function LeaderboardPage() {
  const {
    category1LeaderboardPublic,
    category2LeaderboardPublic,
    overallLeaderboardPublic,
    isLoading,
  } = useCompetitionData();

  const [activeTab, setActiveTab] = useState<CategoryTabMode>("CATEGORY_I");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="bg-navy-900 text-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-300">
            <Trophy className="h-4 w-4" />
            Live Championship Standings
          </div>
          <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold">
            Official Tournament Leaderboards
          </h1>
          <p className="mt-2 text-sm text-slate-300 max-w-2xl">
            Live points standings for Category I (LKG &amp; UKG), Category II
            (Class I &amp; II), and the Combined Overall Championship.
          </p>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CategoryTabs
            activeTab={activeTab}
            onChange={setActiveTab}
            includeOverall={true}
            counts={{
              category1: category1LeaderboardPublic.length,
              category2: category2LeaderboardPublic.length,
              overall: overallLeaderboardPublic.length,
            }}
          />
        </div>

        <DownloadScoreboardPdfBar
          category1Entries={category1LeaderboardPublic}
          category2Entries={category2LeaderboardPublic}
          overallEntries={overallLeaderboardPublic}
        />

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {activeTab === "CATEGORY_I" && (
              <LeaderboardTable
                entries={category1LeaderboardPublic}
                mode="CATEGORY_I"
                title="CATEGORY I – LKG & UKG LEADERBOARD"
                subtitle="Standings across all 7 Category I events"
              />
            )}
            {activeTab === "CATEGORY_II" && (
              <LeaderboardTable
                entries={category2LeaderboardPublic}
                mode="CATEGORY_II"
                title="CATEGORY II – CLASS I & II LEADERBOARD"
                subtitle="Standings across all 16 Category II events"
              />
            )}
            {activeTab === "OVERALL" && (
              <LeaderboardTable
                entries={overallLeaderboardPublic}
                mode="OVERALL"
                title="OVERALL COMBINED LEADERBOARD"
                subtitle="Combined totals with distinct Category I and Category II point columns"
              />
            )}

            <StandingsChart
              entries={overallLeaderboardPublic}
              maxSchools={10}
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

