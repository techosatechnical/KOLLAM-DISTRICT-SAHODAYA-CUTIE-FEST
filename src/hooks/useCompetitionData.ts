"use client";

import { useEffect, useMemo, useState } from "react";
import {
  subscribeToEvents,
  subscribeToResults,
  subscribeToSchools,
} from "@/services/competitionService";
import {
  buildLeaderboard,
  computeSchoolsWithPoints,
  enrichResults,
} from "@/lib/scoring/leaderboard";
import {
  EnrichedResult,
  Event,
  LeaderboardEntry,
  Result,
  School,
  SchoolWithPoints,
} from "@/types";
import { getFirebaseServices } from "@/lib/firebase/config";

export interface CompetitionDataState {
  schools: School[];
  events: Event[];
  results: Result[];
  publishedResults: Result[];
  enrichedResults: EnrichedResult[];
  enrichedPublishedResults: EnrichedResult[];
  schoolsWithPointsPublic: SchoolWithPoints[];
  schoolsWithPointsAdmin: SchoolWithPoints[];
  category1LeaderboardPublic: LeaderboardEntry[];
  category2LeaderboardPublic: LeaderboardEntry[];
  overallLeaderboardPublic: LeaderboardEntry[];
  category1LeaderboardAdmin: LeaderboardEntry[];
  category2LeaderboardAdmin: LeaderboardEntry[];
  overallLeaderboardAdmin: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  isCloudConfigured: boolean;
  projectId: string | null;
  lastUpdated: Date | null;
}

export function useCompetitionData(): CompetitionDataState {
  const [schools, setSchools] = useState<School[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [schoolsLoaded, setSchoolsLoaded] = useState(false);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [resultsLoaded, setResultsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [firebaseStatus, setFirebaseStatus] = useState<{
    isCloudConfigured: boolean;
    projectId: string | null;
  }>({ isCloudConfigured: false, projectId: null });

  useEffect(() => {
    const { isCloudConfigured, projectId } = getFirebaseServices();
    setFirebaseStatus({ isCloudConfigured, projectId });

    const unsubSchools = subscribeToSchools(
      (data) => {
        setSchools(data);
        setSchoolsLoaded(true);
        setLastUpdated(new Date());
      },
      (err) => setError(err.message)
    );

    const unsubEvents = subscribeToEvents(
      (data) => {
        setEvents(data);
        setEventsLoaded(true);
        setLastUpdated(new Date());
      },
      (err) => setError(err.message)
    );

    const unsubResults = subscribeToResults(
      (data) => {
        setResults(data);
        setResultsLoaded(true);
        setLastUpdated(new Date());
      },
      (err) => setError(err.message)
    );

    return () => {
      unsubSchools();
      unsubEvents();
      unsubResults();
    };
  }, []);

  const publishedResults = useMemo(
    () => results.filter((r) => r.publicationStatus === "PUBLISHED"),
    [results]
  );

  const enrichedResults = useMemo(
    () => enrichResults(results, schools, events),
    [results, schools, events]
  );

  const enrichedPublishedResults = useMemo(
    () => enrichResults(publishedResults, schools, events),
    [publishedResults, schools, events]
  );

  const schoolsWithPointsPublic = useMemo(
    () =>
      computeSchoolsWithPoints(schools, results, events, {
        publishedOnly: true,
      }),
    [schools, results, events]
  );

  const schoolsWithPointsAdmin = useMemo(
    () =>
      computeSchoolsWithPoints(schools, results, events, {
        publishedOnly: false,
      }),
    [schools, results, events]
  );

  const category1LeaderboardPublic = useMemo(
    () =>
      buildLeaderboard(schoolsWithPointsPublic, results, "CATEGORY_I", {
        publishedOnly: true,
      }),
    [schoolsWithPointsPublic, results]
  );

  const category2LeaderboardPublic = useMemo(
    () =>
      buildLeaderboard(schoolsWithPointsPublic, results, "CATEGORY_II", {
        publishedOnly: true,
      }),
    [schoolsWithPointsPublic, results]
  );

  const overallLeaderboardPublic = useMemo(
    () =>
      buildLeaderboard(schoolsWithPointsPublic, results, "OVERALL", {
        publishedOnly: true,
      }),
    [schoolsWithPointsPublic, results]
  );

  const category1LeaderboardAdmin = useMemo(
    () =>
      buildLeaderboard(schoolsWithPointsAdmin, results, "CATEGORY_I", {
        publishedOnly: false,
      }),
    [schoolsWithPointsAdmin, results]
  );

  const category2LeaderboardAdmin = useMemo(
    () =>
      buildLeaderboard(schoolsWithPointsAdmin, results, "CATEGORY_II", {
        publishedOnly: false,
      }),
    [schoolsWithPointsAdmin, results]
  );

  const overallLeaderboardAdmin = useMemo(
    () =>
      buildLeaderboard(schoolsWithPointsAdmin, results, "OVERALL", {
        publishedOnly: false,
      }),
    [schoolsWithPointsAdmin, results]
  );

  return {
    schools,
    events,
    results,
    publishedResults,
    enrichedResults,
    enrichedPublishedResults,
    schoolsWithPointsPublic,
    schoolsWithPointsAdmin,
    category1LeaderboardPublic,
    category2LeaderboardPublic,
    overallLeaderboardPublic,
    category1LeaderboardAdmin,
    category2LeaderboardAdmin,
    overallLeaderboardAdmin,
    isLoading: !(schoolsLoaded && eventsLoaded && resultsLoaded),
    error,
    isCloudConfigured: firebaseStatus.isCloudConfigured,
    projectId: firebaseStatus.projectId,
    lastUpdated,
  };
}

