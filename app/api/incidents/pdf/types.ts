export type IncidentFilePayload = {
  fileName?: string;
  downloadUrl?: string;
  storagePath?: string;
};

export type IncidentPayload = {
  id?: string;
  time?: string;
  type?: string;
  modtagetFra?: string;
  loggetAf?: string;
  haendelse?: string;
  loesning?: string;
  politiInvolveret?: boolean;
  beredskabInvolveret?: boolean;
  createdAt?: string;
  files?: IncidentFilePayload[];
};

export type Body = {
  eventId?: string;
  eventTitle?: string;
  incidents?: IncidentPayload[];
};
