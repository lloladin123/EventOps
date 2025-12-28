export type IncidentType =
  | "Fejl"
  | "Sikkerhed"
  | "Kampinfo"
  | "Førstehjælp"
  | "Generelle info";

export type Incident = {
  id: string;
  eventId: string; // ✅ add this
  time: string;
  type: IncidentType;
  modtagetFra: string;
  haendelse: string;
  loesning: string;
  politiInvolveret: boolean;
  beredskabInvolveret: boolean;
  files: File[];
  createdAt: string;
};
