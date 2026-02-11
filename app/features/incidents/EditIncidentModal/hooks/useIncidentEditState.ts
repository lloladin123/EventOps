"use client";

import * as React from "react";
import type { Incident } from "@/types/incident";

export function useIncidentEditState(incident: Incident) {
  const [state, setState] = React.useState<Incident>({ ...incident });
  const [newFiles, setNewFiles] = React.useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = React.useState(0);

  React.useEffect(() => {
    setState({ ...incident });
    setNewFiles([]);
    setFileInputKey((k) => k + 1);
  }, [incident.id]);

  return {
    state,
    setState,
    newFiles,
    setNewFiles,
    fileInputKey,
    setFileInputKey,
  };
}
