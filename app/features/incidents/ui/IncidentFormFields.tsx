"use client";

import * as React from "react";
import type { IncidentType } from "@/types/incident";
import { parseTimeToHHmm } from "@/app/utils/time";

import ImagePicker from "@/app/components/ui/patterns/ImagePicker";

type Props = {
  time: string;
  setTime: (v: string) => void;

  type: IncidentType;
  setType: (v: IncidentType) => void;

  modtagetFra: string;
  setModtagetFra: (v: string) => void;

  haendelse: string;
  setHaendelse: (v: string) => void;

  loesning: string;
  setLoesning: (v: string) => void;

  politiInvolveret: boolean;
  setPolitiInvolveret: (v: boolean) => void;

  beredskabInvolveret: boolean;
  setBeredskabInvolveret: (v: boolean) => void;

  files: File[];
  setFiles: (v: File[]) => void;

  fileInputKey: number;
  setFileInputKey: (v: (k: number) => number) => void;
};

const TYPE_OPTIONS: IncidentType[] = [
  "Fejl",
  "Sikkerhed",
  "Kampinfo",
  "Førstehjælp",
  "Generelle info",
];

const LIMITS = {
  time: 5, // "HH:mm" max (we also allow 4 digits but we still cap at 5 with optional colon)
  modtagetFra: 60,
  haendelse: 800,
  loesning: 800,
} as const;

function clampText(value: string, max: number) {
  // Trim only the left side so the user can keep typing naturally
  const cleaned = value.replace(/\s+/g, " ").trimStart();
  return cleaned.length > max ? cleaned.slice(0, max) : cleaned;
}

function sanitizeTimeInput(raw: string) {
  // allow only digits and colon, cap length to something reasonable
  const cleaned = raw.replace(/[^\d:]/g, "").slice(0, 5);

  // prevent more than one colon
  const parts = cleaned.split(":");
  if (parts.length > 2)
    return parts[0] + ":" + parts.slice(1).join("").slice(0, 2);

  // if colon exists, cap minutes to 2 digits
  if (parts.length === 2) {
    const hh = parts[0].slice(0, 2);
    const mm = parts[1].slice(0, 2);
    return `${hh}:${mm}`;
  }

  // no colon: cap to 4 digits (1245)
  return cleaned.slice(0, 4);
}

export default function IncidentFormFields(props: Props) {
  const normalizedTime = React.useMemo(
    () => parseTimeToHHmm(props.time),
    [props.time],
  );

  const onTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setTime(sanitizeTimeInput(e.target.value));
  };

  const onTimeBlur = () => {
    const parsed = parseTimeToHHmm(props.time);
    if (parsed) props.setTime(parsed);
  };

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Tidspunkt */}
      <div>
        <label className="block text-sm font-medium text-slate-900">
          Tidspunkt
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={props.time}
          onChange={onTimeChange}
          onBlur={onTimeBlur}
          placeholder="12:45 eller 1245"
          // helps mobile keyboards + blocks some invalid typing patterns
          pattern="^(\d{4}|\d{1,2}:\d{2})$"
          maxLength={LIMITS.time}
          className={[
            "mt-2 w-full rounded-xl border px-3 py-2 text-sm shadow-sm outline-none",
            normalizedTime
              ? "border-slate-200 bg-white text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              : "border-rose-300 bg-rose-50 text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500",
          ].join(" ")}
        />
        {!normalizedTime && props.time.trim().length > 0 ? (
          <p className="mt-1 text-xs text-rose-700">
            Skriv tid som HH:mm (fx 12:45) eller 4 tal (fx 1245)
          </p>
        ) : null}
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-slate-900">Type</label>
        <select
          value={props.type}
          onChange={(e) => props.setType(e.target.value as IncidentType)}
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
          value={props.modtagetFra}
          maxLength={LIMITS.modtagetFra}
          onChange={(e) =>
            props.setModtagetFra(clampText(e.target.value, LIMITS.modtagetFra))
          }
          placeholder="Fx: Vagtleder, dommer, publikum…"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          required
        />
        <p className="mt-1 text-xs text-slate-500">
          {props.modtagetFra.length}/{LIMITS.modtagetFra}
        </p>
      </div>

      {/* Hændelse */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-slate-900">
          Hændelse
        </label>
        <textarea
          value={props.haendelse}
          maxLength={LIMITS.haendelse}
          onChange={(e) =>
            props.setHaendelse(clampText(e.target.value, LIMITS.haendelse))
          }
          rows={3}
          placeholder="Beskriv hændelsen…"
          className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          required
        />
        <p className="mt-1 text-xs text-slate-500">
          {props.haendelse.length}/{LIMITS.haendelse}
        </p>
      </div>

      {/* Løsning */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-slate-900">
          Løsning
        </label>
        <textarea
          value={props.loesning}
          maxLength={LIMITS.loesning}
          onChange={(e) =>
            props.setLoesning(clampText(e.target.value, LIMITS.loesning))
          }
          rows={3}
          placeholder="Hvad blev gjort / hvad er planen?"
          className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
        />
        <p className="mt-1 text-xs text-slate-500">
          {props.loesning.length}/{LIMITS.loesning}
        </p>
      </div>

      {/* Upload */}
      <div className="md:col-span-2">
        <ImagePicker
          files={props.files}
          setFiles={props.setFiles}
          fileInputKey={props.fileInputKey}
          setFileInputKey={props.setFileInputKey}
        />
      </div>

      {/* Checkboxes */}
      <div className="md:col-span-2 flex flex-col gap-2 sm:flex-row sm:gap-6">
        <label className="flex items-center gap-2 text-sm text-slate-900">
          <input
            type="checkbox"
            checked={props.politiInvolveret}
            onChange={(e) => props.setPolitiInvolveret(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Politi involveret
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-900">
          <input
            type="checkbox"
            checked={props.beredskabInvolveret}
            onChange={(e) => props.setBeredskabInvolveret(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Beredskab involveret
        </label>
      </div>
    </div>
  );
}
