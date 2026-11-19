"use client";

import React, { useMemo, useState } from "react";
import { Building2 } from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { SchoolCard } from "@/components/public/SchoolCard";
import { SearchInput } from "@/components/common/SearchInput";
import { FilterDropdown } from "@/components/common/FilterDropdown";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useCompetitionData } from "@/hooks/useCompetitionData";

export default function SchoolsPage() {
  const {
    schoolsWithPointsPublic,
    overallLeaderboardPublic,
    isLoading,
  } = useCompetitionData();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("SERIAL");

  const rankBySchoolId = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of overallLeaderboardPublic) {
      map.set(entry.school.id, entry.rank);
    }
    return map;
  }, [overallLeaderboardPublic]);

  const filteredSchools = useMemo(() => {
    const active = schoolsWithPointsPublic.filter((s) => s.isActive);
    const filtered = active.filter((s) => {
      if (categoryFilter === "CAT_1" && !s.category1Participation) return false;
      if (categoryFilter === "CAT_2" && !s.category2Participation) return false;
      if (
        searchQuery.trim() &&
        !s.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ) {
        return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "POINTS") {
        if (b.overallPoints !== a.overallPoints) {
          return b.overallPoints - a.overallPoints;
        }
      }
      if (sortBy === "NAME") {
        return a.name.localeCompare(b.name);
      }
      return a.serialNumber - b.serialNumber;
    });
  }, [schoolsWithPointsPublic, categoryFilter, searchQuery, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="bg-navy-900 text-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-300">
            <Building2 className="h-4 w-4" />
            Official Roster of Participating Institutions
          </div>
          <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold">
            20 Participating Schools
          </h1>
          <p className="mt-2 text-sm text-slate-300 max-w-2xl">
            View Category I (LKG &amp; UKG) and Category II (Class I &amp; II)
            participation status and point totals for all 20 Kollam District
            Sahodaya member schools. Click any school to inspect its event-wise
            results.
          </p>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Search and Filter Controls */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex flex-col justify-end">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search school by name or location..."
            />
          </div>
          <FilterDropdown
            label="Category Participation"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { label: "All Participating Schools (20)", value: "ALL" },
              { label: "Participating in Category I (LKG & UKG)", value: "CAT_1" },
              {
                label: "Participating in Category II (Class I & II)",
                value: "CAT_2",
              },
            ]}
          />
          <FilterDropdown
            label="Sort Order"
            value={sortBy}
            onChange={setSortBy}
            options={[
              { label: "Official Serial Number (1 – 20)", value: "SERIAL" },
              { label: "Highest Overall Points", value: "POINTS" },
              { label: "Alphabetical (A – Z)", value: "NAME" },
            ]}
          />
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSchools.map((school) => (
              <SchoolCard
                key={school.id}
                school={school}
                overallRank={rankBySchoolId.get(school.id)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

