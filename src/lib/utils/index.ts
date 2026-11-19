import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CompetitionCategory, EventType, Position } from "@/types";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCategoryLabel(category: CompetitionCategory): string {
  return category === "CATEGORY_I"
    ? "CATEGORY I – LKG & UKG"
    : "CATEGORY II – CLASS I & II";
}

export function formatCategoryShort(category: CompetitionCategory): string {
  return category === "CATEGORY_I" ? "Category I (LKG & UKG)" : "Category II (Class I & II)";
}

export function formatEventTypeLabel(eventType: EventType): string {
  switch (eventType) {
    case "OFF_STAGE":
      return "Off Stage";
    case "ON_STAGE":
      return "On Stage";
    case "GROUP_ITEM":
      return "Group Item";
  }
}

export function formatPositionLabel(position: Position): string {
  switch (position) {
    case 1:
      return "1st Place";
    case 2:
      return "2nd Place";
    case 3:
      return "3rd Place";
    default:
      return "Unplaced";
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

