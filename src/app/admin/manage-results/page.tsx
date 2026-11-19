"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  FilePlus2,
  Edit3,
  Trash2,
  Globe,
  EyeOff,
  X,
} from "lucide-react";
import { SearchInput } from "@/components/common/SearchInput";
import { FilterDropdown } from "@/components/common/FilterDropdown";
import { GradeBadge } from "@/components/common/GradeBadge";
import { PositionBadge } from "@/components/common/PositionBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ResultEntryForm } from "@/components/admin/ResultEntryForm";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/common/ToastNotifications";
import { useCompetitionData } from "@/hooks/useCompetitionData";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  deleteCompetitionResult,
  updateResultPublicationStatus,
} from "@/services/competitionService";
import { EnrichedResult, PublicationStatus } from "@/types";

export default function AdminManageResultsPage() {
  const { schools, events, results, enrichedResults, isLoading } =
    useCompetitionData();
  const { admin } = useAdminAuth();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [eventFilter, setEventFilter] = useState("ALL");
  const [schoolFilter, setSchoolFilter] = useState("ALL");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [positionFilter, setPositionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [editingResult, setEditingResult] = useState<EnrichedResult | null>(
    null
  );
  const [resultToDelete, setResultToDelete] = useState<EnrichedResult | null>(
    null
  );

  const filteredResults = useMemo(() => {
    return enrichedResults.filter((r) => {
      if (categoryFilter !== "ALL" && r.category !== categoryFilter) {
        return false;
      }
      if (eventFilter !== "ALL" && r.eventId !== eventFilter) {
        return false;
      }
      if (schoolFilter !== "ALL" && r.schoolId !== schoolFilter) {
        return false;
      }
      if (gradeFilter !== "ALL" && r.grade !== gradeFilter) {
        return false;
      }
      if (positionFilter !== "ALL") {
        if (positionFilter === "NONE" && r.position !== null) return false;
        if (
          positionFilter !== "NONE" &&
          String(r.position) !== positionFilter
        ) {
          return false;
        }
      }
      if (statusFilter !== "ALL" && r.publicationStatus !== statusFilter) {
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
    enrichedResults,
    categoryFilter,
    eventFilter,
    schoolFilter,
    gradeFilter,
    positionFilter,
    statusFilter,
    searchQuery,
  ]);

  const handleTogglePublish = async (res: EnrichedResult) => {
    const nextStatus: PublicationStatus =
      res.publicationStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

    try {
      await updateResultPublicationStatus(
        res.id,
        nextStatus,
        admin?.email || "admin@kollamsahodaya.org"
      );
      showToast({
        type: nextStatus === "PUBLISHED" ? "success" : "info",
        title:
          nextStatus === "PUBLISHED"
            ? "Result Published to Live Scoreboard"
            : "Result Unpublished (Draft)",
        message: `${res.schoolName} – ${res.eventName} (${res.totalPoints} pts)`,
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Failed to Update Status",
        message: err instanceof Error ? err.message : "Unexpected error.",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!resultToDelete) return;
    try {
      await deleteCompetitionResult(resultToDelete.id);
      showToast({
        type: "success",
        title: "Result Deleted",
        message: `Removed result for ${resultToDelete.schoolName} in ${resultToDelete.eventName}. Leaderboard recalculated.`,
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Delete Failed",
        message: err instanceof Error ? err.message : "Could not delete.",
      });
    } finally {
      setResultToDelete(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading Saved Results..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-royal-600">
            Result Verification &amp; Publication Desk
          </p>
          <h1 className="text-2xl font-extrabold text-navy-900">
            Manage Competition Results ({results.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Search, filter, edit, delete, publish, or unpublish saved results.
            Only published results appear on the public scoreboard.
          </p>
        </div>

        <Link
          href="/admin/enter-results"
          className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-royal-700 transition-colors self-start sm:self-auto"
        >
          <FilePlus2 className="h-4 w-4 text-amber-300" />
          Enter New Result
        </Link>
      </div>

      {/* Comprehensive Filters (Section 7.E) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col justify-end">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search school or event..."
            />
          </div>

          <FilterDropdown
            label="Category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { label: "All Categories", value: "ALL" },
              { label: "Category I (LKG & UKG)", value: "CATEGORY_I" },
              { label: "Category II (Class I & II)", value: "CATEGORY_II" },
            ]}
          />

          <FilterDropdown
            label="Event"
            value={eventFilter}
            onChange={setEventFilter}
            options={[
              { label: "All 23 Events", value: "ALL" },
              ...events.map((e) => ({
                label: `${
                  e.category === "CATEGORY_I" ? "[Cat I]" : "[Cat II]"
                } ${e.name}`,
                value: e.id,
              })),
            ]}
          />

          <FilterDropdown
            label="School"
            value={schoolFilter}
            onChange={setSchoolFilter}
            options={[
              { label: "All 20 Schools", value: "ALL" },
              ...schools.map((s) => ({
                label: `#${s.serialNumber} ${s.name}`,
                value: s.id,
              })),
            ]}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-1">
          <FilterDropdown
            label="Grade"
            value={gradeFilter}
            onChange={setGradeFilter}
            options={[
              { label: "All Grades", value: "ALL" },
              { label: "Grade A (70%+)", value: "A" },
              { label: "Grade B (60–69%)", value: "B" },
              { label: "Grade C (50–59%)", value: "C" },
              { label: "No Grade (49% & below)", value: "No Grade" },
            ]}
          />

          <FilterDropdown
            label="Position"
            value={positionFilter}
            onChange={setPositionFilter}
            options={[
              { label: "All Positions", value: "ALL" },
              { label: "1st Place", value: "1" },
              { label: "2nd Place", value: "2" },
              { label: "3rd Place", value: "3" },
              { label: "Unplaced", value: "NONE" },
            ]}
          />

          <FilterDropdown
            label="Publication Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "All Publication Statuses", value: "ALL" },
              { label: "Published (Public)", value: "PUBLISHED" },
              { label: "Draft (Unpublished)", value: "DRAFT" },
              {
                label: "Unawarded / Held Pending",
                value: "UNAWARDED_PENDING",
              },
            ]}
          />
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Event</th>
                <th className="py-3.5 px-4">Participating School</th>
                <th className="py-3.5 px-3 text-center">Grade</th>
                <th className="py-3.5 px-3 text-center">Position</th>
                <th className="py-3.5 px-3 text-right">Total Points</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-sm text-slate-500"
                  >
                    No saved results match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredResults.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-navy-900">
                        {res.eventName}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {res.category === "CATEGORY_I"
                          ? "Category I (LKG & UKG)"
                          : "Category II (Class I & II)"}{" "}
                        • {res.scoringType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {res.schoolName}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <GradeBadge grade={res.grade} size="sm" />
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <PositionBadge
                        position={res.position}
                        isTied={res.isTied}
                        size="sm"
                      />
                    </td>
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <span className="font-extrabold text-royal-700">
                        {res.totalPoints} pts
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        ({res.gradePoints} + {res.placePoints})
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                          res.publicationStatus === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : res.publicationStatus === "UNAWARDED_PENDING"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {res.publicationStatus === "PUBLISHED"
                          ? "Published"
                          : res.publicationStatus === "UNAWARDED_PENDING"
                          ? "Unawarded"
                          : "Draft"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(res)}
                          className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold transition-colors ${
                            res.publicationStatus === "PUBLISHED"
                              ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {res.publicationStatus === "PUBLISHED" ? (
                            <>
                              <EyeOff className="h-3.5 w-3.5" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Globe className="h-3.5 w-3.5" />
                              Publish
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingResult(res)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-navy-900"
                          title="Edit Result"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setResultToDelete(res)}
                          className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                          title="Delete Result"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Result Modal */}
      {editingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="my-8 w-full max-w-4xl rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-extrabold text-navy-900">
                Edit Saved Result: {editingResult.schoolName} (
                {editingResult.eventName})
              </h2>
              <button
                type="button"
                onClick={() => setEditingResult(null)}
                className="rounded-lg p-1 text-slate-500 hover:text-navy-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ResultEntryForm
              schools={schools}
              events={events}
              existingResults={results}
              adminEmail={admin?.email || "admin@kollamsahodaya.org"}
              initialResultToEdit={editingResult}
              onSuccess={() => setEditingResult(null)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(resultToDelete)}
        title="Delete Competition Result"
        description={
          resultToDelete
            ? `Are you sure you want to permanently delete the result for ${resultToDelete.schoolName} in ${resultToDelete.eventName} (${resultToDelete.totalPoints} pts)? The live leaderboard will be recalculated immediately.`
            : ""
        }
        confirmLabel="Delete Result"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setResultToDelete(null)}
      />
    </div>
  );
}

