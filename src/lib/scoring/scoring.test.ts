import { calculateGrade, calculateScore } from "./index";
import { buildLeaderboard, computeSchoolsWithPoints } from "./leaderboard";
import { INITIAL_EVENTS, INITIAL_SCHOOLS } from "../firebase/seedData";
import { Result } from "@/types";

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(
      `[FAIL] ${message}: expected ${String(expected)}, got ${String(actual)}`
    );
  }
  console.log(`[PASS] ${message}: ${String(actual)}`);
}

export function runScoringTests(): void {
  console.log(
    "=== Running Kollam District Sahodaya Cuties' Fest 2026-27 Scoring & Leaderboard Engine Tests ==="
  );

  // 0. Master Data Integrity Checks
  assertEqual(INITIAL_SCHOOLS.length, 20, "Total Participating Schools = 20");
  assertEqual(INITIAL_EVENTS.length, 23, "Total Competition Events = 23");
  assertEqual(
    INITIAL_EVENTS.filter((e) => e.category === "CATEGORY_I").length,
    7,
    "Category I Events = 7"
  );
  assertEqual(
    INITIAL_EVENTS.filter((e) => e.category === "CATEGORY_II").length,
    16,
    "Category II Events = 16"
  );

  // 1. Grade boundary tests
  assertEqual(calculateGrade(100), "A", "100% -> Grade A");
  assertEqual(calculateGrade(85), "A", "85% -> Grade A");
  assertEqual(calculateGrade(70), "A", "70% -> Grade A");
  assertEqual(calculateGrade(69), "B", "69% -> Grade B");
  assertEqual(calculateGrade(60), "B", "60% -> Grade B");
  assertEqual(calculateGrade(59), "C", "59% -> Grade C");
  assertEqual(calculateGrade(50), "C", "50% -> Grade C");
  assertEqual(calculateGrade(49), "No Grade", "49% -> No Grade");
  assertEqual(calculateGrade(0), "No Grade", "0% -> No Grade");

  // 2. Individual scoring tests
  assertEqual(
    calculateScore({ percentage: 75, position: 1, scoringType: "INDIVIDUAL" })
      .totalPoints,
    10,
    "Individual: A + 1st = 10"
  );
  assertEqual(
    calculateScore({ percentage: 70, position: 2, scoringType: "INDIVIDUAL" })
      .totalPoints,
    8,
    "Individual: A + 2nd = 8"
  );
  assertEqual(
    calculateScore({ percentage: 92, position: 3, scoringType: "INDIVIDUAL" })
      .totalPoints,
    6,
    "Individual: A + 3rd = 6"
  );
  assertEqual(
    calculateScore({ percentage: 65, position: 1, scoringType: "INDIVIDUAL" })
      .totalPoints,
    8,
    "Individual: B + 1st = 8"
  );
  assertEqual(
    calculateScore({ percentage: 60, position: 2, scoringType: "INDIVIDUAL" })
      .totalPoints,
    6,
    "Individual: B + 2nd = 6"
  );
  assertEqual(
    calculateScore({ percentage: 69, position: 3, scoringType: "INDIVIDUAL" })
      .totalPoints,
    4,
    "Individual: B + 3rd = 4"
  );
  assertEqual(
    calculateScore({ percentage: 55, position: 1, scoringType: "INDIVIDUAL" })
      .totalPoints,
    6,
    "Individual: C + 1st = 6"
  );
  assertEqual(
    calculateScore({ percentage: 50, position: 2, scoringType: "INDIVIDUAL" })
      .totalPoints,
    4,
    "Individual: C + 2nd = 4"
  );
  assertEqual(
    calculateScore({ percentage: 59, position: 3, scoringType: "INDIVIDUAL" })
      .totalPoints,
    2,
    "Individual: C + 3rd = 2"
  );
  assertEqual(
    calculateScore({ percentage: 49, position: 1, scoringType: "INDIVIDUAL" })
      .totalPoints,
    0,
    "Individual: 49% or below (even with 1st place) = 0"
  );
  assertEqual(
    calculateScore({
      grade: "A",
      position: null,
      scoringType: "INDIVIDUAL",
    }).totalPoints,
    5,
    "Individual: Grade A + No Position (Grade Only) = 5"
  );
  assertEqual(
    calculateScore({
      grade: "B",
      position: null,
      scoringType: "INDIVIDUAL",
    }).totalPoints,
    3,
    "Individual: Grade B + No Position (Grade Only) = 3"
  );
  assertEqual(
    calculateScore({
      grade: "C",
      position: null,
      scoringType: "INDIVIDUAL",
    }).totalPoints,
    1,
    "Individual: Grade C + No Position (Grade Only) = 1"
  );

  // 3. Group scoring tests
  assertEqual(
    calculateScore({ percentage: 80, position: 1, scoringType: "GROUP" })
      .totalPoints,
    20,
    "Group: A + 1st = 20"
  );
  assertEqual(
    calculateScore({ percentage: 70, position: 2, scoringType: "GROUP" })
      .totalPoints,
    16,
    "Group: A + 2nd = 16"
  );
  assertEqual(
    calculateScore({ percentage: 88, position: 3, scoringType: "GROUP" })
      .totalPoints,
    12,
    "Group: A + 3rd = 12"
  );
  assertEqual(
    calculateScore({ percentage: 64, position: 1, scoringType: "GROUP" })
      .totalPoints,
    16,
    "Group: B + 1st = 16"
  );
  assertEqual(
    calculateScore({ percentage: 60, position: 2, scoringType: "GROUP" })
      .totalPoints,
    12,
    "Group: B + 2nd = 12"
  );
  assertEqual(
    calculateScore({ percentage: 69, position: 3, scoringType: "GROUP" })
      .totalPoints,
    8,
    "Group: B + 3rd = 8"
  );
  assertEqual(
    calculateScore({ percentage: 58, position: 1, scoringType: "GROUP" })
      .totalPoints,
    12,
    "Group: C + 1st = 12"
  );
  assertEqual(
    calculateScore({ percentage: 50, position: 2, scoringType: "GROUP" })
      .totalPoints,
    8,
    "Group: C + 2nd = 8"
  );
  assertEqual(
    calculateScore({ percentage: 52, position: 3, scoringType: "GROUP" })
      .totalPoints,
    4,
    "Group: C + 3rd = 4"
  );
  assertEqual(
    calculateScore({ percentage: 49, position: 1, scoringType: "GROUP" })
      .totalPoints,
    0,
    "Group: 49% or below (even with 1st place) = 0"
  );
  assertEqual(
    calculateScore({
      grade: "A",
      position: null,
      scoringType: "GROUP",
    }).totalPoints,
    10,
    "Group: Grade A + No Position (Grade Only) = 10"
  );
  assertEqual(
    calculateScore({
      grade: "B",
      position: null,
      scoringType: "GROUP",
    }).totalPoints,
    6,
    "Group: Grade B + No Position (Grade Only) = 6"
  );
  assertEqual(
    calculateScore({
      grade: "C",
      position: null,
      scoringType: "GROUP",
    }).totalPoints,
    2,
    "Group: Grade C + No Position (Grade Only) = 2"
  );

  // 4. Leaderboard Derivation & Publication Filtering Tests
  const sampleResults: Result[] = [
    {
      id: "r1",
      schoolId: "sch-01",
      eventId: "evt-cat1-03", // Cinematic Dance (Individual)
      category: "CATEGORY_I",
      percentage: 85,
      grade: "A",
      position: 1,
      gradePoints: 5,
      placePoints: 5,
      totalPoints: 10,
      publicationStatus: "PUBLISHED",
      createdAt: "2026-11-19T00:00:00Z",
      updatedAt: "2026-11-19T00:00:00Z",
      updatedBy: "admin",
    },
    {
      id: "r2",
      schoolId: "sch-02",
      eventId: "evt-cat1-07", // Action Song (Group)
      category: "CATEGORY_I",
      percentage: 75,
      grade: "A",
      position: 1,
      gradePoints: 10,
      placePoints: 10,
      totalPoints: 20,
      publicationStatus: "PUBLISHED",
      createdAt: "2026-11-19T00:00:00Z",
      updatedAt: "2026-11-19T00:00:00Z",
      updatedBy: "admin",
    },
    {
      id: "r3-draft",
      schoolId: "sch-01",
      eventId: "evt-cat2-15", // Group Dance (Group) - DRAFT should not count on public leaderboard
      category: "CATEGORY_II",
      percentage: 90,
      grade: "A",
      position: 1,
      gradePoints: 10,
      placePoints: 10,
      totalPoints: 20,
      publicationStatus: "DRAFT",
      createdAt: "2026-11-19T00:00:00Z",
      updatedAt: "2026-11-19T00:00:00Z",
      updatedBy: "admin",
    },
  ];

  const publicSchools = computeSchoolsWithPoints(
    INITIAL_SCHOOLS,
    sampleResults,
    INITIAL_EVENTS,
    { publishedOnly: true }
  );
  const publicLeaderboardCat1 = buildLeaderboard(
    publicSchools,
    sampleResults,
    "CATEGORY_I",
    { publishedOnly: true }
  );

  assertEqual(
    publicLeaderboardCat1[0].school.id,
    "sch-02",
    "Leaderboard Cat I Rank 1 is sch-02 (20 pts from Group Item)"
  );
  assertEqual(
    publicLeaderboardCat1[0].points,
    20,
    "Leaderboard Cat I Rank 1 points = 20"
  );
  assertEqual(
    publicLeaderboardCat1[1].school.id,
    "sch-01",
    "Leaderboard Cat I Rank 2 is sch-01 (10 pts from Individual Event)"
  );
  assertEqual(
    publicSchools.find((s) => s.id === "sch-01")?.overallPoints,
    10,
    "Unpublished DRAFT result excluded from public points"
  );

  console.log("=== ALL 37 SCORING & LEADERBOARD TESTS PASSED ===");
}

runScoringTests();


