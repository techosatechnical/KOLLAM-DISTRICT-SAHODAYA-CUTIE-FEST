"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Trophy,
  CheckCircle2,
  XCircle,
  Sparkles,
  FileDown,
} from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { EventResultTable } from "@/components/results/EventResultTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useCompetitionData } from "@/hooks/useCompetitionData";
import { downloadSchoolReportPdf } from "@/lib/utils/exportPdf";
import { useToast } from "@/components/common/ToastNotifications";

export default function SchoolDetailPage() {
  const params = useParams<{ id: string }>();
  const schoolId = params?.id || "";
  const { showToast } = useToast();

  const {
    schoolsWithPointsPublic,
    enrichedPublishedResults,
    category1LeaderboardPublic,
    category2LeaderboardPublic,
    overallLeaderboardPublic,
    isLoading,
  } = useCompetitionData();

  const school = useMemo(
    () => schoolsWithPointsPublic.find((s) => s.id === schoolId) || null,
    [schoolsWithPointsPublic, schoolId]
  );

  const schoolResults = useMemo(
    () => enrichedPublishedResults.filter((r) => r.schoolId === schoolId),
    [enrichedPublishedResults, schoolId]
  );

  const cat1Results = useMemo(
    () => schoolResults.filter((r) => r.category === "CATEGORY_I"),
    [schoolResults]
  );

  const cat2Results = useMemo(
    () => schoolResults.filter((r) => r.category === "CATEGORY_II"),
    [schoolResults]
  );

  const cat1Rank = useMemo(
    () =>
      category1LeaderboardPublic.find((e) => e.school.id === schoolId)?.rank,
    [category1LeaderboardPublic, schoolId]
  );

  const cat2Rank = useMemo(
    () =>
      category2LeaderboardPublic.find((e) => e.school.id === schoolId)?.rank,
    [category2LeaderboardPublic, schoolId]
  );

  const overallRank = useMemo(
    () => overallLeaderboardPublic.find((e) => e.school.id === schoolId)?.rank,
    [overallLeaderboardPublic, schoolId]
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/schools"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-royal-600 hover:text-royal-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All 20 Participating Schools
          </Link>

          {school && (
            <button
              type="button"
              onClick={() => {
                downloadSchoolReportPdf({
                  school,
                  cat1Rank,
                  cat2Rank,
                  overallRank,
                  cat1Results,
                  cat2Results,
                });
                showToast({
                  type: "success",
                  title: "School Report PDF Downloaded",
                  message: `Saved points & event-wise report for ${school.name}.`,
                });
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-sm hover:bg-royal-700 transition-colors"
            >
              <FileDown className="h-4 w-4 text-amber-300" />
              Download School Report (PDF)
            </button>
          )}
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : !school ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <h1 className="text-xl font-bold text-navy-900">School Not Found</h1>
            <p className="mt-2 text-sm text-slate-500">
              The requested school ID ({schoolId}) could not be found.
            </p>
          </div>
        ) : (
          <>
            {/* School Profile Banner */}
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-navy-950 via-navy-900 to-royal-900 p-6 sm:p-8 text-white shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-amber-300">
                      <Building2 className="h-3.5 w-3.5" />
                      School Serial #{school.serialNumber}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        downloadSchoolReportPdf({
                          school,
                          cat1Rank,
                          cat2Rank,
                          overallRank,
                          cat1Results,
                          cat2Results,
                        });
                        showToast({
                          type: "success",
                          title: "School Report PDF Downloaded",
                          message: `Saved points & event-wise report for ${school.name}.`,
                        });
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3.5 py-1 text-xs font-extrabold text-navy-950 shadow-xs hover:bg-amber-300 transition-colors"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      Download PDF
                    </button>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold">
                    {school.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2.5 text-xs">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-semibold border ${
                        school.category1Participation
                          ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30"
                          : "bg-white/5 text-slate-400 border-white/10"
                      }`}
                    >
                      {school.category1Participation ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      Category I (LKG &amp; UKG):{" "}
                      {school.category1Participation
                        ? "Participating"
                        : "Not Participating"}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-semibold border ${
                        school.category2Participation
                          ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30"
                          : "bg-white/5 text-slate-400 border-white/10"
                      }`}
                    >
                      {school.category2Participation ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      Category II (Class I &amp; II):{" "}
                      {school.category2Participation
                        ? "Participating"
                        : "Not Participating"}
                    </span>
                  </div>
                </div>

                {/* Points Summary Cards */}
                <div className="grid grid-cols-3 gap-3 sm:min-w-[340px]">
                  <div className="rounded-2xl bg-white/10 border border-white/15 p-3.5 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-royal-200">
                      Category I
                    </p>
                    <p className="mt-1 text-2xl font-black text-white">
                      {school.category1Points}
                    </p>
                    <p className="text-[11px] text-slate-300">
                      {cat1Rank ? `Rank #${cat1Rank}` : "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 border border-white/15 p-3.5 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-royal-200">
                      Category II
                    </p>
                    <p className="mt-1 text-2xl font-black text-white">
                      {school.category2Points}
                    </p>
                    <p className="text-[11px] text-slate-300">
                      {cat2Rank ? `Rank #${cat2Rank}` : "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-amber-400 p-3.5 text-center text-navy-950 shadow">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider">
                      Overall
                    </p>
                    <p className="mt-1 text-2xl font-black">
                      {school.overallPoints}
                    </p>
                    <p className="text-[11px] font-bold">
                      {overallRank ? `Rank #${overallRank}` : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category I Event-wise Results */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-navy-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-royal-600" />
                  Category I – LKG &amp; UKG Results ({cat1Results.length})
                </h2>
                <span className="text-sm font-extrabold text-royal-700">
                  Subtotal: {school.category1Points} pts
                </span>
              </div>
              <EventResultTable
                results={cat1Results}
                showEventColumn={true}
                showSchoolColumn={false}
                emptyTitle="No Published Category I Results for This School"
                emptyDescription="Published placements and points for Category I (LKG & UKG) events will be listed here."
              />
            </section>

            {/* Category II Event-wise Results */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-navy-900 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-royal-600" />
                  Category II – Class I &amp; II Results ({cat2Results.length})
                </h2>
                <span className="text-sm font-extrabold text-royal-700">
                  Subtotal: {school.category2Points} pts
                </span>
              </div>
              <EventResultTable
                results={cat2Results}
                showEventColumn={true}
                showSchoolColumn={false}
                emptyTitle="No Published Category II Results for This School"
                emptyDescription="Published placements and points for Category II (Class I & II) events will be listed here."
              />
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

