import {
  CompetitionCategory,
  EnrichedResult,
  LeaderboardEntry,
  SchoolWithPoints,
} from "@/types";
import { formatEventTypeLabel, formatPositionLabel } from "@/lib/utils";

export interface PdfScoreboardSection {
  title: string;
  subtitle: string;
  mode: CompetitionCategory | "OVERALL";
  entries: LeaderboardEntry[];
}

/**
 * Escapes text for PDF literal strings (...) in WinAnsiEncoding.
 */
function escapePdfText(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[–—]/g, "-")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\x20-\x7E]/g, "");
}

/**
 * Builds a single A4 page PDF content stream (595.28 x 841.89 pt)
 * for a given leaderboard section.
 */
function buildLeaderboardPageStream(
  section: PdfScoreboardSection,
  pageNumber: number,
  totalPages: number,
  generatedAtText: string
): string {
  const ops: string[] = [];

  const drawRectFill = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    g: number,
    b: number
  ) => {
    ops.push(
      `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`,
      `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`
    );
  };

  const drawRectStroke = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    g: number,
    b: number,
    lineWidth = 0.6
  ) => {
    ops.push(
      `${lineWidth.toFixed(2)} w`,
      `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG`,
      `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`
    );
  };

  const drawLine = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    r: number,
    g: number,
    b: number,
    lineWidth = 0.5
  ) => {
    ops.push(
      `${lineWidth.toFixed(2)} w`,
      `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG`,
      `${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`
    );
  };

  const drawText = (
    text: string,
    x: number,
    y: number,
    size: number,
    bold: boolean,
    r: number,
    g: number,
    b: number
  ) => {
    const font = bold ? "/F2" : "/F1";
    ops.push(
      "BT",
      `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`,
      `${font} ${size.toFixed(1)} Tf`,
      `${x.toFixed(2)} ${y.toFixed(2)} Td`,
      `(${escapePdfText(text)}) Tj`,
      "ET"
    );
  };

  const marginX = 32;
  const contentWidth = 595.28 - marginX * 2; // 531.28

  // 1. Header Banner (Dark Navy #0f172a)
  drawRectFill(marginX, 744, contentWidth, 68, 0.059, 0.09, 0.165);
  // Gold top accent stripe (#f59e0b)
  drawRectFill(marginX, 808, contentWidth, 4, 0.961, 0.62, 0.043);

  drawText(
    "KOLLAM DISTRICT SAHODAYA",
    marginX + 16,
    792,
    9.5,
    true,
    0.984,
    0.749,
    0.141
  );
  drawText(
    "CUTIES' FEST 2026-27 - OFFICIAL LIVE SCOREBOARD",
    marginX + 16,
    774,
    15,
    true,
    1,
    1,
    1
  );
  drawText(
    "Inter-School Cultural Competition | Verified Official Standings Report",
    marginX + 16,
    756,
    9,
    false,
    0.749,
    0.859,
    0.996
  );

  // 2. Section Title Bar (Light Royal Blue #eff6ff, border #bfdbfe)
  drawRectFill(marginX, 708, contentWidth, 30, 0.937, 0.965, 1.0);
  drawRectStroke(marginX, 708, contentWidth, 30, 0.749, 0.859, 0.996, 0.8);

  drawText(section.title, marginX + 12, 724, 11, true, 0.059, 0.09, 0.165);
  drawText(
    `${section.subtitle}  |  Generated: ${generatedAtText}`,
    marginX + 12,
    713,
    8,
    false,
    0.278,
    0.333,
    0.412
  );

  // 3. Table Column Coordinates
  const isOverall = section.mode === "OVERALL";
  const tableTopY = 682;
  const headerHeight = 22;

  // Table Header Background (#172554)
  drawRectFill(
    marginX,
    tableTopY,
    contentWidth,
    headerHeight,
    0.09,
    0.145,
    0.329
  );

  const colRankX = marginX + 10;
  const colSchoolX = marginX + 62;
  const colCat1X = marginX + 318;
  const colCat2X = marginX + 372;
  const colMedalsX = isOverall ? marginX + 425 : marginX + 370;
  const colPointsX = marginX + 478;

  drawText("RANK", colRankX, tableTopY + 7, 8.5, true, 1, 1, 1);
  drawText("PARTICIPATING SCHOOL", colSchoolX, tableTopY + 7, 8.5, true, 1, 1, 1);

  if (isOverall) {
    drawText("CAT I", colCat1X, tableTopY + 7, 8.5, true, 0.749, 0.859, 0.996);
    drawText("CAT II", colCat2X, tableTopY + 7, 8.5, true, 0.749, 0.859, 0.996);
  }
  drawText("1st / 2nd / 3rd", colMedalsX, tableTopY + 7, 8.5, true, 1, 1, 1);
  drawText(
    isOverall ? "OVERALL" : "TOTAL PTS",
    colPointsX,
    tableTopY + 7,
    8.5,
    true,
    0.984,
    0.749,
    0.141
  );

  // 4. Table Rows (up to 22 rows per page)
  const rowHeight = 23;
  let currentY = tableTopY - rowHeight;

  const entries = section.entries.slice(0, 22);

  entries.forEach((entry, idx) => {
    const hasPoints = entry.points > 0;
    // Row background fill
    if (hasPoints && entry.rank === 1) {
      // Gold tint (#fef3c7)
      drawRectFill(marginX, currentY, contentWidth, rowHeight, 0.996, 0.953, 0.78);
    } else if (hasPoints && entry.rank === 2) {
      // Silver tint (#f1f5f9)
      drawRectFill(marginX, currentY, contentWidth, rowHeight, 0.945, 0.961, 0.976);
    } else if (hasPoints && entry.rank === 3) {
      // Bronze tint (#ffedd5)
      drawRectFill(marginX, currentY, contentWidth, rowHeight, 1.0, 0.929, 0.835);
    } else if (idx % 2 === 1) {
      // Zebra stripe (#f8fafc)
      drawRectFill(marginX, currentY, contentWidth, rowHeight, 0.973, 0.98, 0.988);
    } else {
      drawRectFill(marginX, currentY, contentWidth, rowHeight, 1, 1, 1);
    }

    // Bottom border for row
    drawLine(
      marginX,
      currentY,
      marginX + contentWidth,
      currentY,
      0.886,
      0.91,
      0.941,
      0.5
    );

    const textY = currentY + 7.5;

    // Rank Text
    const rankLabel =
      hasPoints && entry.rank === 1
        ? "1st"
        : hasPoints && entry.rank === 2
        ? "2nd"
        : hasPoints && entry.rank === 3
        ? "3rd"
        : `#${entry.rank}`;
    const tieSuffix = entry.isTiedRank ? " (TIE)" : "";

    drawText(
      `${rankLabel}${tieSuffix}`,
      colRankX,
      textY,
      9,
      hasPoints && entry.rank <= 3,
      0.059,
      0.09,
      0.165
    );

    // School Name (truncate safely if over 46 chars in Overall mode)
    const maxNameLen = isOverall ? 43 : 52;
    const displaySchoolName =
      entry.school.name.length > maxNameLen
        ? entry.school.name.slice(0, maxNameLen - 2) + ".."
        : entry.school.name;

    drawText(
      displaySchoolName,
      colSchoolX,
      textY,
      9,
      hasPoints && entry.rank <= 3,
      0.059,
      0.09,
      0.165
    );

    if (isOverall) {
      const c1Text = entry.school.category1Participation
        ? `${entry.school.category1Points} pts`
        : "N/A";
      const c2Text = entry.school.category2Participation
        ? `${entry.school.category2Points} pts`
        : "N/A";

      drawText(c1Text, colCat1X, textY, 8.5, false, 0.2, 0.255, 0.333);
      drawText(c2Text, colCat2X, textY, 8.5, false, 0.2, 0.255, 0.333);
    }

    // Placements (1st / 2nd / 3rd)
    drawText(
      `${entry.firstPlaces} / ${entry.secondPlaces} / ${entry.thirdPlaces}`,
      colMedalsX + 6,
      textY,
      8.5,
      false,
      0.278,
      0.333,
      0.412
    );

    // Total Points
    drawText(
      `${entry.points} pts`,
      colPointsX,
      textY,
      9.5,
      true,
      hasPoints ? 0.114 : 0.4,
      hasPoints ? 0.306 : 0.45,
      hasPoints ? 0.847 : 0.52
    );

    currentY -= rowHeight;
  });

  // Outer border around table
  const tableBottomY = currentY + rowHeight;
  drawRectStroke(
    marginX,
    tableBottomY,
    contentWidth,
    tableTopY + headerHeight - tableBottomY,
    0.796,
    0.835,
    0.882,
    0.8
  );

  // 5. Official Footer & Scoring Legend Box
  const footerBoxY = 92;
  drawRectFill(marginX, footerBoxY, contentWidth, 42, 0.973, 0.98, 0.988);
  drawRectStroke(marginX, footerBoxY, contentWidth, 42, 0.886, 0.91, 0.941, 0.6);

  drawText(
    "OFFICIAL SCORING CRITERIA (KOLLAM DISTRICT SAHODAYA CUTIES' FEST 2026-27):",
    marginX + 10,
    footerBoxY + 28,
    7.5,
    true,
    0.059,
    0.09,
    0.165
  );
  drawText(
    "• Individual Events: Grade A (70%+) = 5 pts, Grade B (60-69%) = 3 pts, Grade C (50-59%) = 1 pt  |  Places: 1st = 5 pts, 2nd = 3 pts, 3rd = 1 pt",
    marginX + 10,
    footerBoxY + 17,
    7.2,
    false,
    0.278,
    0.333,
    0.412
  );
  drawText(
    "• Group Items: Grade A (70%+) = 10 pts, Grade B (60-69%) = 6 pts, Grade C (50-59%) = 2 pts  |  Places: 1st = 10 pts, 2nd = 6 pts, 3rd = 2 pts",
    marginX + 10,
    footerBoxY + 7,
    7.2,
    false,
    0.278,
    0.333,
    0.412
  );

  // Signature lines
  drawLine(marginX + 10, 52, marginX + 180, 52, 0.58, 0.639, 0.722, 0.6);
  drawText(
    "Chief Scorer / Tabulation Committee",
    marginX + 10,
    41,
    8,
    true,
    0.278,
    0.333,
    0.412
  );

  drawLine(
    marginX + contentWidth - 190,
    52,
    marginX + contentWidth - 10,
    52,
    0.58,
    0.639,
    0.722,
    0.6
  );
  drawText(
    "General Convener, Kollam District Sahodaya",
    marginX + contentWidth - 190,
    41,
    8,
    true,
    0.278,
    0.333,
    0.412
  );

  drawText(
    `Page ${pageNumber} of ${totalPages}`,
    marginX + contentWidth / 2 - 22,
    24,
    8,
    false,
    0.4,
    0.45,
    0.52
  );

  return ops.join("\n");
}

/**
 * Generates a valid multi-page ISO-32000 PDF 1.4 binary Blob
 * containing the requested scoreboard sections.
 */
export function generateScoreboardPdfBlob(
  sections: PdfScoreboardSection[]
): Blob {
  const nowStr = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Object IDs:
  // 1: Catalog
  // 2: Pages
  // 3: Font Helvetica
  // 4: Font Helvetica-Bold
  // For each section i (0..N-1):
  //   PageObjId = 5 + i * 2
  //   ContentObjId = 6 + i * 2
  const objects: { id: number; body: string }[] = [];

  const pageObjIds: number[] = [];

  sections.forEach((sec, idx) => {
    const pageObjId = 5 + idx * 2;
    const contentObjId = 6 + idx * 2;
    pageObjIds.push(pageObjId);

    const streamContent = buildLeaderboardPageStream(
      sec,
      idx + 1,
      sections.length,
      nowStr
    );

    objects.push({
      id: pageObjId,
      body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjId} 0 R >>`,
    });

    objects.push({
      id: contentObjId,
      body: `<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream`,
    });
  });

  const kidsArray = pageObjIds.map((id) => `${id} 0 R`).join(" ");

  const allObjects: { id: number; body: string }[] = [
    {
      id: 1,
      body: "<< /Type /Catalog /Pages 2 0 R >>",
    },
    {
      id: 2,
      body: `<< /Type /Pages /Kids [${kidsArray}] /Count ${pageObjIds.length} >>`,
    },
    {
      id: 3,
      body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    },
    {
      id: 4,
      body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    },
    ...objects,
  ];

  allObjects.sort((a, b) => a.id - b.id);

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0]; // object 0 offset

  for (const obj of allObjects) {
    offsets.push(pdf.length);
    pdf += `${obj.id} 0 obj\n${obj.body}\nendobj\n`;
  }

  const xrefStart = pdf.length;
  const totalObjCount = allObjects.length + 1;

  pdf += `xref\n0 ${totalObjCount}\n`;
  pdf += "0000000000 65535 f \n";

  for (let i = 1; i < totalObjCount; i++) {
    const offsetStr = String(offsets[i]).padStart(10, "0");
    pdf += `${offsetStr} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${totalObjCount} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

/**
 * Triggers a direct browser file download of the generated PDF.
 */
export function downloadScoreboardPdf(
  sections: PdfScoreboardSection[],
  filename: string
): void {
  if (typeof window === "undefined") return;
  const blob = generateScoreboardPdfBlob(sections);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

export interface SchoolPdfReportInput {
  school: SchoolWithPoints;
  cat1Rank?: number;
  cat2Rank?: number;
  overallRank?: number;
  cat1Results: EnrichedResult[];
  cat2Results: EnrichedResult[];
}

interface FlattenedSchoolRow {
  kind: "SECTION_HEADER" | "RESULT_ROW" | "EMPTY_ROW" | "SUBTOTAL_ROW";
  title?: string;
  result?: EnrichedResult;
  subtotalLabel?: string;
  subtotalPoints?: number;
}

function buildSchoolReportPageStream(
  input: SchoolPdfReportInput,
  rowsForPage: FlattenedSchoolRow[],
  pageNumber: number,
  totalPages: number,
  generatedAtText: string
): string {
  const ops: string[] = [];
  const { school, cat1Rank, cat2Rank, overallRank } = input;

  const drawRectFill = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    g: number,
    b: number
  ) => {
    ops.push(
      `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`,
      `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`
    );
  };

  const drawRectStroke = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    g: number,
    b: number,
    lineWidth = 0.6
  ) => {
    ops.push(
      `${lineWidth.toFixed(2)} w`,
      `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG`,
      `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`
    );
  };

  const drawLine = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    r: number,
    g: number,
    b: number,
    lineWidth = 0.5
  ) => {
    ops.push(
      `${lineWidth.toFixed(2)} w`,
      `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG`,
      `${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`
    );
  };

  const drawText = (
    text: string,
    x: number,
    y: number,
    size: number,
    bold: boolean,
    r: number,
    g: number,
    b: number
  ) => {
    const font = bold ? "/F2" : "/F1";
    ops.push(
      "BT",
      `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`,
      `${font} ${size.toFixed(1)} Tf`,
      `${x.toFixed(2)} ${y.toFixed(2)} Td`,
      `(${escapePdfText(text)}) Tj`,
      "ET"
    );
  };

  const marginX = 32;
  const contentWidth = 595.28 - marginX * 2; // 531.28

  // 1. Header Banner (Dark Navy #0f172a)
  drawRectFill(marginX, 744, contentWidth, 68, 0.059, 0.09, 0.165);
  drawRectFill(marginX, 808, contentWidth, 4, 0.961, 0.62, 0.043);

  drawText(
    "KOLLAM DISTRICT SAHODAYA CUTIES' FEST 2026-27",
    marginX + 16,
    792,
    9.5,
    true,
    0.984,
    0.749,
    0.141
  );
  drawText(
    "OFFICIAL SCHOOL PERFORMANCE & POINTS REPORT",
    marginX + 16,
    774,
    14.5,
    true,
    1,
    1,
    1
  );
  drawText(
    `Generated: ${generatedAtText}  |  Powered by Techosa Robotics`,
    marginX + 16,
    756,
    8.5,
    false,
    0.749,
    0.859,
    0.996
  );

  // 2. School Summary Box
  drawRectFill(marginX, 656, contentWidth, 80, 0.945, 0.965, 1.0);
  drawRectStroke(marginX, 656, contentWidth, 80, 0.749, 0.859, 0.996, 0.8);

  drawText(
    `School #${school.serialNumber}: ${school.name}`,
    marginX + 14,
    716,
    12,
    true,
    0.059,
    0.09,
    0.165
  );

  const cat1StatusText = school.category1Participation
    ? `Participating (${school.category1Points} pts${cat1Rank ? `, Rank #${cat1Rank}` : ""})`
    : "Not Participating";
  const cat2StatusText = school.category2Participation
    ? `Participating (${school.category2Points} pts${cat2Rank ? `, Rank #${cat2Rank}` : ""})`
    : "Not Participating";

  drawText(
    `Category I (LKG & UKG): ${cat1StatusText}`,
    marginX + 14,
    696,
    9,
    false,
    0.15,
    0.2,
    0.3
  );
  drawText(
    `Category II (Class I & II): ${cat2StatusText}`,
    marginX + 14,
    680,
    9,
    false,
    0.15,
    0.2,
    0.3
  );
  drawText(
    `Placements Won: 1st Place (${school.goldCount})  |  2nd Place (${school.silverCount})  |  3rd Place (${school.bronzeCount})`,
    marginX + 14,
    664,
    8.5,
    true,
    0.2,
    0.25,
    0.35
  );

  // Overall Points Highlight Box on Right of Summary Card
  const overallBoxW = 148;
  const overallBoxX = marginX + contentWidth - overallBoxW - 12;
  drawRectFill(overallBoxX, 666, overallBoxW, 60, 0.059, 0.09, 0.165);
  drawText(
    "OVERALL TOTAL",
    overallBoxX + 14,
    710,
    8,
    true,
    0.984,
    0.749,
    0.141
  );
  drawText(
    `${school.overallPoints} pts`,
    overallBoxX + 14,
    690,
    16,
    true,
    1,
    1,
    1
  );
  drawText(
    overallRank ? `Overall Rank: #${overallRank}` : "Overall Standings",
    overallBoxX + 14,
    674,
    8.5,
    false,
    0.749,
    0.859,
    0.996
  );

  // 3. Event-Wise Results Table Header
  const tableTopY = 626;
  const headerHeight = 22;

  drawRectFill(
    marginX,
    tableTopY,
    contentWidth,
    headerHeight,
    0.09,
    0.145,
    0.329
  );

  const colEventX = marginX + 10;
  const colTypeX = marginX + 205;
  const colPosX = marginX + 295;
  const colGradeX = marginX + 375;
  const colBreakX = marginX + 432;
  const colTotalX = marginX + 482;

  drawText("COMPETITION EVENT", colEventX, tableTopY + 7, 8.5, true, 1, 1, 1);
  drawText("SECTION / TYPE", colTypeX, tableTopY + 7, 8.5, true, 1, 1, 1);
  drawText("POSITION", colPosX, tableTopY + 7, 8.5, true, 1, 1, 1);
  drawText("GRADE", colGradeX, tableTopY + 7, 8.5, true, 1, 1, 1);
  drawText("GRD+PLC", colBreakX, tableTopY + 7, 8.5, true, 0.749, 0.859, 0.996);
  drawText(
    "POINTS",
    colTotalX,
    tableTopY + 7,
    8.5,
    true,
    0.984,
    0.749,
    0.141
  );

  const rowHeight = 22;
  let currentY = tableTopY - rowHeight;

  rowsForPage.forEach((row, idx) => {
    if (row.kind === "SECTION_HEADER") {
      drawRectFill(marginX, currentY, contentWidth, rowHeight, 0.91, 0.94, 0.99);
      drawLine(
        marginX,
        currentY,
        marginX + contentWidth,
        currentY,
        0.75,
        0.82,
        0.92,
        0.6
      );
      drawText(
        row.title || "",
        colEventX,
        currentY + 7,
        9,
        true,
        0.09,
        0.145,
        0.329
      );
    } else if (row.kind === "EMPTY_ROW") {
      drawRectFill(marginX, currentY, contentWidth, rowHeight, 1, 1, 1);
      drawLine(
        marginX,
        currentY,
        marginX + contentWidth,
        currentY,
        0.886,
        0.91,
        0.941,
        0.5
      );
      drawText(
        row.title || "No published results in this category yet.",
        colEventX,
        currentY + 7,
        8.5,
        false,
        0.45,
        0.5,
        0.58
      );
    } else if (row.kind === "SUBTOTAL_ROW") {
      drawRectFill(
        marginX,
        currentY,
        contentWidth,
        rowHeight,
        0.973,
        0.98,
        0.988
      );
      drawLine(
        marginX,
        currentY,
        marginX + contentWidth,
        currentY,
        0.796,
        0.835,
        0.882,
        0.7
      );
      drawText(
        row.subtotalLabel || "Category Subtotal",
        colEventX,
        currentY + 7,
        9,
        true,
        0.059,
        0.09,
        0.165
      );
      drawText(
        `${row.subtotalPoints ?? 0} pts`,
        colTotalX,
        currentY + 7,
        9.5,
        true,
        0.114,
        0.306,
        0.847
      );
    } else if (row.kind === "RESULT_ROW" && row.result) {
      const r = row.result;
      if (r.position === 1 && r.totalPoints > 0) {
        drawRectFill(
          marginX,
          currentY,
          contentWidth,
          rowHeight,
          0.996,
          0.953,
          0.78
        );
      } else if (idx % 2 === 1) {
        drawRectFill(
          marginX,
          currentY,
          contentWidth,
          rowHeight,
          0.98,
          0.985,
          0.992
        );
      } else {
        drawRectFill(marginX, currentY, contentWidth, rowHeight, 1, 1, 1);
      }

      drawLine(
        marginX,
        currentY,
        marginX + contentWidth,
        currentY,
        0.886,
        0.91,
        0.941,
        0.5
      );

      const textY = currentY + 7;
      const evtName =
        r.eventName.length > 34
          ? r.eventName.slice(0, 32) + ".."
          : r.eventName;

      drawText(evtName, colEventX, textY, 8.8, true, 0.059, 0.09, 0.165);
      drawText(
        `${formatEventTypeLabel(r.eventType)} (${
          r.scoringType === "GROUP" ? "Grp" : "Ind"
        })`,
        colTypeX,
        textY,
        8.2,
        false,
        0.278,
        0.333,
        0.412
      );

      const posText =
        r.position === null
          ? "Grade Only"
          : `${formatPositionLabel(r.position)}${r.isTied ? " (TIE)" : ""}`;

      drawText(
        posText,
        colPosX,
        textY,
        8.5,
        r.position !== null && r.position <= 3,
        0.059,
        0.09,
        0.165
      );

      drawText(
        r.grade === "No Grade" ? "No Grade" : `Grade ${r.grade}`,
        colGradeX,
        textY,
        8.5,
        true,
        0.1,
        0.25,
        0.45
      );

      drawText(
        `${r.gradePoints} + ${r.placePoints}`,
        colBreakX,
        textY,
        8.2,
        false,
        0.35,
        0.4,
        0.48
      );

      drawText(
        `${r.totalPoints} pts`,
        colTotalX,
        textY,
        9.2,
        true,
        0.114,
        0.306,
        0.847
      );
    }

    currentY -= rowHeight;
  });

  const tableBottomY = currentY + rowHeight;
  drawRectStroke(
    marginX,
    tableBottomY,
    contentWidth,
    tableTopY + headerHeight - tableBottomY,
    0.796,
    0.835,
    0.882,
    0.8
  );

  // Footer & Signatures
  drawLine(marginX + 10, 52, marginX + 180, 52, 0.58, 0.639, 0.722, 0.6);
  drawText(
    "Chief Scorer / Tabulation Committee",
    marginX + 10,
    41,
    8,
    true,
    0.278,
    0.333,
    0.412
  );

  drawLine(
    marginX + contentWidth - 190,
    52,
    marginX + contentWidth - 10,
    52,
    0.58,
    0.639,
    0.722,
    0.6
  );
  drawText(
    "General Convener, Kollam District Sahodaya",
    marginX + contentWidth - 190,
    41,
    8,
    true,
    0.278,
    0.333,
    0.412
  );

  drawText(
    `Page ${pageNumber} of ${totalPages}`,
    marginX + contentWidth / 2 - 22,
    24,
    8,
    false,
    0.4,
    0.45,
    0.52
  );

  return ops.join("\n");
}

/**
 * Generates and downloads an official A4 PDF report for a single school
 * including its Category I, Category II, and Overall points and event-wise breakdown.
 */
export function downloadSchoolReportPdf(input: SchoolPdfReportInput): void {
  if (typeof window === "undefined") return;

  const nowStr = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const sortResults = (arr: EnrichedResult[]) =>
    [...arr].sort((a, b) => {
      const posA = a.position ?? 99;
      const posB = b.position ?? 99;
      if (posA !== posB) return posA - posB;
      return b.totalPoints - a.totalPoints;
    });

  const allRows: FlattenedSchoolRow[] = [];

  // Category I Section
  allRows.push({
    kind: "SECTION_HEADER",
    title: `CATEGORY I - LKG & UKG EVENT RESULTS (${input.cat1Results.length})`,
  });
  if (input.cat1Results.length === 0) {
    allRows.push({
      kind: "EMPTY_ROW",
      title: "No published Category I results recorded for this school.",
    });
  } else {
    for (const r of sortResults(input.cat1Results)) {
      allRows.push({ kind: "RESULT_ROW", result: r });
    }
  }
  allRows.push({
    kind: "SUBTOTAL_ROW",
    subtotalLabel: "Category I (LKG & UKG) Subtotal",
    subtotalPoints: input.school.category1Points,
  });

  // Category II Section
  allRows.push({
    kind: "SECTION_HEADER",
    title: `CATEGORY II - CLASS I & II EVENT RESULTS (${input.cat2Results.length})`,
  });
  if (input.cat2Results.length === 0) {
    allRows.push({
      kind: "EMPTY_ROW",
      title: "No published Category II results recorded for this school.",
    });
  } else {
    for (const r of sortResults(input.cat2Results)) {
      allRows.push({ kind: "RESULT_ROW", result: r });
    }
  }
  allRows.push({
    kind: "SUBTOTAL_ROW",
    subtotalLabel: "Category II (Class I & II) Subtotal",
    subtotalPoints: input.school.category2Points,
  });

  // Chunk into pages of up to 22 rows per page
  const maxRowsPerPage = 22;
  const pageChunks: FlattenedSchoolRow[][] = [];
  for (let i = 0; i < allRows.length; i += maxRowsPerPage) {
    pageChunks.push(allRows.slice(i, i + maxRowsPerPage));
  }
  if (pageChunks.length === 0) {
    pageChunks.push([]);
  }

  const objects: { id: number; body: string }[] = [];
  const pageObjIds: number[] = [];

  pageChunks.forEach((chunk, idx) => {
    const pageObjId = 5 + idx * 2;
    const contentObjId = 6 + idx * 2;
    pageObjIds.push(pageObjId);

    const streamContent = buildSchoolReportPageStream(
      input,
      chunk,
      idx + 1,
      pageChunks.length,
      nowStr
    );

    objects.push({
      id: pageObjId,
      body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjId} 0 R >>`,
    });

    objects.push({
      id: contentObjId,
      body: `<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream`,
    });
  });

  const kidsArray = pageObjIds.map((id) => `${id} 0 R`).join(" ");

  const allObjects: { id: number; body: string }[] = [
    { id: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    {
      id: 2,
      body: `<< /Type /Pages /Kids [${kidsArray}] /Count ${pageObjIds.length} >>`,
    },
    {
      id: 3,
      body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    },
    {
      id: 4,
      body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    },
    ...objects,
  ];

  allObjects.sort((a, b) => a.id - b.id);

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (const obj of allObjects) {
    offsets.push(pdf.length);
    pdf += `${obj.id} 0 obj\n${obj.body}\nendobj\n`;
  }

  const xrefStart = pdf.length;
  const totalObjCount = allObjects.length + 1;

  pdf += `xref\n0 ${totalObjCount}\n`;
  pdf += "0000000000 65535 f \n";

  for (let i = 1; i < totalObjCount; i++) {
    const offsetStr = String(offsets[i]).padStart(10, "0");
    pdf += `${offsetStr} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${totalObjCount} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const safeName = input.school.name
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const filename = `Kollam-Sahodaya-Cuties-Fest-2026-27-School-${input.school.serialNumber}-${safeName}.pdf`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

