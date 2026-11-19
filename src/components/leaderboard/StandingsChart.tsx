"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { LeaderboardEntry } from "@/types";

interface StandingsChartProps {
  entries: LeaderboardEntry[];
  title?: string;
  maxSchools?: number;
}

export function StandingsChart({
  entries,
  title = "Top Performing Schools – Points Comparison (Category I vs Category II)",
  maxSchools = 8,
}: StandingsChartProps) {
  const topEntries = entries.slice(0, maxSchools);

  const chartData = topEntries.map((entry) => {
    const shortName =
      entry.school.name.length > 22
        ? entry.school.name.slice(0, 20) + "…"
        : entry.school.name;
    return {
      name: shortName,
      fullName: entry.school.name,
      "Category I (LKG & UKG)": entry.school.category1Points,
      "Category II (Class I & II)": entry.school.category2Points,
      Total: entry.school.overallPoints,
    };
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-navy-900">{title}</h3>
          <p className="text-xs text-slate-500">
            Visual breakdown of Category I and Category II point contributions
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 16, left: -10, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#475569" }}
              angle={-15}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fontSize: 11, fill: "#475569" }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                borderColor: "#cbd5e1",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
            <Bar
              dataKey="Category I (LKG & UKG)"
              fill="#2563eb"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="Category II (Class I & II)"
              fill="#0f172a"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

