"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  Award,
  Sparkles,
  Trophy,
  FilePlus2,
  ClipboardList,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { GradeBadge } from "@/components/common/GradeBadge";
import { PositionBadge } from "@/components/common/PositionBadge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useCompetitionData } from "@/hooks/useCompetitionData";

export default function AdminDashboardPage() {
  const {
    schools,
    events,
    results,
    publishedResults,
    enrichedResults,
    category1LeaderboardAdmin,
    category2LeaderboardAdmin,
    isLoading,
  } = useCompetitionData();

  if (isLoading) {
    return <LoadingSpinner label="Loading Admin Dashboard..." />;
  }

  const cat1EventsCount = events.filter(
    (e) => e.category === "CATEGORY_I"
  ).length;
  const cat2EventsCount = events.filter(
    (e) => e.category === "CATEGORY_II"
  ).length;
  const completedEventsCount = events.filter(
    (e) => e.status === "COMPLETED" || e.status === "PUBLISHED"
  ).length;
  const pendingEventsCount = events.length - completedEventsCount;
  const pendingPublicationResultsCount = results.filter(
    (r) => r.publicationStatus !== "PUBLISHED"
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-royal-600">
            KOLLAM DISTRICT SAHODAYA CUTIES&apos; FEST 2026–27
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900">
            Competition Control Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Live overview of all 20 participating schools, 23 competition
            events, and scoring operations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/enter-results"
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-royal-700 transition-colors"
          >
            <FilePlus2 className="h-4 w-4 text-amber-300" />
            Enter Results
          </Link>
          <Link
            href="/admin/manage-results"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-900 hover:bg-slate-50 transition-colors"
          >
            <ClipboardList className="h-4 w-4 text-royal-600" />
            Manage Results ({results.length})
          </Link>
        </div>
      </div>

      {/* Required Statistics Cards (Section 7.A) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Schools"
          value={schools.length}
          subtitle={`${schools.filter((s) => s.isActive).length} Active Institutions`}
          icon={Building2}
          variant="navy"
        />
        <StatCard
          title="Category I Events"
          value={cat1EventsCount}
          subtitle="LKG & UKG (2 Off, 4 On, 1 Grp)"
          icon={Sparkles}
          variant="royal"
        />
        <StatCard
          title="Category II Events"
          value={cat2EventsCount}
          subtitle="Class I & II (3 Off, 11 On, 2 Grp)"
          icon={Trophy}
          variant="royal"
        />
        <StatCard
          title="Total Events"
          value={events.length}
          subtitle="Official Competition Schedule"
          icon={Calendar}
          variant="navy"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Completed Events"
          value={completedEventsCount}
          subtitle="Events with recorded marks"
          icon={CheckCircle2}
          variant="green"
        />
        <StatCard
          title="Pending Events"
          value={pendingEventsCount}
          subtitle="Awaiting result entry"
          icon={Clock3}
          variant="orange"
        />
        <StatCard
          title="Published Results"
          value={publishedResults.length}
          subtitle="Live on public scoreboard"
          icon={Award}
          variant="green"
        />
        <StatCard
          title="Pending Publication"
          value={pendingPublicationResultsCount}
          subtitle="Draft or unawarded results"
          icon={AlertCircle}
          variant={pendingPublicationResultsCount > 0 ? "orange" : "royal"}
        />
      </div>

      {/* Category I & Category II Leaderboard Previews */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LeaderboardTable
          entries={category1LeaderboardAdmin}
          mode="CATEGORY_I"
          title="Category I Leaderboard Preview"
          subtitle="Includes all saved Category I results (Top 7)"
          compact={true}
          maxRows={7}
          linkToSchoolDetails={false}
        />
        <LeaderboardTable
          entries={category2LeaderboardAdmin}
          mode="CATEGORY_II"
          title="Category II Leaderboard Preview"
          subtitle="Includes all saved Category II results (Top 7)"
          compact={true}
          maxRows={7}
          linkToSchoolDetails={false}
        />
      </div>

      {/* Recently Entered Results */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-extrabold text-navy-900">
              Recently Entered Results
            </h2>
            <p className="text-xs text-slate-500">
              Latest marks recorded by competition scorers
            </p>
          </div>
          <Link
            href="/admin/manage-results"
            className="inline-flex items-center gap-1 text-xs font-bold text-royal-600 hover:text-royal-700"
          >
            Manage All Results <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {enrichedResults.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No results have been entered yet. Click{" "}
            <Link
              href="/admin/enter-results"
              className="font-bold text-royal-600 underline"
            >
              Enter Results
            </Link>{" "}
            to record the first event score.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">School</th>
                  <th className="py-3 px-3 text-center">Grade</th>
                  <th className="py-3 px-3 text-center">Position</th>
                  <th className="py-3 px-3 text-right">Total Points</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrichedResults.slice(0, 8).map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className="font-bold text-navy-900">
                        {res.eventName}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {res.category === "CATEGORY_I"
                          ? "Category I"
                          : "Category II"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {res.schoolName}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <GradeBadge grade={res.grade} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <PositionBadge
                        position={res.position}
                        isTied={res.isTied}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-royal-700">
                      {res.totalPoints} pts
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          res.publicationStatus === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {res.publicationStatus === "PUBLISHED"
                          ? "Published"
                          : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

