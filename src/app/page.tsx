"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Building2,
  Calendar,
  CheckCircle2,
  Award,
  Radio,
  ArrowRight,
  Sparkles,
  Clock,
  Info,
} from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { StatCard } from "@/components/common/StatCard";
import {
  CategoryTabs,
  CategoryTabMode,
} from "@/components/common/CategoryTabs";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { StandingsChart } from "@/components/leaderboard/StandingsChart";
import { EventResultTable } from "@/components/results/EventResultTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useCompetitionData } from "@/hooks/useCompetitionData";

export default function HomePage() {
  const {
    schools,
    events,
    publishedResults,
    enrichedPublishedResults,
    category1LeaderboardPublic,
    category2LeaderboardPublic,
    overallLeaderboardPublic,
    isLoading,
    lastUpdated,
  } = useCompetitionData();

  const [activeTab, setActiveTab] = useState<CategoryTabMode>("CATEGORY_I");

  const activeSchoolsCount = schools.filter((s) => s.isActive).length;
  const completedEventsCount = events.filter(
    (e) => e.status === "COMPLETED" || e.status === "PUBLISHED"
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-royal-900 text-white">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
            <div className="lg:col-span-8 space-y-5">
              {/* Live Scoreboard Indicator */}
              <div className="inline-flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                  <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
                  Live Tournament Scoreboard
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-royal-200">
                  20 Participating Schools • 23 Official Events
                </span>
              </div>

              <div>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-300">
                  KOLLAM DISTRICT SAHODAYA
                </p>
                <h1 className="mt-1 text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                  CUTIES&apos; FEST 2026–27
                </h1>
                <p className="mt-2 text-lg sm:text-xl font-semibold text-royal-200">
                  Inter-School Cultural Competition
                </p>
              </div>

              <p className="max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
                Real-time championship standings and official event results for{" "}
                <strong className="text-white">
                  Category I (LKG &amp; UKG)
                </strong>{" "}
                and{" "}
                <strong className="text-white">
                  Category II (Class I &amp; II)
                </strong>
                . All scores are verified against the official Sahodaya grading
                and points calculation criteria.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/results"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-extrabold text-navy-950 shadow-md hover:bg-amber-300 transition-colors"
                >
                  <Award className="h-4 w-4" />
                  View Results
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/15 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  Browse All 23 Events
                </Link>
                <Link
                  href="/schools"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/15 transition-colors"
                >
                  <Building2 className="h-4 w-4" />
                  20 Schools
                </Link>
              </div>
            </div>

            {/* Podium Spotlight Box */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-300" />
                    <span className="text-sm font-extrabold uppercase tracking-wider">
                      Championship Leaders
                    </span>
                  </div>
                  {lastUpdated && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-royal-200">
                      <Clock className="h-3 w-3" />
                      Synced Live
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div className="rounded-xl bg-navy-950/60 border border-white/10 p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      Category I Leader (LKG &amp; UKG)
                    </p>
                    {category1LeaderboardPublic[0]?.points > 0 ? (
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-sm truncate">
                          {category1LeaderboardPublic[0].school.name}
                        </span>
                        <span className="rounded-lg bg-amber-400/20 text-amber-300 px-2.5 py-1 font-extrabold shrink-0">
                          {category1LeaderboardPublic[0].points} pts
                        </span>
                      </div>
                    ) : (
                      <p className="mt-1 text-slate-300">
                        Awaiting first published Category I result
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl bg-navy-950/60 border border-white/10 p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-royal-300">
                      Category II Leader (Class I &amp; II)
                    </p>
                    {category2LeaderboardPublic[0]?.points > 0 ? (
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-sm truncate">
                          {category2LeaderboardPublic[0].school.name}
                        </span>
                        <span className="rounded-lg bg-royal-400/20 text-royal-200 px-2.5 py-1 font-extrabold shrink-0">
                          {category2LeaderboardPublic[0].points} pts
                        </span>
                      </div>
                    ) : (
                      <p className="mt-1 text-slate-300">
                        Awaiting first published Category II result
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl bg-gradient-to-r from-amber-500/20 to-royal-500/20 border border-amber-400/30 p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200">
                      Overall Combined Standings Leader
                    </p>
                    {overallLeaderboardPublic[0]?.points > 0 ? (
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-sm truncate">
                          {overallLeaderboardPublic[0].school.name}
                        </span>
                        <span className="rounded-lg bg-amber-400 text-navy-950 px-2.5 py-1 font-extrabold shrink-0">
                          {overallLeaderboardPublic[0].points} pts
                        </span>
                      </div>
                    ) : (
                      <p className="mt-1 text-slate-200">
                        Standings update automatically as results are published
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        {/* Dashboard Statistics */}
        <section aria-label="Tournament Statistics">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Participating Schools"
              value={activeSchoolsCount}
              subtitle="Kollam District Sahodaya Schools"
              icon={Building2}
              variant="navy"
            />
            <StatCard
              title="Total Events"
              value={events.length}
              subtitle="7 Cat I Events • 16 Cat II Events"
              icon={Calendar}
              variant="royal"
            />
            <StatCard
              title="Completed Events"
              value={completedEventsCount}
              subtitle={`${events.length - completedEventsCount} events remaining`}
              icon={CheckCircle2}
              variant="green"
            />
            <StatCard
              title="Published Results"
              value={publishedResults.length}
              subtitle="Verified public placements"
              icon={Award}
              variant="orange"
            />
          </div>
        </section>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Interactive Category Switching Leaderboard Section */}
            <section className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-royal-600">
                    <Sparkles className="h-4 w-4" />
                    Official Real-Time Standings
                  </div>
                  <h2 className="text-2xl font-extrabold text-navy-900">
                    Live Tournament Leaderboard
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Switch between Category I (LKG &amp; UKG), Category II
                    (Class I &amp; II), or the combined Overall Leaderboard.
                  </p>
                </div>

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

              {activeTab === "OVERALL" && (
                <div className="flex items-start gap-2.5 rounded-xl border border-royal-200 bg-royal-50/70 p-3.5 text-xs text-royal-900">
                  <Info className="h-4 w-4 shrink-0 text-royal-600 mt-0.5" />
                  <p>
                    <strong>Overall Championship Distinction:</strong> The table
                    below displays each school&apos;s separate{" "}
                    <strong>Category I (LKG &amp; UKG)</strong> and{" "}
                    <strong>Category II (Class I &amp; II)</strong> totals
                    alongside their combined overall points.
                  </p>
                </div>
              )}

              {activeTab === "CATEGORY_I" && (
                <LeaderboardTable
                  entries={category1LeaderboardPublic}
                  mode="CATEGORY_I"
                  title="CATEGORY I – LKG & UKG LEADERBOARD"
                  subtitle="Official standings across 7 Category I events (2 Off Stage, 4 On Stage, 1 Group Item)"
                />
              )}

              {activeTab === "CATEGORY_II" && (
                <LeaderboardTable
                  entries={category2LeaderboardPublic}
                  mode="CATEGORY_II"
                  title="CATEGORY II – CLASS I & II LEADERBOARD"
                  subtitle="Official standings across 16 Category II events (3 Off Stage, 11 On Stage, 2 Group Items)"
                />
              )}

              {activeTab === "OVERALL" && (
                <LeaderboardTable
                  entries={overallLeaderboardPublic}
                  mode="OVERALL"
                  title="OVERALL COMBINED LEADERBOARD (CATEGORY I + CATEGORY II)"
                  subtitle="Combined points across all 23 competition events with separate Category I & II totals"
                />
              )}
            </section>

            {/* Side-by-Side Category I & Category II Leaderboards Overview */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-navy-900">
                    Side-by-Side Category Standings (Top 10)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Simultaneous view of Category I (LKG &amp; UKG) and Category
                    II (Class I &amp; II) leaderboards
                  </p>
                </div>
                <Link
                  href="/leaderboard"
                  className="text-xs sm:text-sm font-bold text-royal-600 hover:text-royal-700 inline-flex items-center gap-1"
                >
                  Full Standings <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <LeaderboardTable
                  entries={category1LeaderboardPublic}
                  mode="CATEGORY_I"
                  title="CATEGORY I – LKG & UKG"
                  subtitle="Top 10 Schools in Category I"
                  compact={true}
                  maxRows={10}
                />
                <LeaderboardTable
                  entries={category2LeaderboardPublic}
                  mode="CATEGORY_II"
                  title="CATEGORY II – CLASS I & II"
                  subtitle="Top 10 Schools in Category II"
                  compact={true}
                  maxRows={10}
                />
              </div>
            </section>

            {/* Recharts Points Analytics */}
            <section>
              <StandingsChart entries={overallLeaderboardPublic} />
            </section>

            {/* Latest Published Results Feed */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-navy-900">
                    Recently Published Event Results
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Live feed of verified placements and grades published by the
                    scoring desk
                  </p>
                </div>
                <Link
                  href="/results"
                  className="text-xs sm:text-sm font-bold text-royal-600 hover:text-royal-700 inline-flex items-center gap-1"
                >
                  View All Results <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <EventResultTable
                results={enrichedPublishedResults.slice(0, 12)}
                showEventColumn={true}
                showSchoolColumn={true}
                emptyTitle="No Results Published Yet"
                emptyDescription="As soon as the administrator enters and publishes event marks in the Admin Dashboard, live placements and points will appear here automatically."
              />
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

