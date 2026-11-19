"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Plus,
  Edit3,
  CheckCircle2,
  XCircle,
  Power,
  X,
} from "lucide-react";
import { SearchInput } from "@/components/common/SearchInput";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/common/ToastNotifications";
import { useCompetitionData } from "@/hooks/useCompetitionData";
import { SchoolFormValues, schoolSchema } from "@/lib/validations";
import {
  createSchool,
  deactivateOrRemoveSchool,
  updateSchool,
} from "@/services/competitionService";
import { SchoolWithPoints } from "@/types";

export default function AdminSchoolsPage() {
  const { schoolsWithPointsAdmin, results, isLoading } = useCompetitionData();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolWithPoints | null>(
    null
  );
  const [schoolToDeactivate, setSchoolToDeactivate] =
    useState<SchoolWithPoints | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: "",
      category1Participation: true,
      category2Participation: true,
      isActive: true,
    },
  });

  const filteredSchools = useMemo(() => {
    return schoolsWithPointsAdmin.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
  }, [schoolsWithPointsAdmin, searchQuery]);

  const openAddModal = () => {
    setEditingSchool(null);
    reset({
      name: "",
      category1Participation: true,
      category2Participation: true,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (school: SchoolWithPoints) => {
    setEditingSchool(school);
    reset({
      name: school.name,
      category1Participation: school.category1Participation,
      category2Participation: school.category2Participation,
      isActive: school.isActive,
    });
    setIsModalOpen(true);
  };

  const onSaveSchool = async (values: SchoolFormValues) => {
    try {
      if (editingSchool) {
        await updateSchool(editingSchool.id, values);
        showToast({
          type: "success",
          title: "School Updated",
          message: `${values.name} details saved.`,
        });
      } else {
        await createSchool(values);
        showToast({
          type: "success",
          title: "School Added",
          message: `${values.name} added to the competition roster.`,
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast({
        type: "error",
        title: "Operation Failed",
        message: err instanceof Error ? err.message : "Failed to save school.",
      });
    }
  };

  const toggleParticipation = async (
    school: SchoolWithPoints,
    field: "category1Participation" | "category2Participation"
  ) => {
    const nextVal = !school[field];
    try {
      await updateSchool(school.id, { [field]: nextVal });
      showToast({
        type: "info",
        title: "Category Participation Updated",
        message: `${school.name}: ${
          field === "category1Participation" ? "Category I" : "Category II"
        } set to ${nextVal ? "Participating" : "Not Participating"}.`,
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Update Failed",
        message: err instanceof Error ? err.message : "Could not update.",
      });
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!schoolToDeactivate) return;
    try {
      const outcome = await deactivateOrRemoveSchool(
        schoolToDeactivate.id,
        results
      );
      showToast({
        type: outcome.action === "DEACTIVATED" ? "warning" : "success",
        title:
          outcome.action === "DEACTIVATED"
            ? "School Marked Inactive"
            : "School Removed",
        message: outcome.message,
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Error",
        message: err instanceof Error ? err.message : "Operation failed.",
      });
    } finally {
      setSchoolToDeactivate(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading 20 Participating Schools..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-royal-600">
            School Roster &amp; Eligibility Management
          </p>
          <h1 className="text-2xl font-extrabold text-navy-900">
            Manage Participating Schools ({schoolsWithPointsAdmin.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Toggle Category I (LKG &amp; UKG) and Category II (Class I &amp; II)
            participation or edit school details. Schools with results are
            safely deactivated rather than permanently deleted.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-royal-700 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 text-amber-300" />
          Add School
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search school name..."
          className="w-full max-w-md"
        />
        <span className="text-xs font-semibold text-slate-500">
          Showing {filteredSchools.length} of {schoolsWithPointsAdmin.length}{" "}
          schools
        </span>
      </div>

      {/* Schools Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 w-16">Sl.No</th>
                <th className="py-3.5 px-4">School Name</th>
                <th className="py-3.5 px-3 text-center">Cat I (LKG &amp; UKG)</th>
                <th className="py-3.5 px-3 text-center">
                  Cat II (Class I &amp; II)
                </th>
                <th className="py-3.5 px-3 text-right">Cat I Pts</th>
                <th className="py-3.5 px-3 text-right">Cat II Pts</th>
                <th className="py-3.5 px-3 text-right">Overall</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchools.map((school) => (
                <tr
                  key={school.id}
                  className={`transition-colors ${
                    school.isActive
                      ? "hover:bg-slate-50"
                      : "bg-slate-50/70 opacity-60"
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-slate-500">
                    #{school.serialNumber}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-navy-900">
                    {school.name}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        toggleParticipation(school, "category1Participation")
                      }
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold border transition-colors ${
                        school.category1Participation
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {school.category1Participation ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      {school.category1Participation ? "Active" : "No"}
                    </button>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        toggleParticipation(school, "category2Participation")
                      }
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold border transition-colors ${
                        school.category2Participation
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {school.category2Participation ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      {school.category2Participation ? "Active" : "No"}
                    </button>
                  </td>
                  <td className="py-3.5 px-3 text-right font-semibold text-slate-700">
                    {school.category1Points}
                  </td>
                  <td className="py-3.5 px-3 text-right font-semibold text-slate-700">
                    {school.category2Points}
                  </td>
                  <td className="py-3.5 px-3 text-right font-extrabold text-royal-700">
                    {school.overallPoints} pts
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        school.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {school.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(school)}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-navy-900"
                        title="Edit School"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      {school.isActive ? (
                        <button
                          type="button"
                          onClick={() => setSchoolToDeactivate(school)}
                          className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                          title="Deactivate or Remove School"
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            updateSchool(school.id, { isActive: true })
                          }
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700"
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit School Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Building2 className="h-5 w-5 text-royal-600" />
                <h2 className="text-lg font-extrabold text-navy-900">
                  {editingSchool ? "Edit School Details" : "Add New School"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSaveSchool)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Official School Name
                </label>
                <input
                  type="text"
                  {...register("name")}
                  placeholder="e.g., Al Ameen Central School, Karunagappally"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-navy-900 focus:border-royal-500 focus:outline-none"
                />
                {errors.name && (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2.5 rounded-xl bg-slate-50 p-4 border border-slate-200/80">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-navy-900 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("category1Participation")}
                    className="h-4 w-4 rounded border-slate-300 text-royal-600"
                  />
                  <span>Participates in Category I (LKG &amp; UKG)</span>
                </label>

                <label className="flex items-center gap-2.5 text-sm font-semibold text-navy-900 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("category2Participation")}
                    className="h-4 w-4 rounded border-slate-300 text-royal-600"
                  />
                  <span>Participates in Category II (Class I &amp; II)</span>
                </label>

                <label className="flex items-center gap-2.5 text-sm font-semibold text-navy-900 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("isActive")}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                  />
                  <span>Active Status (Visible on Public Scoreboard)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-navy-900 px-5 py-2 text-sm font-bold text-white hover:bg-royal-700"
                >
                  {isSubmitting ? "Saving..." : "Save School"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(schoolToDeactivate)}
        title="Deactivate or Remove School"
        description={
          schoolToDeactivate
            ? `Schools with existing competition results cannot be permanently deleted and will be marked as Inactive instead. Confirm action for ${schoolToDeactivate.name}?`
            : ""
        }
        confirmLabel="Confirm"
        variant="warning"
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setSchoolToDeactivate(null)}
      />
    </div>
  );
}

