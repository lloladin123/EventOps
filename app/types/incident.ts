import { UploadedIncidentFile } from "../lib/uploadIncidentImages";

export type IncidentType =
  | "Fejl"
  | "Sikkerhed"
  | "Kampinfo"
  | "Førstehjælp"
  | "Generelle info";

export type Incident = {
  id: string;
  eventId: string;
  time: string;
  type: IncidentType;

  modtagetFra: string;
  loggetAf: string;

  haendelse: string;
  loesning: string;
  politiInvolveret: boolean;
  beredskabInvolveret: boolean;
  files: UploadedIncidentFile[];
  createdAt: string;

  // ✅ NEW: ownership / auditing (needed for 5-min edit for non-admins)
  createdByUid?: string | null;
  createdByRole?: string | null;
};
