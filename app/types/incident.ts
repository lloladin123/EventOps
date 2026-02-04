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

  modtagetFra: string; // reported by (typed)
  loggetAf: string; // logged by (current user)

  haendelse: string;
  loesning: string;
  politiInvolveret: boolean;
  beredskabInvolveret: boolean;
  files: UploadedIncidentFile[];
  createdAt: string;
};
