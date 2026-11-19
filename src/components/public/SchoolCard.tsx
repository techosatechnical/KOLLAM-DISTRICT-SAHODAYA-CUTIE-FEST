import React from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { SchoolWithPoints } from "@/types";

interface SchoolCardProps {
  school: SchoolWithPoints;
  overallRank?: number;
}

export function SchoolCard({ school, overallRank }: SchoolCardProps) {
  return (
    <Link
      href={`/schools/${school.id}`}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-royal-300 hover:shadow-md transition-all"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-900 font-extrabold text-sm border border-navy-100">
              #{school.serialNumber}
            </div>
            {typeof overallRank === "number" && school.overallPoints > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                <Trophy className="h-3 w-3 text-amber-600" />
                Rank #{overallRank}
              </span>
            )}
          </div>
          <Building2 className="h-5 w-5 text-slate-400 group-hover:text-royal-600 transition-colors" />
        </div>

        <h3 className="mt-3.5 text-base font-extrabold text-navy-900 group-hover:text-royal-700 transition-colors leading-snug">
          {school.name}
        </h3>

        {/* Participation badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold border ${
              school.category1Participation
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-500 border-slate-200"
            }`}
          >
            {school.category1Participation ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            Cat I (LKG &amp; UKG)
          </span>

          <span
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold border ${
              school.category2Participation
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-500 border-slate-200"
            }`}
          >
            {school.category2Participation ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            Cat II (Class I &amp; II)
          </span>
        </div>
      </div>

      {/* Points Breakdown */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-slate-50 p-2">
            <p className="text-[10px] font-bold uppercase text-slate-500">
              Cat I Pts
            </p>
            <p className="mt-0.5 text-base font-extrabold text-navy-900">
              {school.category1Participation ? school.category1Points : "—"}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-2">
            <p className="text-[10px] font-bold uppercase text-slate-500">
              Cat II Pts
            </p>
            <p className="mt-0.5 text-base font-extrabold text-navy-900">
              {school.category2Participation ? school.category2Points : "—"}
            </p>
          </div>
          <div className="rounded-xl bg-royal-50 border border-royal-100 p-2">
            <p className="text-[10px] font-bold uppercase text-royal-700">
              Overall
            </p>
            <p className="mt-0.5 text-base font-extrabold text-royal-700">
              {school.overallPoints}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs font-semibold text-royal-600">
          <span>View Event-wise Results</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

