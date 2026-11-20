"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Info,
  Save,
  Sparkles,
} from "lucide-react";
import {
  CompetitionCategory,
  Event,
  Grade,
  Position,
  Result,
  School,
} from "@/types";
import { calculateScore, getGradeCriteriaLabel } from "@/lib/scoring";
import {
  ResultEntryFormValues,
  resultEntrySchema,
} from "@/lib/validations";
import { saveCompetitionResult } from "@/services/competitionService";
import { GradeBadge } from "@/components/common/GradeBadge";
import { PositionBadge } from "@/components/common/PositionBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useToast } from "@/components/common/ToastNotifications";

interface ResultEntryFormProps {
  schools: School[];
  events: Event[];
  existingResults: Result[];
  adminEmail: string;
  initialResultToEdit?: Result | null;
  onSuccess?: (saved: Result) => void;
}

const GRADE_OPTIONS: {
  value: Grade;
  label: string;
  criteria: string;
}[] = [
  {
    value: "A",
    label: "Grade A",
    criteria: "70% and above",
  },
  {
    value: "B",
    label: "Grade B",
    criteria: "60% to 69%",
  },
  {
    value: "C",
    label: "Grade C",
    criteria: "50% to 59%",
  },
  {
    value: "No Grade",
    label: "No Grade",
    criteria: "49% and below (0 pts)",
  },
];

export function ResultEntryForm({
  schools,
  events,
  existingResults,
  adminEmail,
  initialResultToEdit,
  onSuccess,
}: ResultEntryFormProps) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingConfirmPayload, setPendingConfirmPayload] =
    useState<ResultEntryFormValues | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<{
    title: string;
    description: string;
  }>({ title: "", description: "" });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ResultEntryFormValues>({
    resolver: zodResolver(resultEntrySchema),
    defaultValues: {
      category: initialResultToEdit?.category || "CATEGORY_I",
      eventId: initialResultToEdit?.eventId || "",
      schoolId: initialResultToEdit?.schoolId || "",
      grade: initialResultToEdit?.grade || "A",
      position:
        initialResultToEdit !== undefined
          ? initialResultToEdit?.position ?? 1
          : 1,
      publicationStatus:
        initialResultToEdit?.publicationStatus || "PUBLISHED",
      notes: initialResultToEdit?.notes || "",
    },
  });

  useEffect(() => {
    if (initialResultToEdit) {
      reset({
        category: initialResultToEdit.category,
        eventId: initialResultToEdit.eventId,
        schoolId: initialResultToEdit.schoolId,
        grade: initialResultToEdit.grade,
        position: initialResultToEdit.position,
        publicationStatus: initialResultToEdit.publicationStatus,
        notes: initialResultToEdit.notes || "",
      });
    }
  }, [initialResultToEdit, reset]);

  const selectedCategory = watch("category");
  const selectedEventId = watch("eventId");
  const selectedSchoolId = watch("schoolId");
  const selectedGrade = watch("grade");
  const selectedPosition = watch("position");

  // When an event is selected, ensure its category is synced
  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || null,
    [events, selectedEventId]
  );

  useEffect(() => {
    if (selectedEvent && selectedEvent.category !== selectedCategory) {
      setValue("category", selectedEvent.category);
    }
  }, [selectedEvent, selectedCategory, setValue]);

  // Filter events for the active category
  const filteredEvents = useMemo(
    () => events.filter((e) => e.category === selectedCategory),
    [events, selectedCategory]
  );

  // Filter eligible active schools participating in the selected category
  const eligibleSchools = useMemo(() => {
    return schools.filter((s) => {
      if (!s.isActive) return false;
      return selectedCategory === "CATEGORY_I"
        ? s.category1Participation
        : s.category2Participation;
    });
  }, [schools, selectedCategory]);

  const selectedSchool = useMemo(
    () => schools.find((s) => s.id === selectedSchoolId) || null,
    [schools, selectedSchoolId]
  );

  const activeScoringType =
    selectedEvent?.eventType === "GROUP_ITEM"
      ? "GROUP"
      : selectedEvent?.scoringType || "INDIVIDUAL";

  // Live Scoring Preview via Canonical Scoring Engine
  const scoringPreview = useMemo(() => {
    return calculateScore({
      grade: selectedGrade || "A",
      position: selectedPosition,
      scoringType: activeScoringType,
    });
  }, [selectedGrade, selectedPosition, activeScoringType]);

  // Check existing entries for this school + event (multiple participants from the same school can score in the same event)
  const existingEntriesForSchoolAndEvent = useMemo(() => {
    if (!selectedEventId || !selectedSchoolId) return [];
    return existingResults.filter(
      (r) =>
        r.eventId === selectedEventId &&
        r.schoolId === selectedSchoolId &&
        r.id !== initialResultToEdit?.id
    );
  }, [
    existingResults,
    selectedEventId,
    selectedSchoolId,
    initialResultToEdit?.id,
  ]);

  const existingSchoolEventPoints = useMemo(
    () =>
      existingEntriesForSchoolAndEvent.reduce(
        (sum, r) => sum + r.totalPoints,
        0
      ),
    [existingEntriesForSchoolAndEvent]
  );

  // Check if another entry already holds this position in the same event (Tie Warning per Rule 11)
  const tiedPlacementResults = useMemo(() => {
    if (!selectedEventId || selectedPosition === null) return [];
    return existingResults.filter(
      (r) =>
        r.eventId === selectedEventId &&
        r.position === selectedPosition &&
        r.id !== initialResultToEdit?.id
    );
  }, [
    existingResults,
    selectedEventId,
    selectedPosition,
    initialResultToEdit?.id,
  ]);

  const executeSave = async (
    values: ResultEntryFormValues,
    editId?: string
  ) => {
    if (!selectedEvent || !selectedSchool) return;
    setIsSubmitting(true);
    try {
      const { savedResult, tiedWithSchools } = await saveCompetitionResult({
        event: selectedEvent,
        school: selectedSchool,
        grade: values.grade,
        position: values.position,
        publicationStatus: values.publicationStatus,
        notes: values.notes,
        updatedBy: adminEmail,
        existingResults,
        editingResultId: editId,
      });

      const newSchoolTotalInEvent =
        existingSchoolEventPoints + savedResult.totalPoints;

      showToast({
        type: tiedWithSchools.length > 0 ? "warning" : "success",
        title: initialResultToEdit
          ? "Result Updated Successfully"
          : "Result Added Successfully",
        message:
          existingEntriesForSchoolAndEvent.length > 0 && !initialResultToEdit
            ? `Added +${savedResult.totalPoints} pts for ${selectedSchool.name} in ${selectedEvent.name} (Cumulative in event: ${newSchoolTotalInEvent} pts).`
            : tiedWithSchools.length > 0
            ? `${selectedSchool.name} awarded ${savedResult.totalPoints} pts (Tied placement with ${tiedWithSchools.join(", ")}).`
            : `${selectedSchool.name} (${selectedEvent.name}): Grade ${savedResult.grade}, ${savedResult.totalPoints} Total Points.`,
      });

      if (!initialResultToEdit) {
        setValue("schoolId", "");
      }
      if (onSuccess) onSuccess(savedResult);
    } catch (err) {
      showToast({
        type: "error",
        title: "Could Not Save Result",
        message: err instanceof Error ? err.message : "Unexpected error",
      });
    } finally {
      setIsSubmitting(false);
      setPendingConfirmPayload(null);
    }
  };

  const onFormSubmit = async (values: ResultEntryFormValues) => {
    if (!selectedEvent || !selectedSchool) return;

    if (initialResultToEdit) {
      setConfirmMessage({
        title: "Confirm Result Modification",
        description: `Are you sure you want to update this saved result for ${selectedSchool.name} in ${selectedEvent.name}? The live leaderboard will recalculate immediately.`,
      });
      setPendingConfirmPayload(values);
      return;
    }

    if (tiedPlacementResults.length > 0) {
      const tiedNames = tiedPlacementResults
        .map((r) => schools.find((s) => s.id === r.schoolId)?.name || r.schoolId)
        .join(", ");
      setConfirmMessage({
        title: "Tied Placement / Additional Entry Confirmation",
        description: `Position #${values.position} in ${selectedEvent.name} is already recorded for ${tiedNames}. Confirming will ADD this new entry (+${scoringPreview.totalPoints} pts) without overwriting existing points.`,
      });
      setPendingConfirmPayload(values);
      return;
    }

    await executeSave(values, undefined);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Main Result Entry Form */}
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-navy-900">
              {initialResultToEdit
                ? "Edit Competition Result"
                : "Official Result Entry Form"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select the Grade and Position; points are automatically calculated
              by the Sahodaya 2026–27 scoring engine.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-royal-50 border border-royal-100 px-3 py-1.5 text-xs font-bold text-royal-700">
            <Calculator className="h-4 w-4" />
            Auto-Calculated Points
          </span>
        </div>

        {/* 1. Category & 2. Event */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              1. Competition Category
            </label>
            <select
              {...register("category")}
              onChange={(e) => {
                const cat = e.target.value as CompetitionCategory;
                setValue("category", cat);
                setValue("eventId", "");
                setValue("schoolId", "");
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-navy-900 focus:border-royal-500 focus:outline-none focus:ring-2 focus:ring-royal-500/20"
            >
              <option value="CATEGORY_I">CATEGORY I – LKG &amp; UKG</option>
              <option value="CATEGORY_II">CATEGORY II – CLASS I &amp; II</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              2. Event ({filteredEvents.length} available)
            </label>
            <select
              {...register("eventId")}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-navy-900 focus:border-royal-500 focus:outline-none focus:ring-2 focus:ring-royal-500/20"
            >
              <option value="">-- Select Competition Event --</option>
              {filteredEvents.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.serialNumber}. {evt.name} (
                  {evt.scoringType === "GROUP" ? "Group Item" : "Individual"} •{" "}
                  {evt.duration})
                </option>
              ))}
            </select>
            {errors.eventId && (
              <p className="mt-1 text-xs font-semibold text-red-600">
                {errors.eventId.message}
              </p>
            )}
          </div>
        </div>

        {/* 3. Participating School */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            3. Participating School ({eligibleSchools.length} eligible in{" "}
            {selectedCategory === "CATEGORY_I" ? "Category I" : "Category II"})
          </label>
          <select
            {...register("schoolId")}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-navy-900 focus:border-royal-500 focus:outline-none focus:ring-2 focus:ring-royal-500/20"
          >
            <option value="">-- Select Participating School --</option>
            {eligibleSchools.map((sch) => {
              const schoolEntriesInEvent = existingResults.filter(
                (r) =>
                  r.eventId === selectedEventId &&
                  r.schoolId === sch.id &&
                  r.id !== initialResultToEdit?.id
              );
              const existingPts = schoolEntriesInEvent.reduce(
                (acc, r) => acc + r.totalPoints,
                0
              );
              return (
                <option key={sch.id} value={sch.id}>
                  #{sch.serialNumber} – {sch.name}
                  {schoolEntriesInEvent.length > 0
                    ? ` (${schoolEntriesInEvent.length} entry: ${existingPts} pts)`
                    : ""}
                </option>
              );
            })}
          </select>
          {errors.schoolId && (
            <p className="mt-1 text-xs font-semibold text-red-600">
              {errors.schoolId.message}
            </p>
          )}
        </div>

        {/* Info Banner when adding another participant/entry for the same school & event */}
        {existingEntriesForSchoolAndEvent.length > 0 && !initialResultToEdit && (
          <div className="flex items-start gap-3 rounded-xl border border-royal-200 bg-royal-50 p-3.5 text-xs text-royal-900">
            <Info className="h-4 w-4 shrink-0 text-royal-600 mt-0.5" />
            <div>
              <p className="font-bold">
                Additional Entry for this School in this Event
              </p>
              <p className="mt-0.5">
                This school currently has{" "}
                <strong>{existingEntriesForSchoolAndEvent.length}</strong>{" "}
                recorded result(s) totaling{" "}
                <strong>{existingSchoolEventPoints} pts</strong> in this event.
                Saving will <strong>add +{scoringPreview.totalPoints} pts</strong>{" "}
                (New Event Total:{" "}
                <strong>
                  {existingSchoolEventPoints + scoringPreview.totalPoints} pts
                </strong>
                ).
              </p>
            </div>
          </div>
        )}

        {/* 4. Select Grade & 5. Position */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              4. Select Grade
            </label>
            <select
              {...register("grade")}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-navy-900 focus:border-royal-500 focus:outline-none focus:ring-2 focus:ring-royal-500/20"
            >
              {GRADE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.criteria})
                </option>
              ))}
            </select>
            {/* Quick-Select Grade Pills */}
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {GRADE_OPTIONS.map((opt) => {
                const isSelected = selectedGrade === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setValue("grade", opt.value, { shouldValidate: true })
                    }
                    className={`rounded-lg border px-2 py-1.5 text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-navy-900 text-white border-navy-900 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {opt.value === "No Grade" ? "No Grade" : `Grade ${opt.value}`}
                  </button>
                );
              })}
            </div>
            {errors.grade && (
              <p className="mt-1 text-xs font-semibold text-red-600">
                {errors.grade.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              5. Position (Placement)
            </label>
            <select
              value={
                selectedPosition === null ? "NONE" : String(selectedPosition)
              }
              onChange={(e) => {
                const val = e.target.value;
                const pos: Position =
                  val === "1" ? 1 : val === "2" ? 2 : val === "3" ? 3 : null;
                setValue("position", pos);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-navy-900 focus:border-royal-500 focus:outline-none focus:ring-2 focus:ring-royal-500/20"
            >
              <option value="1">1st Place</option>
              <option value="2">2nd Place</option>
              <option value="3">3rd Place</option>
              <option value="NONE">
                No Position – Grade Points Only
              </option>
            </select>
            {/* Quick-Select Position Pills */}
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {[
                { label: "1st", val: 1 as Position },
                { label: "2nd", val: 2 as Position },
                { label: "3rd", val: 3 as Position },
                { label: "Grade Only", val: null as Position },
              ].map((item) => {
                const isSelected = selectedPosition === item.val;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setValue("position", item.val)}
                    className={`rounded-lg border px-2 py-1.5 text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-royal-600 text-white border-royal-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tied placement warning */}
        {tiedPlacementResults.length > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold">Tied Placement Notice</p>
              <p className="mt-0.5">
                Position #{selectedPosition} is already held in this event. You
                may record a tied placement with confirmation; exact official
                points ({scoringPreview.totalPoints} pts) will be preserved.
              </p>
            </div>
          </div>
        )}

        {/* Read-only Auto-Calculated Fields (Grade, Grade Points, Place Points, Total Points) */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
            Locked Auto-Calculated Scoring Fields (Read-Only per Rule 8)
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-white p-3 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Selected Grade
              </span>
              <div className="mt-1">
                <GradeBadge grade={scoringPreview.grade} size="sm" />
              </div>
            </div>
            <div className="rounded-xl bg-white p-3 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 block">
                6. Grade Points
              </span>
              <span className="mt-1 block text-lg font-extrabold text-navy-900">
                {scoringPreview.gradePoints} pts
              </span>
            </div>
            <div className="rounded-xl bg-white p-3 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 block">
                7. Place Points
              </span>
              <span className="mt-1 block text-lg font-extrabold text-navy-900">
                {scoringPreview.placePoints} pts
              </span>
            </div>
            <div className="rounded-xl bg-royal-600 p-3 text-white shadow-xs">
              <span className="text-[11px] font-semibold text-royal-100 block">
                8. Total Points
              </span>
              <span className="mt-1 block text-xl font-extrabold">
                {scoringPreview.totalPoints} pts
              </span>
            </div>
          </div>
          <p className="mt-2.5 text-xs text-slate-600 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-royal-600 shrink-0" />
            <span>{scoringPreview.ruleExplanation}</span>
          </p>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-royal-700 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            {isSubmitting
              ? "Saving Result..."
              : initialResultToEdit
              ? "Update Official Result"
              : "Save Official Result"}
          </button>
        </div>
      </form>

      {/* Live Preview Sidebar Card */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-navy-900 to-navy-950 p-6 text-white shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-300">
            <Sparkles className="h-4 w-4" />
            Live Scoreboard Preview
          </div>
          <h3 className="mt-1 text-base font-extrabold">
            Pre-Save Verification Card
          </h3>

          <div className="mt-5 space-y-3.5 text-sm">
            <div className="flex justify-between border-b border-navy-800 pb-2.5">
              <span className="text-slate-400">Category:</span>
              <span className="font-bold text-white">
                {selectedCategory === "CATEGORY_I"
                  ? "Category I (LKG & UKG)"
                  : "Category II (Class I & II)"}
              </span>
            </div>

            <div className="flex justify-between border-b border-navy-800 pb-2.5">
              <span className="text-slate-400">Event:</span>
              <span className="font-bold text-white text-right">
                {selectedEvent ? selectedEvent.name : "Not selected"}
              </span>
            </div>

            <div className="flex justify-between border-b border-navy-800 pb-2.5">
              <span className="text-slate-400">Scoring Table:</span>
              <span className="font-bold text-amber-300">
                {activeScoringType === "GROUP"
                  ? "Group Item (Max 20 pts)"
                  : "Individual Event (Max 10 pts)"}
              </span>
            </div>

            <div className="flex justify-between border-b border-navy-800 pb-2.5">
              <span className="text-slate-400">School:</span>
              <span className="font-bold text-white text-right max-w-[190px] truncate">
                {selectedSchool ? selectedSchool.name : "Not selected"}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-navy-800 pb-2.5">
              <span className="text-slate-400">Selected Grade:</span>
              <GradeBadge grade={scoringPreview.grade} size="sm" />
            </div>

            <div className="flex justify-between border-b border-navy-800 pb-2.5">
              <span className="text-slate-400">Grade Criteria:</span>
              <span className="font-semibold text-slate-200 text-xs">
                {getGradeCriteriaLabel(scoringPreview.grade)}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-navy-800 pb-2.5">
              <span className="text-slate-400">Placement:</span>
              <PositionBadge position={selectedPosition} size="sm" />
            </div>

            <div className="rounded-xl bg-navy-800/90 border border-navy-700 p-4 mt-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-300 font-semibold">
                  Total Awarded Points
                </p>
                <p className="text-[11px] text-slate-400">
                  Grade ({scoringPreview.gradePoints}) + Place (
                  {scoringPreview.placePoints})
                </p>
              </div>
              <span className="text-3xl font-extrabold text-amber-300">
                {scoringPreview.totalPoints}
              </span>
            </div>
          </div>
        </div>

        {/* Official Criteria Quick Reference */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-xs space-y-2.5">
          <div className="flex items-center gap-1.5 font-bold text-navy-900 uppercase tracking-wider">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Official Scoring Matrix
          </div>
          <p className="text-slate-600">
            <strong>Individual:</strong> Grade A (5), B (3), C (1) + 1st (5),
            2nd (3), 3rd (1).
          </p>
          <p className="text-slate-600">
            <strong>Group Items:</strong> Grade A (10), B (6), C (2) + 1st (10),
            2nd (6), 3rd (2).
          </p>
          <p className="text-red-600 font-medium">
            <strong>No Grade (49% &amp; Below):</strong> 0 Total Points.
          </p>
        </div>
      </div>

      {/* Confirmation Dialog for Edit / Tie */}
      <ConfirmDialog
        isOpen={Boolean(pendingConfirmPayload)}
        title={confirmMessage.title}
        description={confirmMessage.description}
        confirmLabel="Confirm & Save Result"
        variant="warning"
        onConfirm={() => {
          if (pendingConfirmPayload) {
            executeSave(pendingConfirmPayload, initialResultToEdit?.id);
          }
        }}
        onCancel={() => setPendingConfirmPayload(null)}
      />
    </div>
  );
}
