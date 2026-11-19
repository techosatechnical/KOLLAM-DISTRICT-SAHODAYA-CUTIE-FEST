"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  Plus,
  Edit3,
  Clock,
  Users,
  User,
  X,
} from "lucide-react";
import { SearchInput } from "@/components/common/SearchInput";
import { FilterDropdown } from "@/components/common/FilterDropdown";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/common/ToastNotifications";
import { useCompetitionData } from "@/hooks/useCompetitionData";
import { EventFormValues, eventSchema } from "@/lib/validations";
import { createEvent, updateEvent } from "@/services/competitionService";
import { Event, EventStatus, EventType } from "@/types";
import { formatCategoryShort, formatEventTypeLabel } from "@/lib/utils";

export default function AdminEventsPage() {
  const { events, results, isLoading } = useCompetitionData();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      category: "CATEGORY_I",
      eventType: "ON_STAGE",
      scoringType: "INDIVIDUAL",
      duration: "3 minutes",
      status: "PENDING",
    },
  });

  const watchedEventType = watch("eventType");

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (categoryFilter !== "ALL" && e.category !== categoryFilter) {
        return false;
      }
      if (typeFilter !== "ALL" && e.eventType !== typeFilter) {
        return false;
      }
      if (
        searchQuery.trim() &&
        !e.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [events, categoryFilter, typeFilter, searchQuery]);

  const openAddModal = () => {
    setEditingEvent(null);
    reset({
      name: "",
      category: "CATEGORY_I",
      eventType: "ON_STAGE",
      scoringType: "INDIVIDUAL",
      duration: "3 minutes",
      status: "PENDING",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (evt: Event) => {
    setEditingEvent(evt);
    reset({
      name: evt.name,
      category: evt.category,
      eventType: evt.eventType,
      scoringType: evt.scoringType,
      duration: evt.duration,
      status: evt.status,
    });
    setIsModalOpen(true);
  };

  const onSaveEvent = async (values: EventFormValues) => {
    try {
      const normalized: EventFormValues = {
        ...values,
        scoringType:
          values.eventType === "GROUP_ITEM" ? "GROUP" : "INDIVIDUAL",
      };

      if (editingEvent) {
        await updateEvent(editingEvent.id, normalized);
        showToast({
          type: "success",
          title: "Event Updated",
          message: `${normalized.name} (${normalized.duration}) saved.`,
        });
      } else {
        await createEvent(normalized);
        showToast({
          type: "success",
          title: "Event Created",
          message: `${normalized.name} added to schedule.`,
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast({
        type: "error",
        title: "Failed to Save Event",
        message: err instanceof Error ? err.message : "Unexpected error.",
      });
    }
  };

  const handleQuickStatusChange = async (
    evt: Event,
    nextStatus: EventStatus
  ) => {
    try {
      await updateEvent(evt.id, { status: nextStatus });
      showToast({
        type: "info",
        title: "Event Status Updated",
        message: `${evt.name} status set to ${nextStatus}.`,
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Update Failed",
        message: err instanceof Error ? err.message : "Could not update status.",
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading 23 Competition Events..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-royal-600">
            Competition Events &amp; Time Limits
          </p>
          <h1 className="text-2xl font-extrabold text-navy-900">
            Manage Competition Events ({events.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            7 Category I (LKG &amp; UKG) events and 16 Category II (Class I
            &amp; II) events. Group Items automatically use Group scoring (max
            20 pts); all other events use Individual scoring (max 10 pts).
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-royal-700 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 text-amber-300" />
          Add Event
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col justify-end">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search event name..."
          />
        </div>
        <FilterDropdown
          label="Filter by Category"
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={[
            { label: "All Categories (23 Events)", value: "ALL" },
            { label: "Category I – LKG & UKG (7)", value: "CATEGORY_I" },
            { label: "Category II – Class I & II (16)", value: "CATEGORY_II" },
          ]}
        />
        <FilterDropdown
          label="Filter by Event Type"
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { label: "All Event Types", value: "ALL" },
            { label: "Off Stage", value: "OFF_STAGE" },
            { label: "On Stage", value: "ON_STAGE" },
            { label: "Group Item", value: "GROUP_ITEM" },
          ]}
        />
      </div>

      {/* Events Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Event Name</th>
                <th className="py-3.5 px-3">Event Type</th>
                <th className="py-3.5 px-3">Scoring Rule</th>
                <th className="py-3.5 px-3">Duration</th>
                <th className="py-3.5 px-3 text-center">Entries</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.map((evt) => {
                const entriesCount = results.filter(
                  (r) => r.eventId === evt.id
                ).length;

                return (
                  <tr key={evt.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 text-xs font-bold text-royal-700 whitespace-nowrap">
                      {formatCategoryShort(evt.category)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-navy-900">
                      {evt.serialNumber}. {evt.name}
                    </td>
                    <td className="py-3.5 px-3 text-xs font-semibold text-slate-700">
                      {formatEventTypeLabel(evt.eventType)}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-bold border ${
                          evt.scoringType === "GROUP"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {evt.scoringType === "GROUP" ? (
                          <Users className="h-3.5 w-3.5" />
                        ) : (
                          <User className="h-3.5 w-3.5" />
                        )}
                        {evt.scoringType}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-xs font-semibold text-slate-600 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {evt.duration}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-navy-900">
                      {entriesCount}
                    </td>
                    <td className="py-3.5 px-3">
                      <select
                        value={evt.status}
                        onChange={(e) =>
                          handleQuickStatusChange(
                            evt,
                            e.target.value as EventStatus
                          )
                        }
                        className={`rounded-lg border px-2.5 py-1 text-xs font-bold focus:outline-none ${
                          evt.status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : evt.status === "COMPLETED"
                            ? "bg-royal-50 text-royal-700 border-royal-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="PUBLISHED">PUBLISHED</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEditModal(evt)}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-navy-900"
                        title="Edit Event"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Calendar className="h-5 w-5 text-royal-600" />
                <h2 className="text-lg font-extrabold text-navy-900">
                  {editingEvent ? "Edit Competition Event" : "Add New Event"}
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

            <form onSubmit={handleSubmit(onSaveEvent)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Event Name
                </label>
                <input
                  type="text"
                  {...register("name")}
                  placeholder="e.g., Cinematic Dance"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-navy-900 focus:border-royal-500 focus:outline-none"
                />
                {errors.name && (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Category
                  </label>
                  <select
                    {...register("category")}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-navy-900"
                  >
                    <option value="CATEGORY_I">
                      Category I – LKG &amp; UKG
                    </option>
                    <option value="CATEGORY_II">
                      Category II – Class I &amp; II
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Event Section
                  </label>
                  <select
                    {...register("eventType")}
                    onChange={(e) => {
                      const val = e.target.value as EventType;
                      setValue("eventType", val);
                      setValue(
                        "scoringType",
                        val === "GROUP_ITEM" ? "GROUP" : "INDIVIDUAL"
                      );
                    }}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-navy-900"
                  >
                    <option value="OFF_STAGE">Off Stage</option>
                    <option value="ON_STAGE">On Stage</option>
                    <option value="GROUP_ITEM">Group Item</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Time Limit / Duration
                  </label>
                  <input
                    type="text"
                    {...register("duration")}
                    placeholder="e.g., 3 minutes, 1 hour"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-navy-900"
                  />
                  {errors.duration && (
                    <p className="mt-1 text-xs font-semibold text-red-600">
                      {errors.duration.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Result Status
                  </label>
                  <select
                    {...register("status")}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-navy-900"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs text-slate-600">
                <strong>Automatic Scoring Rule Assignment:</strong>{" "}
                {watchedEventType === "GROUP_ITEM"
                  ? "Group Item selected → Group Scoring Table (Grade: 10/6/2 + Place: 10/6/2, Max 20 pts)."
                  : "Individual Event selected → Individual Scoring Table (Grade: 5/3/1 + Place: 5/3/1, Max 10 pts)."}
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
                  {isSubmitting ? "Saving..." : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

