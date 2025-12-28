"use client";

import * as React from "react";
import type { Incident, IncidentType } from "@/types/incident";

type Props = {
  eventId: string;
  onAddIncident: (incident: Incident) => void;
};

const TYPE_OPTIONS: IncidentType[] = [
  "Fejl",
  "Sikkerhed",
  "Kampinfo",
  "Førstehjælp",
  "Generelle info",
];

function makeId() {
  return `inc_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function nowHHmm() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function IncidentForm({ eventId, onAddIncident }: Props) {
  const [loggedBy, setLoggedBy] = React.useState<string>(""); // ✅ who is logging it

  React.useEffect(() => {
    // adjust if you store something else than "role"
    const role = localStorage.getItem("role") ?? "";
    setLoggedBy(role);
  }, []);

  const [type, setType] = React.useState<IncidentType>("Fejl");
  const [modtagetFra, setModtagetFra] = React.useState(""); // reporter (typed)
  const [haendelse, setHaendelse] = React.useState("");
  const [loesning, setLoesning] = React.useState("");
  const [politiInvolveret, setPolitiInvolveret] = React.useState(false);
  const [beredskabInvolveret, setBeredskabInvolveret] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = React.useState(0);

  const canSubmit =
    loggedBy.trim().length > 0 && // ✅ must be logged in
    modtagetFra.trim().length > 0 &&
    haendelse.trim().length > 0;

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    setFiles(list);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const incident: Incident = {
      id: makeId(),
      eventId,
      time: nowHHmm(),
      type,
      modtagetFra: modtagetFra.trim(),
      loggetAf: loggedBy.trim(), // ✅ NEW
      haendelse: haendelse.trim(),
      loesning: loesning.trim(),
      politiInvolveret,
      beredskabInvolveret,
      files,
      createdAt: new Date().toISOString(),
    };

    onAddIncident(incident);

    // reset form (keep loggedBy)
    setType("Fejl");
    setModtagetFra("");
    setHaendelse("");
    setLoesning("");
    setPolitiInvolveret(false);
    setBeredskabInvolveret(false);
    setFiles([]);
    setFileInputKey((k) => k + 1);
  };

  return (
    <form
      onSubmit={submit}
      className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Tilføj hændelse
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Logget af:{" "}
            <span className="font-medium text-slate-900">
              {loggedBy || "Ikke logget ind"}
            </span>
          </p>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className={[
            "rounded-xl px-4 py-2 text-sm font-semibold shadow-sm",
            canSubmit
              ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99]"
              : "cursor-not-allowed bg-slate-200 text-slate-500",
          ].join(" ")}
        >
          Tilføj hændelse
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-slate-900">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as IncidentType)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Modtaget fra */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-900">
            Modtaget fra
          </label>
          <input
            type="text"
            value={modtagetFra}
            onChange={(e) => setModtagetFra(e.target.value)}
            placeholder="Fx: Vagtleder, dommer, publikum…"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            required
          />
        </div>

        {/* Hændelse */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-900">
            Hændelse
          </label>
          <textarea
            value={haendelse}
            onChange={(e) => setHaendelse(e.target.value)}
            rows={3}
            placeholder="Beskriv hændelsen…"
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            required
          />
        </div>

        {/* Løsning */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-900">
            Løsning
          </label>
          <textarea
            value={loesning}
            onChange={(e) => setLoesning(e.target.value)}
            rows={3}
            placeholder="Hvad blev gjort / hvad er planen?"
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Upload */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-900">
            Upload (billeder)
          </label>
          <input
            key={fileInputKey}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="mt-2 block w-full text-sm text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
          />
          {files.length > 0 && (
            <p className="mt-2 text-xs text-slate-600">
              Valgt: {files.length} fil(er)
            </p>
          )}
        </div>

        {/* Checkboxes */}
        <div className="md:col-span-2 flex flex-col gap-2 sm:flex-row sm:gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-900">
            <input
              type="checkbox"
              checked={politiInvolveret}
              onChange={(e) => setPolitiInvolveret(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Politi involveret
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-900">
            <input
              type="checkbox"
              checked={beredskabInvolveret}
              onChange={(e) => setBeredskabInvolveret(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Beredskab involveret
          </label>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className={[
            "rounded-xl px-6 py-3 text-sm font-semibold shadow-sm transition",
            canSubmit
              ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99]"
              : "cursor-not-allowed bg-slate-200 text-slate-500",
          ].join(" ")}
        >
          Tilføj hændelse
        </button>
      </div>
    </form>
  );
}
