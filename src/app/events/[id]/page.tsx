"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Users,
  User,
  CheckCircle2,
  Clock3,
  Building2,
} from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { EventResultTable } from "@/components/results/EventResultTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useCompetitionData } from "@/hooks/useCompetitionData";
import { formatCategoryLabel, formatEventTypeLabel } from "@/lib/utils";

export default function EventResultsDetailPage() {
  const params = useParams<{ id: string }>();
  const eventId = params?.id || "";

  const { events, schools, enrichedPublishedResults, isLoading } =
    useCompetitionData();

  const event = useMemo(
    () => events.find((e) => e.id === eventId) || null,
    [events, eventId]
  );

  const eventResults = useMemo(
    () => enrichedPublishedResults.filter((r) => r.eventId === eventId),
    [enrichedPublishedResults, eventId]
  );

  const participatingSchoolsInCategory = useMemo(() => {
    if (!event) return [];
    return schools.filter((s) =>
      event.category === "CATEGORY_I"
        ? s.category1Participation && s.isActive
        : s.category2Participation && s.isActive
    );
  }, [schools, event]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-royal-600 hover:text-royal-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All 23 Events
          </Link>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : !event ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <h1 className="text-xl font-bold text-navy-900">Event Not Found</h1>
            <p className="mt-2 text-sm text-slate-500">
              The requested event ID ({eventId}) could not be found.
            </p>
          </div>
        ) : (
          <>
            {/* Event Header Card */}
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-navy-950 via-navy-900 to-royal-900 p-6 sm:p-8 text-white shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-2">
                  <span className="inline-flex items-center rounded-full bg-amber-400/20 border border-amber-300/40 px-3 py-1 text-xs font-bold text-amber-300">
                    {formatCategoryLabel(event.category)}
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-extrabold">
                    {event.name}
                  </h1>
                </div>

                <div>
                  {eventResults.length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 px-4 py-2 text-xs font-extrabold text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" />
                      Official Results Published ({eventResults.length})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 px-4 py-2 text-xs font-extrabold text-amber-300">
                      <Clock3 className="h-4 w-4" />
                      Result Status: Pending Publication
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 font-semibold">
                  Section: <strong>{formatEventTypeLabel(event.eventType)}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 font-semibold">
                  <Clock className="h-4 w-4 text-amber-300" />
                  Time Limit: <strong>{event.duration}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 font-semibold">
                  {event.scoringType === "GROUP" ? (
                    <Users className="h-4 w-4 text-amber-300" />
                  ) : (
                    <User className="h-4 w-4 text-amber-300" />
                  )}
                  Scoring Type:{" "}
                  <strong>
                    {event.scoringType === "GROUP"
                      ? "Group Item (Grade: 10/6/2 + Place: 10/6/2)"
                      : "Individual Event (Grade: 5/3/1 + Place: 5/3/1)"}
                  </strong>
                </span>
              </div>
            </div>

            {/* Event Results Table Sorted by Placement */}
            <section className="space-y-3">
              <h2 className="text-lg font-extrabold text-navy-900">
                Published Placements &amp; Points Breakdown
              </h2>
              <EventResultTable
                results={eventResults}
                showSchoolColumn={true}
                showEventColumn={false}
                emptyTitle={`No Published Results for ${event.name} Yet`}
                emptyDescription="Official results for this event will appear here automatically as soon as the scoring desk publishes the marks."
              />
            </section>

            {/* Eligible Participating Schools in this Category */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-royal-600" />
                  <h3 className="text-base font-extrabold text-navy-900">
                    Eligible Participating Schools (
                    {participatingSchoolsInCategory.length})
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                {participatingSchoolsInCategory.map((sch) => {
                  const res = eventResults.find((r) => r.schoolId === sch.id);
                  return (
                    <Link
                      key={sch.id}
                      href={`/schools/${sch.id}`}
                      className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-2.5 hover:border-royal-300 hover:bg-royal-50/30 transition-colors"
                    >
                      <span className="font-semibold text-navy-900 truncate pr-2">
                        #{sch.serialNumber}. {sch.name}
                      </span>
                      {res ? (
                        <span className="shrink-0 rounded-lg bg-royal-600 px-2 py-0.5 font-extrabold text-white">
                          {res.totalPoints} pts
                        </span>
                      ) : (
                        <span className="shrink-0 text-slate-400">—</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

