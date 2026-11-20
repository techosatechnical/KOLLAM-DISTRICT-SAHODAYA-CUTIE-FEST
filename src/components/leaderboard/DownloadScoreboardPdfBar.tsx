"use client";

import React from "react";
import { FileDown, Layers, Sparkles, Trophy } from "lucide-react";
import { LeaderboardEntry } from "@/types";
import { downloadScoreboardPdf } from "@/lib/utils/exportPdf";
import { useToast } from "@/components/common/ToastNotifications";

interface DownloadScoreboardPdfBarProps {
  category1Entries: LeaderboardEntry[];
  category2Entries: LeaderboardEntry[];
  overallEntries: LeaderboardEntry[];
}

export function DownloadScoreboardPdfBar({
  category1Entries,
  category2Entries,
  overallEntries,
}: DownloadScoreboardPdfBarProps) {
  const { showToast } = useToast();

  const handleDownloadCat1 = () => {
    downloadScoreboardPdf(
      [
        {
          title: "CATEGORY I - LKG & UKG LEADERBOARD",
          subtitle: "Official Category I Standings (7 Events)",
          mode: "CATEGORY_I",
          entries: category1Entries,
        },
      ],
      "Kollam-Sahodaya-Cuties-Fest-2026-27-Category-I-Scoreboard.pdf"
    );
    showToast({
      type: "success",
      title: "Category I Scoreboard PDF Downloaded",
      message: "Saved Category I (LKG & UKG) standings as a PDF document.",
    });
  };

  const handleDownloadCat2 = () => {
    downloadScoreboardPdf(
      [
        {
          title: "CATEGORY II - CLASS I & II LEADERBOARD",
          subtitle: "Official Category II Standings (16 Events)",
          mode: "CATEGORY_II",
          entries: category2Entries,
        },
      ],
      "Kollam-Sahodaya-Cuties-Fest-2026-27-Category-II-Scoreboard.pdf"
    );
    showToast({
      type: "success",
      title: "Category II Scoreboard PDF Downloaded",
      message: "Saved Category II (Class I & II) standings as a PDF document.",
    });
  };

  const handleDownloadOverall = () => {
    downloadScoreboardPdf(
      [
        {
          title: "OVERALL COMBINED CHAMPIONSHIP LEADERBOARD",
          subtitle:
            "Combined Standings across Category I & Category II (23 Events)",
          mode: "OVERALL",
          entries: overallEntries,
        },
      ],
      "Kollam-Sahodaya-Cuties-Fest-2026-27-Overall-Scoreboard.pdf"
    );
    showToast({
      type: "success",
      title: "Overall Scoreboard PDF Downloaded",
      message:
        "Saved Overall Combined Championship standings as a PDF document.",
    });
  };

  const handleDownloadCompleteBooklet = () => {
    downloadScoreboardPdf(
      [
        {
          title: "OVERALL COMBINED CHAMPIONSHIP LEADERBOARD",
          subtitle:
            "Combined Standings across Category I & Category II (23 Events)",
          mode: "OVERALL",
          entries: overallEntries,
        },
        {
          title: "CATEGORY I - LKG & UKG LEADERBOARD",
          subtitle: "Official Category I Standings (7 Events)",
          mode: "CATEGORY_I",
          entries: category1Entries,
        },
        {
          title: "CATEGORY II - CLASS I & II LEADERBOARD",
          subtitle: "Official Category II Standings (16 Events)",
          mode: "CATEGORY_II",
          entries: category2Entries,
        },
      ],
      "Kollam-Sahodaya-Cuties-Fest-2026-27-Complete-Scoreboard-Report.pdf"
    );
    showToast({
      type: "success",
      title: "Complete 3-Page Scoreboard PDF Downloaded",
      message:
        "Includes Overall Combined, Category I, and Category II leaderboards.",
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex items-start sm:items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-amber-300 shadow-xs">
          <FileDown className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-navy-900">
            Download Official Scoreboard as PDF
          </h3>
          <p className="text-xs text-slate-500">
            Export printable A4 PDF reports for Category I, Category II, Overall
            Standings, or the complete 3-page tournament report.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleDownloadCat1}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-navy-900 hover:bg-royal-50 hover:border-royal-200 hover:text-royal-700 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5 text-royal-600" />
          Category I PDF
        </button>

        <button
          type="button"
          onClick={handleDownloadCat2}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-navy-900 hover:bg-royal-50 hover:border-royal-200 hover:text-royal-700 transition-colors"
        >
          <Trophy className="h-3.5 w-3.5 text-royal-600" />
          Category II PDF
        </button>

        <button
          type="button"
          onClick={handleDownloadOverall}
          className="inline-flex items-center gap-1.5 rounded-xl border border-royal-200 bg-royal-50 px-3.5 py-2 text-xs font-bold text-royal-700 hover:bg-royal-100 transition-colors"
        >
          <Layers className="h-3.5 w-3.5 text-royal-600" />
          Overall PDF
        </button>

        <button
          type="button"
          onClick={handleDownloadCompleteBooklet}
          className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-royal-700 transition-colors"
        >
          <FileDown className="h-3.5 w-3.5 text-amber-300" />
          All Scoreboards (Full PDF)
        </button>
      </div>
    </div>
  );
}

