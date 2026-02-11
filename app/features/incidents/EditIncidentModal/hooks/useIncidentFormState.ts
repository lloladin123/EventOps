"use client";

import * as React from "react";
import type { IncidentType } from "@/types/incident";
import { nowHHmm } from "@/app/utils/time";

export function useIncidentFormState() {
  const [time, setTime] = React.useState<string>(nowHHmm());
  const [type, setType] = React.useState<IncidentType>("Fejl");
  const [modtagetFra, setModtagetFra] = React.useState("");
  const [haendelse, setHaendelse] = React.useState("");
  const [loesning, setLoesning] = React.useState("");
  const [politiInvolveret, setPolitiInvolveret] = React.useState(false);
  const [beredskabInvolveret, setBeredskabInvolveret] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = React.useState(0);

  const reset = React.useCallback(() => {
    setTime(nowHHmm());
    setType("Fejl");
    setModtagetFra("");
    setHaendelse("");
    setLoesning("");
    setPolitiInvolveret(false);
    setBeredskabInvolveret(false);
    setFiles([]);
    setFileInputKey((k) => k + 1);
  }, []);

  return {
    time,
    setTime,
    type,
    setType,
    modtagetFra,
    setModtagetFra,
    haendelse,
    setHaendelse,
    loesning,
    setLoesning,
    politiInvolveret,
    setPolitiInvolveret,
    beredskabInvolveret,
    setBeredskabInvolveret,
    files,
    setFiles,
    fileInputKey,
    setFileInputKey,
    reset,
  };
}
