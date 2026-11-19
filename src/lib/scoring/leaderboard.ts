import {
  CompetitionCategory,
  Event,
  EnrichedResult,
  LeaderboardEntry,
  Result,
  School,
  SchoolWithPoints,
} from "@/types";
import { calculateScore } from "./index";

/**
 * Derives school points and rankings purely from saved results.
 * Never trusts mutable totals stored on school documents.
 *
 * Also recalculates points using the canonical `calculateScore` engine
 * to guarantee integrity.
 */
export function computeSchoolsWithPoints(
  schools: School[],
  results: Result[],
  events: Event[],
  options: { publishedOnly: boolean } = { publishedOnly: true }
): SchoolWithPoints[] {
  const eventMap = new Map<string, Event>(events.map((e) => [e.id, e]));

  const eligibleResults = results.filter((r) => {
    if (options.publishedOnly && r.publicationStatus !== "PUBLISHED") {
      return false;
    }
    if (r.publicationStatus === "UNAWARDED_PENDING") {
      return false;
    }
    return true;
  });

  return schools.map((school) => {
    let category1Points = 0;
    let category2Points = 0;
    let category1EventCount = 0;
    let category2EventCount = 0;
    let goldCount = 0;
    let silverCount = 0;
    let bronzeCount = 0;

    for (const r of eligibleResults) {
      if (r.schoolId !== school.id) continue;
      const evt = eventMap.get(r.eventId);
      const scoringType = evt ? evt.scoringType : "INDIVIDUAL";

      const verified = calculateScore({
        grade: r.grade,
        percentage: r.percentage,
        position: r.position,
        scoringType,
      });

      if (r.category === "CATEGORY_I") {
        category1Points += verified.totalPoints;
        category1EventCount += 1;
      } else if (r.category === "CATEGORY_II") {
        category2Points += verified.totalPoints;
        category2EventCount += 1;
      }

      if (verified.totalPoints > 0) {
        if (r.position === 1) goldCount += 1;
        if (r.position === 2) silverCount += 1;
        if (r.position === 3) bronzeCount += 1;
      }
    }

    return {
      ...school,
      category1Points,
      category2Points,
      overallPoints: category1Points + category2Points,
      category1EventCount,
      category2EventCount,
      goldCount,
      silverCount,
      bronzeCount,
    };
  });
}

/**
 * Builds ranked leaderboard for Category I, Category II, or Overall.
 * Rule 11: Do not silently decide tie-breaking rules.
 * Schools with equal points share the same competition rank (standard competition ranking 1, 2, 2, 4 or dense ranking with explicit tie badge)
 * and are sorted alphabetically by school name within the tie.
 */
export function buildLeaderboard(
  schoolsWithPoints: SchoolWithPoints[],
  results: Result[],
  mode: CompetitionCategory | "OVERALL",
  options: { publishedOnly: boolean; includeInactive?: boolean } = {
    publishedOnly: true,
    includeInactive: false,
  }
): LeaderboardEntry[] {
  const filteredSchools = schoolsWithPoints.filter((school) => {
    if (!options.includeInactive && !school.isActive) return false;
    if (mode === "CATEGORY_I") return school.category1Participation;
    if (mode === "CATEGORY_II") return school.category2Participation;
    return school.category1Participation || school.category2Participation;
  });

  const eligibleResults = results.filter((r) => {
    if (options.publishedOnly && r.publicationStatus !== "PUBLISHED") {
      return false;
    }
    if (mode !== "OVERALL" && r.category !== mode) {
      return false;
    }
    return true;
  });

  const entriesWithoutRank = filteredSchools.map((school) => {
    const schoolResults = eligibleResults.filter(
      (r) => r.schoolId === school.id
    );
    const points =
      mode === "CATEGORY_I"
        ? school.category1Points
        : mode === "CATEGORY_II"
        ? school.category2Points
        : school.overallPoints;

    const firstPlaces = schoolResults.filter(
      (r) => r.position === 1 && r.totalPoints > 0
    ).length;
    const secondPlaces = schoolResults.filter(
      (r) => r.position === 2 && r.totalPoints > 0
    ).length;
    const thirdPlaces = schoolResults.filter(
      (r) => r.position === 3 && r.totalPoints > 0
    ).length;

    return {
      school,
      points,
      eventsScored: schoolResults.length,
      firstPlaces,
      secondPlaces,
      thirdPlaces,
    };
  });

  // Sort strictly by points descending, then alphabetically by name
  // (Per Rule 11: do not silently invent tie-breaking by medal counts; preserve exact points tie)
  entriesWithoutRank.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    return a.school.name.localeCompare(b.school.name);
  });

  // Assign ranks: schools with identical points > 0 share the same rank and get isTiedRank = true
  const pointCounts = new Map<number, number>();
  for (const e of entriesWithoutRank) {
    pointCounts.set(e.points, (pointCounts.get(e.points) ?? 0) + 1);
  }

  let currentRank = 1;
  return entriesWithoutRank.map((entry, idx) => {
    if (idx > 0 && entry.points < entriesWithoutRank[idx - 1].points) {
      currentRank = idx + 1;
    }
    const isTiedRank =
      entry.points > 0 && (pointCounts.get(entry.points) ?? 0) > 1;

    return {
      rank: currentRank,
      isTiedRank,
      ...entry,
    };
  });
}

export function enrichResults(
  results: Result[],
  schools: School[],
  events: Event[]
): EnrichedResult[] {
  const schoolMap = new Map(schools.map((s) => [s.id, s]));
  const eventMap = new Map(events.map((e) => [e.id, e]));

  return results.map((r) => {
    const school = schoolMap.get(r.schoolId);
    const event = eventMap.get(r.eventId);
    return {
      ...r,
      schoolName: school?.name ?? "Unknown School",
      eventName: event?.name ?? "Unknown Event",
      eventType: event?.eventType ?? "ON_STAGE",
      scoringType: event?.scoringType ?? "INDIVIDUAL",
      eventDuration: event?.duration ?? "-",
    };
  });
}

