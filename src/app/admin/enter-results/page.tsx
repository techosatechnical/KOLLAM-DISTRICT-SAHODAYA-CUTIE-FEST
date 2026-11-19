"use client";

import React from "react";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { ResultEntryForm } from "@/components/admin/ResultEntryForm";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useCompetitionData } from "@/hooks/useCompetitionData";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function AdminEnterResultsPage() {
  const { schools, events, results, isLoading } = useCompetitionData();
  const { admin } = useAdminAuth();

  if (isLoading) {
    return <LoadingSpinner label="Loading Result Entry Form..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-royal-600">
            Official Marks &amp; Placements Entry
          </p>
          <h1 className="text-2xl font-extrabold text-navy-900">
            Enter Competition Results
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Select an event and participating school, enter the percentage and
            placement, and verify the auto-calculated grade and points before
            saving.
          </p>
        </div>

        <Link
          href="/admin/manage-results"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-900 hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <ClipboardList className="h-4 w-4 text-royal-600" />
          Manage Saved Results ({results.length})
        </Link>
      </div>

      <ResultEntryForm
        schools={schools}
        events={events}
        existingResults={results}
        adminEmail={admin?.email || "admin@kollamsahodaya.org"}
      />
    </div>
  );
}

