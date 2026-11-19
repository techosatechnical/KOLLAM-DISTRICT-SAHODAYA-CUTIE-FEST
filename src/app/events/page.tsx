"use client";

import React, { useMemo, useState } from "react";
import { Calendar, Sparkles, Trophy, Layers } from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { EventCard } from "@/components/public/EventCard";
import { SearchInput } from "@/components/common/SearchInput";
import { FilterDropdown } from "@/components/common/FilterDropdown";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useCompetitionData } from "@/hooks/useCompetitionData";
import { CompetitionCategory, Event, EventType } from "@/types";

export default function EventsPage() {
  const { events, publishedResults, isLoading } = useCompetitionData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedEventType, setSelectedEventType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const resultsCountByEvent = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of publishedResults) {
      map.set(r.eventId, (map.get(r.eventId) || 0) + 1);
    }
    return map;
  }, [publishedResults]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (selectedCategory !== "ALL" && e.category !== selectedCategory) {
        return false;
      }
      if (selectedEventType !== "ALL" && e.eventType !== selectedEventType) {
        return false;
      }
      const pubCount = resultsCountByEvent.get(e.id) || 0;
      const effectiveStatus = pubCount > 0 ? "PUBLISHED" : e.status;
      if (selectedStatus !== "ALL" && effectiveStatus !== selectedStatus) {
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
  }, [
    events,
    selectedCategory,
    selectedEventType,
    selectedStatus,
    searchQuery,
    resultsCountByEvent,
  ]);

  const renderCategorySection = (
    category: CompetitionCategory,
    categoryTitle: string,
    categorySubtitle: string
  ) => {
    const catEvents = filteredEvents.filter((e) => e.category === category);
    if (catEvents.length === 0) return null;

    const sections: { type: EventType; label: string }[] = [
      { type: "OFF_STAGE", label: "OFF STAGE EVENTS" },
      { type: "ON_STAGE", label: "ON STAGE EVENTS" },
      { type: "GROUP_ITEM", label: "GROUP ITEMS" },
    ];

    return (
      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-royal-600">
              {category === "CATEGORY_I" ? (
                <Sparkles className="h-4 w-4" />
              ) : (
                <Trophy className="h-4 w-4" />
              )}
              Official Competition Category
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900">
              {categoryTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {categorySubtitle}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-xl bg-navy-900 px-3.5 py-1.5 text-xs font-bold text-white">
            <Layers className="h-3.5 w-3.5 text-amber-300" />
            {catEvents.length} Events
          </span>
        </div>

        <div className="space-y-8">
          {sections.map((sec) => {
            const items: Event[] = catEvents.filter(
              (e) => e.eventType === sec.type
            );
            if (items.length === 0) return null;

            return (
              <div key={sec.type} className="space-y-3.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-royal-600" />
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-navy-800">
                    {sec.label} ({items.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((evt) => (
                    <EventCard
                      key={evt.id}
                      event={evt}
                      publishedResultsCount={
                        resultsCountByEvent.get(evt.id) || 0
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="bg-navy-900 text-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-300">
            <Calendar className="h-4 w-4" />
            Official Competition Schedule &amp; Events
          </div>
          <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold">
            23 Competition Events
          </h1>
          <p className="mt-2 text-sm text-slate-300 max-w-2xl">
            Grouped by Category I (LKG &amp; UKG) and Category II (Class I &amp;
            II) across Off Stage, On Stage, and Group Items. Click any event to
            view its official time limit, scoring formula, and published
            placements.
          </p>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Filters */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex flex-col justify-end">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search event name..."
            />
          </div>
          <FilterDropdown
            label="Category"
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={[
              { label: "All Categories (23 Events)", value: "ALL" },
              { label: "Category I – LKG & UKG (7)", value: "CATEGORY_I" },
              { label: "Category II – Class I & II (16)", value: "CATEGORY_II" },
            ]}
          />
          <FilterDropdown
            label="Section / Type"
            value={selectedEventType}
            onChange={setSelectedEventType}
            options={[
              { label: "All Event Sections", value: "ALL" },
              { label: "Off Stage Events", value: "OFF_STAGE" },
              { label: "On Stage Events", value: "ON_STAGE" },
              { label: "Group Items", value: "GROUP_ITEM" },
            ]}
          />
          <FilterDropdown
            label="Result Status"
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={[
              { label: "All Statuses", value: "ALL" },
              { label: "Published Results", value: "PUBLISHED" },
              { label: "Pending Results", value: "PENDING" },
            ]}
          />
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-8">
            {renderCategorySection(
              "CATEGORY_I",
              "CATEGORY I – LKG & UKG",
              "2 Off Stage Events • 4 On Stage Events • 1 Group Item (7 Total)"
            )}
            {renderCategorySection(
              "CATEGORY_II",
              "CATEGORY II – CLASS I & II",
              "3 Off Stage Events • 11 On Stage Events • 2 Group Items (16 Total)"
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

