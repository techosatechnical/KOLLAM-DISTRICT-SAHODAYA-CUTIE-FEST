import { z } from "zod";

export const schoolSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "School name must be at least 3 characters")
    .max(150, "School name must not exceed 150 characters"),
  category1Participation: z.boolean(),
  category2Participation: z.boolean(),
  isActive: z.boolean(),
});

export type SchoolFormValues = z.infer<typeof schoolSchema>;

export const eventSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Event name must be at least 2 characters")
    .max(120, "Event name must not exceed 120 characters"),
  category: z.enum(["CATEGORY_I", "CATEGORY_II"]),
  eventType: z.enum(["OFF_STAGE", "ON_STAGE", "GROUP_ITEM"]),
  scoringType: z.enum(["INDIVIDUAL", "GROUP"]),
  duration: z
    .string()
    .trim()
    .min(2, "Duration is required (e.g., 3 minutes, 1 hour)"),
  status: z.enum(["PENDING", "COMPLETED", "PUBLISHED"]),
});

export type EventFormValues = z.infer<typeof eventSchema>;

export const resultEntrySchema = z.object({
  category: z.enum(["CATEGORY_I", "CATEGORY_II"]),
  eventId: z.string().min(1, "Please select an event"),
  schoolId: z.string().min(1, "Please select a participating school"),
  grade: z.enum(["A", "B", "C", "No Grade"], {
    required_error: "Please select a grade",
  }),
  position: z.union([z.literal(1), z.literal(2), z.literal(3), z.null()]),
  publicationStatus: z.enum(["DRAFT", "PUBLISHED", "UNAWARDED_PENDING"]),
  notes: z.string().max(300).optional(),
});

export type ResultEntryFormValues = z.infer<typeof resultEntrySchema>;
