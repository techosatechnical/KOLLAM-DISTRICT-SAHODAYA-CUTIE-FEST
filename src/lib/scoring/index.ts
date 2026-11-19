import {
  Grade,
  Position,
  ScoringCalculationResult,
  ScoringType,
} from "@/types";

/**
 * Official Grading & Points Calculation Engine
 * Kollam District Sahodaya Cuties' Fest 2026–27
 *
 * Source of truth: Reference Image 1 (Categorizing Grades & Calculation of points)
 *
 * Grade Thresholds & Points:
 * - Grade A (70% and above): Individual = 5 pts | Group = 10 pts
 * - Grade B (60% to 69%):    Individual = 3 pts | Group = 6 pts
 * - Grade C (50% to 59%):    Individual = 1 pt  | Group = 2 pts
 * - No Grade (49% and below): 0 points (including 0 placement points)
 *
 * Place Points:
 * - Individual: 1st = 5 pts, 2nd = 3 pts, 3rd = 1 pt, No Position = 0 pts
 * - Group:      1st = 10 pts, 2nd = 6 pts, 3rd = 2 pts, No Position = 0 pts
 *
 * Total Points = Grade Points + Place Points
 * - Placed participants (1st, 2nd, 3rd) with a Grade receive Grade Points + Place Points.
 * - Unplaced participants (No Position) with Grade A, B, or C receive Grade Points (5/3/1 or 10/6/2).
 * - Participants with No Grade (49% and below) receive 0 total points.
 */

export function calculateGrade(percentage: number): Grade {
  if (typeof percentage !== "number" || Number.isNaN(percentage)) {
    throw new Error("Percentage must be a valid number");
  }
  if (percentage < 0 || percentage > 100) {
    throw new Error("Percentage must be between 0 and 100");
  }

  if (percentage >= 70) {
    return "A";
  }
  if (percentage >= 60) {
    return "B";
  }
  if (percentage >= 50) {
    return "C";
  }
  return "No Grade";
}

export function getCanonicalPercentageForGrade(grade: Grade): number {
  switch (grade) {
    case "A":
      return 75;
    case "B":
      return 65;
    case "C":
      return 55;
    case "No Grade":
      return 0;
  }
}

export function getGradeCriteriaLabel(grade: Grade): string {
  switch (grade) {
    case "A":
      return "70% and above";
    case "B":
      return "60% to 69%";
    case "C":
      return "50% to 59%";
    case "No Grade":
      return "49% and below";
  }
}

export function getBaseGradePoints(grade: Grade, scoringType: ScoringType): number {
  if (grade === "No Grade") {
    return 0;
  }

  if (scoringType === "GROUP") {
    switch (grade) {
      case "A":
        return 10;
      case "B":
        return 6;
      case "C":
        return 2;
    }
  } else {
    switch (grade) {
      case "A":
        return 5;
      case "B":
        return 3;
      case "C":
        return 1;
    }
  }
}

export function getBasePlacePoints(
  position: Position,
  grade: Grade,
  scoringType: ScoringType
): number {
  // Rule 7: A result with No Grade (49% or below) receives zero points, including placement points
  if (grade === "No Grade" || position === null) {
    return 0;
  }

  if (scoringType === "GROUP") {
    switch (position) {
      case 1:
        return 10;
      case 2:
        return 6;
      case 3:
        return 2;
      default:
        return 0;
    }
  } else {
    switch (position) {
      case 1:
        return 5;
      case 2:
        return 3;
      case 3:
        return 1;
      default:
        return 0;
    }
  }
}

export function calculateScore(params: {
  grade?: Grade;
  percentage?: number;
  position: Position;
  scoringType: ScoringType;
}): ScoringCalculationResult {
  const { position, scoringType } = params;

  const grade: Grade =
    params.grade !== undefined
      ? params.grade
      : typeof params.percentage === "number"
      ? calculateGrade(params.percentage)
      : "No Grade";

  const percentage =
    typeof params.percentage === "number"
      ? params.percentage
      : getCanonicalPercentageForGrade(grade);

  // Rule 7: 49% or below (No Grade) receives zero points, including placement points
  if (grade === "No Grade") {
    return {
      percentage,
      grade: "No Grade",
      position,
      scoringType,
      gradePoints: 0,
      placePoints: 0,
      totalPoints: 0,
      isAwardable: false,
      ruleExplanation:
        "No grade or points awarded for 49% and below (per official grading rule).",
    };
  }

  const gradePoints = getBaseGradePoints(grade, scoringType);
  const placePoints = getBasePlacePoints(position, grade, scoringType);
  const totalPoints = gradePoints + placePoints;

  const positionLabel =
    position === 1
      ? "1st Place"
      : position === 2
      ? "2nd Place"
      : position === 3
      ? "3rd Place"
      : "No Position (Grade Only)";

  return {
    percentage,
    grade,
    position,
    scoringType,
    gradePoints,
    placePoints,
    totalPoints,
    isAwardable: true,
    ruleExplanation: `${
      scoringType === "GROUP" ? "Group Item" : "Individual Event"
    }: Grade ${grade} (${gradePoints} pts) + ${positionLabel} (${placePoints} pts) = ${totalPoints} pts.`,
  };
}
