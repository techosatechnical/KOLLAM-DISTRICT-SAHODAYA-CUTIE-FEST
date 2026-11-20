"use client";

import React, { useMemo, useState } from "react";
import { Award, Trophy, Building2, Calendar } from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { DownloadScoreboardPdfBar } from "@/components/leaderboard/DownloadScoreboardPdfBar";
import { EventResultTable } from "@/components/results/EventResultTable";
import { SearchInput } from "@/components/common/SearchInput";
import { FilterDropdown } from "@/components/common/FilterDropdown";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useCompetitionData } from "@/hooks/useCompetitionData";

type ResultsHubTab =
  | "CAT_I_LEADERBOARD"
  | "CAT_II_LEADERBOARD"
  | "OVERALL_LEADERBOARD"
  | "EVENT_WISE"
  | "SCHOOL_WISE";

export default function ResultsHubPage() {
  const {
    schools,
    events,
    enrichedPublishedResults,
    category1LeaderboardPublic,
    category2LeaderboardPublic,
    overallLeaderboardPublic,
    isLoading,
  } = useCompetitionData();

  const [activeView, setActiveView] = useState<ResultsHubTab>("EVENT_WISE");
  const [selectedEventId, setSelectedEventId] = useState<string>("ALL");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredResults = useMemo(() => {
    return enrichedPublishedResults.filter((r) => {
      if (selectedCategory !== "ALL" && r.category !== selectedCategory) {
        return false;
      }
      if (selectedEventId !== "ALL" && r.eventId !== selectedEventId) {
        return false;
      }
      if (selectedSchoolId !== "ALL" && r.schoolId !== selectedSchoolId) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (
          !r.schoolName.toLowerCase().includes(q) &&
          !r.eventName.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [
    enrichedPublishedResults,
    selectedCategory,
    selectedEventId,
    selectedSchoolId,
    searchQuery,
  ]);

  const navButtons: { id: ResultsHubTab; label: string; icon: React.ElementType }[] = [
    { id: "EVENT_WISE", label: "Event-Wise Results", icon: Calendar },
    { id: "SCHOOL_WISE", label: "School-Wise Results", icon: Building2 },
    { id: "CAT_I_LEADERBOARD", label: "Category I Leaderboard", icon: Trophy },
    { id: "CAT_II_LEADERBOARD", label: "Category II Leaderboard", icon: Trophy },
    { id: "OVERALL_LEADERBOARD", label: "Overall Leaderboard", icon: Award },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="bg-navy-900 text-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-300">
            <Award className="h-4 w-4" />
            Official Competition Results Center
          </div>
          <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold">
            Published Results &amp; Standings Hub
          </h1>
          <p className="mt-2 text-sm text-slate-300 max-w-2xl">
            Explore Category I leaderboard, Category II leaderboard, Overall
            combined standings, school-wise results, and event-wise placements
            powered by real-time Firestore data.
          </p>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xs">
          {navButtons.map((btn) => {
            const Icon = btn.icon;
            const active = activeView === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => setActiveView(btn.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                  active
                    ? "bg-navy-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-navy-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{btn.label}</span>
              </button>
            );
          })}
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
            {activeView === "CAT_I_LEADERBOARD" && (
              <LeaderboardTable
                entries={category1LeaderboardPublic}
                mode="CATEGORY_I"
                title="CATEGORY I – LKG & UKG OFFICIAL LEADERBOARD"
                subtitle="Calculated from published Category I event results"
              />
            )}

            {activeView === "CAT_II_LEADERBOARD" && (
              <LeaderboardTable
                entries={category2LeaderboardPublic}
                mode="CATEGORY_II"
                title="CATEGORY II – CLASS I & II OFFICIAL LEADERBOARD"
                subtitle="Calculated from published Category II event results"
              />
            )}

            {activeView === "OVERALL_LEADERBOARD" && (
              <LeaderboardTable
                entries={overallLeaderboardPublic}
                mode="OVERALL"
                title="OVERALL COMBINED LEADERBOARD"
                subtitle="Combined points across Category I and Category II with distinct category sub-totals"
              />
            )}

            {(activeView === "EVENT_WISE" || activeView === "SCHOOL_WISE") && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex flex-col justify-end">
                    <SearchInput
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder="Search school or event..."
                    />
                  </div>

                  <FilterDropdown
                    label="Category"
                    value={selectedCategory}
                    onChange={(val) => {
                      setSelectedCategory(val);
                      setSelectedEventId("ALL");
                    }}
                    options={[
                      { label: "All Categories", value: "ALL" },
                      { label: "Category I (LKG & UKG)", value: "CATEGORY_I" },
                      {
                        label: "Category II (Class I & II)",
                        value: "CATEGORY_II",
                      },
                    ]}
                  />

                  <FilterDropdown
                    label="Filter by Event"
                    value={selectedEventId}
                    onChange={setSelectedEventId}
                    options={[
                      { label: "All 23 Events", value: "ALL" },
                      ...events
                        .filter(
                          (e) =>
                            selectedCategory === "ALL" ||
                            e.category === selectedCategory
                        )
                        .map((e) => ({
                          label: `${
                            e.category === "CATEGORY_I" ? "[Cat I]" : "[Cat II]"
                          } ${e.name}`,
                          value: e.id,
                        })),
                    ]}
                  />

                  <FilterDropdown
                    label="Filter by School"
                    value={selectedSchoolId}
                    onChange={setSelectedSchoolId}
                    options={[
                      { label: "All 20 Participating Schools", value: "ALL" },
                      ...schools.map((s) => ({
                        label: `#${s.serialNumber} ${s.name}`,
                        value: s.id,
                      })),
                    ]}
                  />
                </div>

                <EventResultTable
                  results={filteredResults}
                  showEventColumn={true}
                  showSchoolColumn={true}
                />
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

