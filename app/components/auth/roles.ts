import type { Role } from "@/types/rsvp";

export const ROLES: Role[] = ["Kontrollør", "Admin", "Logfører", "Crew"];

// quick + explicit, no magic
export const CREW_SUBROLES = ["Scanning", "Billet slag", "Boldbørn"] as const;

export type CrewSubRole = (typeof CREW_SUBROLES)[number];
