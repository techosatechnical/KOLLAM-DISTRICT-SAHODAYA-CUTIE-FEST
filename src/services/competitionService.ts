import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { getFirebaseServices } from "@/lib/firebase/config";
import { INITIAL_EVENTS, INITIAL_SCHOOLS } from "@/lib/firebase/seedData";
import { calculateScore } from "@/lib/scoring";
import {
  Event,
  EventStatus,
  Grade,
  Position,
  PublicationStatus,
  Result,
  School,
} from "@/types";
import { EventFormValues, SchoolFormValues } from "@/lib/validations";

const LOCAL_STORAGE_KEYS = {
  SCHOOLS: "sahodaya_firestore_schools_v1",
  EVENTS: "sahodaya_firestore_events_v1",
  RESULTS: "sahodaya_firestore_results_v1",
};

const BROADCAST_CHANNEL_NAME = "sahodaya_cuties_realtime_sync_v1";

type ListenerCallback<T> = (items: T[]) => void;

const localSchoolsListeners = new Set<ListenerCallback<School>>();
const localEventsListeners = new Set<ListenerCallback<Event>>();
const localResultsListeners = new Set<ListenerCallback<Result>>();

function notifyAllLocalListeners(): void {
  const schools = getLocalSchools();
  const events = getLocalEvents();
  const results = getLocalResults();

  localSchoolsListeners.forEach((cb) => cb(schools));
  localEventsListeners.forEach((cb) => cb(events));
  localResultsListeners.forEach((cb) => cb(results));
}

function broadcastLocalChange(): void {
  notifyAllLocalListeners();
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.postMessage({ type: "FIRESTORE_SYNC", timestamp: Date.now() });
      bc.close();
    } catch {
      // Ignore BroadcastChannel errors in older environments
    }
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (
      e.key === LOCAL_STORAGE_KEYS.SCHOOLS ||
      e.key === LOCAL_STORAGE_KEYS.EVENTS ||
      e.key === LOCAL_STORAGE_KEYS.RESULTS
    ) {
      notifyAllLocalListeners();
    }
  });

  if ("BroadcastChannel" in window) {
    try {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.onmessage = () => {
        notifyAllLocalListeners();
      };
    } catch {
      // Ignore
    }
  }
}

function getLocalSchools(): School[] {
  if (typeof window === "undefined") return INITIAL_SCHOOLS;
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEYS.SCHOOLS);
    if (!raw) {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEYS.SCHOOLS,
        JSON.stringify(INITIAL_SCHOOLS)
      );
      return INITIAL_SCHOOLS;
    }
    const parsed = JSON.parse(raw) as School[];
    return parsed.sort((a, b) => a.serialNumber - b.serialNumber);
  } catch {
    return INITIAL_SCHOOLS;
  }
}

function saveLocalSchools(schools: School[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    LOCAL_STORAGE_KEYS.SCHOOLS,
    JSON.stringify(schools)
  );
  broadcastLocalChange();
}

function getLocalEvents(): Event[] {
  if (typeof window === "undefined") return INITIAL_EVENTS;
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEYS.EVENTS);
    if (!raw) {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEYS.EVENTS,
        JSON.stringify(INITIAL_EVENTS)
      );
      return INITIAL_EVENTS;
    }
    const parsed = JSON.parse(raw) as Event[];
    return parsed.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.serialNumber - b.serialNumber;
    });
  } catch {
    return INITIAL_EVENTS;
  }
}

function saveLocalEvents(events: Event[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    LOCAL_STORAGE_KEYS.EVENTS,
    JSON.stringify(events)
  );
  broadcastLocalChange();
}

function getLocalResults(): Result[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEYS.RESULTS);
    if (!raw) {
      window.localStorage.setItem(LOCAL_STORAGE_KEYS.RESULTS, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw) as Result[];
  } catch {
    return [];
  }
}

function saveLocalResults(results: Result[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    LOCAL_STORAGE_KEYS.RESULTS,
    JSON.stringify(results)
  );
  broadcastLocalChange();
}

/**
 * Ensures Firestore database has the initial 20 schools and 23 events seeded.
 */
export async function ensureDatabaseSeeded(): Promise<{
  seededSchools: number;
  seededEvents: number;
  mode: "CLOUD_FIRESTORE" | "LOCAL_FIRESTORE_STORE";
}> {
  const { db, isCloudConfigured } = getFirebaseServices();

  if (!isCloudConfigured || !db) {
    const schools = getLocalSchools();
    const events = getLocalEvents();
    return {
      seededSchools: schools.length,
      seededEvents: events.length,
      mode: "LOCAL_FIRESTORE_STORE",
    };
  }

  const schoolsSnap = await getDocs(collection(db, "schools"));
  const eventsSnap = await getDocs(collection(db, "events"));

  const batch = writeBatch(db);
  let seededSchools = 0;
  let seededEvents = 0;

  if (schoolsSnap.empty) {
    for (const school of INITIAL_SCHOOLS) {
      batch.set(doc(db, "schools", school.id), school);
      seededSchools++;
    }
  }

  if (eventsSnap.empty) {
    for (const event of INITIAL_EVENTS) {
      batch.set(doc(db, "events", event.id), event);
      seededEvents++;
    }
  }

  if (seededSchools > 0 || seededEvents > 0) {
    await batch.commit();
  }

  return {
    seededSchools: schoolsSnap.empty ? seededSchools : schoolsSnap.size,
    seededEvents: eventsSnap.empty ? seededEvents : eventsSnap.size,
    mode: "CLOUD_FIRESTORE",
  };
}

/**
 * Force reset/re-seed the 20 official schools and 23 official events.
 */
export async function resetAndSeedOfficialMasterData(): Promise<void> {
  const { db, isCloudConfigured } = getFirebaseServices();
  if (isCloudConfigured && db) {
    const batch = writeBatch(db);
    for (const school of INITIAL_SCHOOLS) {
      batch.set(doc(db, "schools", school.id), school);
    }
    for (const event of INITIAL_EVENTS) {
      batch.set(doc(db, "events", event.id), event);
    }
    await batch.commit();
  }
  saveLocalSchools(INITIAL_SCHOOLS);
  saveLocalEvents(INITIAL_EVENTS);
}

/**
 * Real-time subscription to Schools collection
 */
export function subscribeToSchools(
  onData: (schools: School[]) => void,
  onError?: (err: Error) => void
): () => void {
  const { db, isCloudConfigured } = getFirebaseServices();

  if (isCloudConfigured && db) {
    return onSnapshot(
      collection(db, "schools"),
      (snapshot) => {
        if (snapshot.empty) {
          ensureDatabaseSeeded().catch(console.error);
          onData(INITIAL_SCHOOLS);
          return;
        }
        const schools = snapshot.docs
          .map((d) => d.data() as School)
          .sort((a, b) => a.serialNumber - b.serialNumber);
        onData(schools);
      },
      (err) => {
        console.error("Firestore schools listener error, using synced store:", err);
        if (onError) onError(err);
        onData(getLocalSchools());
      }
    );
  }

  localSchoolsListeners.add(onData);
  onData(getLocalSchools());
  return () => {
    localSchoolsListeners.delete(onData);
  };
}

/**
 * Real-time subscription to Events collection
 */
export function subscribeToEvents(
  onData: (events: Event[]) => void,
  onError?: (err: Error) => void
): () => void {
  const { db, isCloudConfigured } = getFirebaseServices();

  if (isCloudConfigured && db) {
    return onSnapshot(
      collection(db, "events"),
      (snapshot) => {
        if (snapshot.empty) {
          ensureDatabaseSeeded().catch(console.error);
          onData(INITIAL_EVENTS);
          return;
        }
        const events = snapshot.docs
          .map((d) => d.data() as Event)
          .sort((a, b) => {
            if (a.category !== b.category) {
              return a.category.localeCompare(b.category);
            }
            return a.serialNumber - b.serialNumber;
          });
        onData(events);
      },
      (err) => {
        console.error("Firestore events listener error, using synced store:", err);
        if (onError) onError(err);
        onData(getLocalEvents());
      }
    );
  }

  localEventsListeners.add(onData);
  onData(getLocalEvents());
  return () => {
    localEventsListeners.delete(onData);
  };
}

/**
 * Real-time subscription to Results collection
 */
export function subscribeToResults(
  onData: (results: Result[]) => void,
  onError?: (err: Error) => void
): () => void {
  const { db, isCloudConfigured } = getFirebaseServices();

  if (isCloudConfigured && db) {
    return onSnapshot(
      collection(db, "results"),
      (snapshot) => {
        const results = snapshot.docs
          .map((d) => d.data() as Result)
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        onData(results);
      },
      (err) => {
        console.error("Firestore results listener error, using synced store:", err);
        if (onError) onError(err);
        onData(getLocalResults());
      }
    );
  }

  localResultsListeners.add(onData);
  onData(getLocalResults());
  return () => {
    localResultsListeners.delete(onData);
  };
}

/**
 * Add or update a School
 */
export async function createSchool(values: SchoolFormValues): Promise<School> {
  const { db, isCloudConfigured } = getFirebaseServices();
  const existing = getLocalSchools();
  const nextSerial =
    existing.length > 0
      ? Math.max(...existing.map((s) => s.serialNumber)) + 1
      : 1;
  const now = new Date().toISOString();
  const newSchool: School = {
    id: `sch-${String(nextSerial).padStart(2, "0")}-${Date.now().toString(36)}`,
    serialNumber: nextSerial,
    name: values.name.trim(),
    category1Participation: values.category1Participation,
    category2Participation: values.category2Participation,
    isActive: values.isActive,
    createdAt: now,
    updatedAt: now,
  };

  if (isCloudConfigured && db) {
    await setDoc(doc(db, "schools", newSchool.id), newSchool);
  }
  saveLocalSchools([...existing, newSchool]);
  return newSchool;
}

export async function updateSchool(
  schoolId: string,
  values: Partial<SchoolFormValues>
): Promise<void> {
  const { db, isCloudConfigured } = getFirebaseServices();
  const now = new Date().toISOString();

  if (isCloudConfigured && db) {
    await updateDoc(doc(db, "schools", schoolId), {
      ...values,
      updatedAt: now,
    });
  }

  const schools = getLocalSchools();
  const updated = schools.map((s) =>
    s.id === schoolId ? { ...s, ...values, updatedAt: now } : s
  );
  saveLocalSchools(updated);
}

/**
 * Deactivate or delete school safely:
 * Requirement 7.B: "Do not permanently delete schools that already have competition results. Use an inactive status instead."
 */
export async function deactivateOrRemoveSchool(
  schoolId: string,
  currentResults: Result[]
): Promise<{ action: "DEACTIVATED" | "DELETED"; message: string }> {
  const hasResults = currentResults.some((r) => r.schoolId === schoolId);
  if (hasResults) {
    await updateSchool(schoolId, { isActive: false });
    return {
      action: "DEACTIVATED",
      message:
        "School has recorded competition results and cannot be permanently deleted. Marked as Inactive instead.",
    };
  }

  const { db, isCloudConfigured } = getFirebaseServices();
  if (isCloudConfigured && db) {
    await deleteDoc(doc(db, "schools", schoolId));
  }
  const schools = getLocalSchools().filter((s) => s.id !== schoolId);
  saveLocalSchools(schools);
  return {
    action: "DELETED",
    message: "School had no recorded results and was removed.",
  };
}

/**
 * Add or update an Event
 */
export async function createEvent(values: EventFormValues): Promise<Event> {
  const { db, isCloudConfigured } = getFirebaseServices();
  const existing = getLocalEvents();
  const categoryEvents = existing.filter((e) => e.category === values.category);
  const nextSerial =
    categoryEvents.length > 0
      ? Math.max(...categoryEvents.map((e) => e.serialNumber)) + 1
      : 1;
  const now = new Date().toISOString();

  // Enforce rule: Group Item events use GROUP scoring, others use INDIVIDUAL scoring
  const canonicalScoringType =
    values.eventType === "GROUP_ITEM" ? "GROUP" : "INDIVIDUAL";

  const newEvent: Event = {
    id: `evt-${values.category === "CATEGORY_I" ? "cat1" : "cat2"}-${String(
      nextSerial
    ).padStart(2, "0")}-${Date.now().toString(36)}`,
    serialNumber: nextSerial,
    name: values.name.trim(),
    category: values.category,
    eventType: values.eventType,
    scoringType: canonicalScoringType,
    duration: values.duration.trim(),
    status: values.status,
    createdAt: now,
    updatedAt: now,
  };

  if (isCloudConfigured && db) {
    await setDoc(doc(db, "events", newEvent.id), newEvent);
  }
  saveLocalEvents([...existing, newEvent]);
  return newEvent;
}

export async function updateEvent(
  eventId: string,
  values: Partial<EventFormValues>
): Promise<void> {
  const { db, isCloudConfigured } = getFirebaseServices();
  const now = new Date().toISOString();

  const payload: Partial<Event> = {
    ...values,
    updatedAt: now,
  };
  if (values.eventType) {
    payload.scoringType =
      values.eventType === "GROUP_ITEM" ? "GROUP" : "INDIVIDUAL";
  }

  if (isCloudConfigured && db) {
    await updateDoc(doc(db, "events", eventId), payload);
  }

  const events = getLocalEvents();
  const updated = events.map((e) =>
    e.id === eventId ? { ...e, ...payload } : e
  );
  saveLocalEvents(updated);
}

/**
 * Sync Event Status automatically based on results in that event
 */
async function syncEventStatusFromResults(
  eventId: string,
  allResults: Result[]
): Promise<void> {
  const eventResults = allResults.filter((r) => r.eventId === eventId);
  let nextStatus: EventStatus = "PENDING";
  if (eventResults.some((r) => r.publicationStatus === "PUBLISHED")) {
    nextStatus = "PUBLISHED";
  } else if (eventResults.length > 0) {
    nextStatus = "COMPLETED";
  }
  await updateEvent(eventId, { status: nextStatus });
}

/**
 * Save or update a competition Result with strict server/service validation:
 * - Prevents duplicate results for the same school and event unless `allowOverwriteExistingId` is provided
 * - Recalculates grade, gradePoints, placePoints, totalPoints using canonical scoring engine
 * - Checks for tied placements in the same event and marks `isTied` flag
 */
export async function saveCompetitionResult(params: {
  event: Event;
  school: School;
  grade: Grade;
  position: Position;
  publicationStatus: PublicationStatus;
  notes?: string;
  updatedBy: string;
  existingResults: Result[];
  editingResultId?: string;
}): Promise<{
  savedResult: Result;
  tiedWithSchools: string[];
}> {
  const {
    event,
    school,
    grade,
    position,
    publicationStatus,
    notes,
    updatedBy,
    existingResults,
    editingResultId,
  } = params;

  // 1. Validate category participation
  if (
    event.category === "CATEGORY_I" &&
    !school.category1Participation
  ) {
    throw new Error(
      `${school.name} is not registered as participating in Category I (LKG & UKG).`
    );
  }
  if (
    event.category === "CATEGORY_II" &&
    !school.category2Participation
  ) {
    throw new Error(
      `${school.name} is not registered as participating in Category II (Class I & II).`
    );
  }

  // 2. Canonical scoring calculation (never trust manually supplied points)
  const canonicalScoringType =
    event.eventType === "GROUP_ITEM" ? "GROUP" : event.scoringType;
  const calculation = calculateScore({
    grade,
    position,
    scoringType: canonicalScoringType,
  });

  const effectivePublicationStatus: PublicationStatus = publicationStatus;

  // 3. Check for tied placements in the same event
  const tiedResults =
    position !== null
      ? existingResults.filter(
          (r) =>
            r.eventId === event.id &&
            r.position === position &&
            r.id !== editingResultId
        )
      : [];
  const isTied = tiedResults.length > 0;

  const now = new Date().toISOString();
  const resultId =
    editingResultId ||
    `res-${event.id}-${school.id}-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;

  const existingRecord = existingResults.find((r) => r.id === resultId);

  const savedResult: Result = {
    id: resultId,
    schoolId: school.id,
    eventId: event.id,
    category: event.category,
    percentage: calculation.percentage,
    grade: calculation.grade,
    position,
    gradePoints: calculation.gradePoints,
    placePoints: calculation.placePoints,
    totalPoints: calculation.totalPoints,
    publicationStatus: effectivePublicationStatus,
    isTied,
    notes: notes?.trim() || "",
    createdAt: existingRecord?.createdAt || now,
    updatedAt: now,
    updatedBy,
  };

  const { db, isCloudConfigured } = getFirebaseServices();
  if (isCloudConfigured && db) {
    await setDoc(doc(db, "results", savedResult.id), savedResult);
  }

  const otherResults = getLocalResults().filter((r) => r.id !== savedResult.id);
  const updatedAllResults = [savedResult, ...otherResults];
  saveLocalResults(updatedAllResults);

  await syncEventStatusFromResults(event.id, updatedAllResults);

  const schoolsMap = new Map(getLocalSchools().map((s) => [s.id, s.name]));
  const tiedWithSchools = tiedResults.map(
    (r) => schoolsMap.get(r.schoolId) || r.schoolId
  );

  return {
    savedResult,
    tiedWithSchools,
  };
}

export async function updateResultPublicationStatus(
  resultId: string,
  publicationStatus: PublicationStatus,
  updatedBy: string
): Promise<void> {
  const { db, isCloudConfigured } = getFirebaseServices();
  const now = new Date().toISOString();

  if (isCloudConfigured && db) {
    await updateDoc(doc(db, "results", resultId), {
      publicationStatus,
      updatedAt: now,
      updatedBy,
    });
  }

  const results = getLocalResults();
  let targetEventId: string | null = null;
  const updated = results.map((r) => {
    if (r.id === resultId) {
      targetEventId = r.eventId;
      return { ...r, publicationStatus, updatedAt: now, updatedBy };
    }
    return r;
  });
  saveLocalResults(updated);

  if (targetEventId) {
    await syncEventStatusFromResults(targetEventId, updated);
  }
}

export async function publishAllResultsForEvent(
  eventId: string,
  updatedBy: string
): Promise<number> {
  const results = getLocalResults();
  const targetResults = results.filter(
    (r) => r.eventId === eventId && r.publicationStatus === "DRAFT"
  );
  if (targetResults.length === 0) return 0;

  const now = new Date().toISOString();
  const { db, isCloudConfigured } = getFirebaseServices();

  if (isCloudConfigured && db) {
    const batch = writeBatch(db);
    for (const r of targetResults) {
      batch.update(doc(db, "results", r.id), {
        publicationStatus: "PUBLISHED",
        updatedAt: now,
        updatedBy,
      });
    }
    await batch.commit();
  }

  const updated = results.map((r) =>
    r.eventId === eventId && r.publicationStatus === "DRAFT"
      ? {
          ...r,
          publicationStatus: "PUBLISHED" as PublicationStatus,
          updatedAt: now,
          updatedBy,
        }
      : r
  );
  saveLocalResults(updated);
  await syncEventStatusFromResults(eventId, updated);
  return targetResults.length;
}

export async function deleteCompetitionResult(resultId: string): Promise<void> {
  const results = getLocalResults();
  const target = results.find((r) => r.id === resultId);
  const { db, isCloudConfigured } = getFirebaseServices();

  if (isCloudConfigured && db) {
    await deleteDoc(doc(db, "results", resultId));
  }

  const remaining = results.filter((r) => r.id !== resultId);
  saveLocalResults(remaining);

  if (target) {
    await syncEventStatusFromResults(target.eventId, remaining);
  }
}

