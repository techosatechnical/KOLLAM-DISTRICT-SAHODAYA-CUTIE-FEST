"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import {
  CategoryTabs,
  CategoryTabMode,
} from "@/components/common/CategoryTabs";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
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

      {/* Top Bar with Category Switching Tabs only (Big-Screen Display Optimized) */}
      <div className="bg-navy-900 border-b border-navy-800 py-3.5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center sm:justify-between gap-3">
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
      </div>

      {/* Leaderboard Only with Auto-Scroll enabled for Big Screen */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
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
                autoScroll={true}
              />
            )}
            {activeTab === "CATEGORY_II" && (
              <LeaderboardTable
                entries={category2LeaderboardPublic}
                mode="CATEGORY_II"
                title="CATEGORY II – CLASS I & II LEADERBOARD"
                subtitle="Standings across all 16 Category II events"
                autoScroll={true}
              />
            )}
            {activeTab === "OVERALL" && (
              <LeaderboardTable
                entries={overallLeaderboardPublic}
                mode="OVERALL"
                title="OVERALL COMBINED LEADERBOARD"
                subtitle="Combined totals with distinct Category I and Category II point columns"
                autoScroll={true}
              />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
