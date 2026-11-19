import React from "react";
import Link from "next/link";
import {
  Clock,
  Users,
  User,
  CheckCircle2,
  Clock3,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Event } from "@/types";
import { formatCategoryShort, formatEventTypeLabel } from "@/lib/utils";

interface EventCardProps {
  event: Event;
  publishedResultsCount: number;
}

export function EventCard({ event, publishedResultsCount }: EventCardProps) {
  const isPublished =
    event.status === "PUBLISHED" || publishedResultsCount > 0;
  const isCompleted = event.status === "COMPLETED" && !isPublished;

  const statusBadge = isPublished ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
      Published ({publishedResultsCount})
    </span>
  ) : isCompleted ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-royal-50 border border-royal-200 px-2.5 py-0.5 text-xs font-bold text-royal-700">
      <Sparkles className="h-3.5 w-3.5 text-royal-600" />
      Completed (Awaiting Publish)
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-700">
      <Clock3 className="h-3.5 w-3.5 text-amber-600" />
      Pending
    </span>
  );

  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-royal-300 hover:shadow-md transition-all"
    >
      <div>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-royal-600">
            {formatCategoryShort(event.category)}
          </span>
          {statusBadge}
        </div>

        <h3 className="mt-2.5 text-base font-extrabold text-navy-900 group-hover:text-royal-700 transition-colors">
          {event.name}
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 font-semibold">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            {event.duration}
          </span>

          <span className="inline-flex items-center gap-1 rounded-lg bg-navy-50 text-navy-800 px-2.5 py-1 font-semibold">
            {formatEventTypeLabel(event.eventType)}
          </span>

          <span
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold ${
              event.scoringType === "GROUP"
                ? "bg-purple-50 text-purple-700 border border-purple-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            {event.scoringType === "GROUP" ? (
              <Users className="h-3.5 w-3.5" />
            ) : (
              <User className="h-3.5 w-3.5" />
            )}
            {event.scoringType === "GROUP"
              ? "Group Scoring (Max 20)"
              : "Individual Scoring (Max 10)"}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-royal-600">
        <span>
          {isPublished
            ? "View Official Event Results"
            : "View Event Info & Rules"}
        </span>
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}

