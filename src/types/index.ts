export type CompetitionCategory = "CATEGORY_I" | "CATEGORY_II";

export type EventType = "OFF_STAGE" | "ON_STAGE" | "GROUP_ITEM";

export type ScoringType = "INDIVIDUAL" | "GROUP";

export type EventStatus = "PENDING" | "COMPLETED" | "PUBLISHED";

export type Grade = "A" | "B" | "C" | "No Grade";

export type Position = 1 | 2 | 3 | null;

export type PublicationStatus = "DRAFT" | "PUBLISHED" | "UNAWARDED_PENDING";

export interface School {
  id: string;
  serialNumber: number;
  name: string;
  category1Participation: boolean;
  category2Participation: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolWithPoints extends School {
  category1Points: number;
  category2Points: number;
  overallPoints: number;
  category1EventCount: number;
  category2EventCount: number;
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
}

export interface Event {
  id: string;
  serialNumber: number;
  name: string;
  category: CompetitionCategory;
  eventType: EventType;
  scoringType: ScoringType;
  duration: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Result {
  id: string;
  schoolId: string;
  eventId: string;
  category: CompetitionCategory;
  percentage: number;
  grade: Grade;
  position: Position;
  gradePoints: number;
  placePoints: number;
  totalPoints: number;
  publicationStatus: PublicationStatus;
  isTied?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface EnrichedResult extends Result {
  schoolName: string;
  eventName: string;
  eventType: EventType;
  scoringType: ScoringType;
  eventDuration: string;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "SCORER";
  lastLoginAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  isTiedRank: boolean;
  school: SchoolWithPoints;
  points: number;
  eventsScored: number;
  firstPlaces: number;
  secondPlaces: number;
  thirdPlaces: number;
}

export interface ScoringCalculationResult {
  percentage: number;
  grade: Grade;
  position: Position;
  scoringType: ScoringType;
  gradePoints: number;
  placePoints: number;
  totalPoints: number;
  isAwardable: boolean;
  ruleExplanation: string;
}

