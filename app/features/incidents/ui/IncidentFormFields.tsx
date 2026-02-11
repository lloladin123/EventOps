"use client";

import * as React from "react";
import type { IncidentType } from "@/types/incident";
import { parseTimeToHHmm } from "@/app/utils/time";

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

export default function IncidentFormFields(props: Props) {
  const normalizedTime = React.useMemo(
    () => parseTimeToHHmm(props.time),
    [props.time]
  );

  const onTimeBlur = () => {
    const parsed = parseTimeToHHmm(props.time);
    if (parsed) props.setTime(parsed);
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    props.setFiles(list);
  };

  // ✅ build previews + cleanup URLs
  const [previews, setPreviews] = React.useState<
    { name: string; size: number; url: string }[]
  >([]);

  React.useEffect(() => {
    const next = props.files.map((f) => ({
      name: f.name,
      size: f.size,
      url: URL.createObjectURL(f),
    }));

    setPreviews(next);

    return () => {
      for (const p of next) URL.revokeObjectURL(p.url);
    };
  }, [props.files]);

  const removeFileAt = (index: number) => {
    const next = props.files.filter((_, i) => i !== index);
    props.setFiles(next);

    // reset input if no files left (so same file can be re-added)
    if (next.length === 0) {
      props.setFileInputKey((k) => k + 1);
    }
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
          onChange={(e) => props.setTime(e.target.value)}
          onBlur={onTimeBlur}
          placeholder="12:45 eller 1245"
          className={[
            "mt-2 w-full rounded-xl border px-3 py-2 text-sm shadow-sm outline-none",
            normalizedTime
              ? "border-slate-200 bg-white text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              : "border-rose-300 bg-rose-50 text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500",
          ].join(" ")}
        />
        {!normalizedTime && props.time.trim().length > 0 && (
          <p className="mt-1 text-xs text-rose-700">
            Skriv tid som HH:mm (fx 12:45) eller 4 tal (fx 1245)
          </p>
        )}
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
          onChange={(e) => props.setModtagetFra(e.target.value)}
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
          value={props.haendelse}
          onChange={(e) => props.setHaendelse(e.target.value)}
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
          value={props.loesning}
          onChange={(e) => props.setLoesning(e.target.value)}
          rows={3}
          placeholder="Hvad blev gjort / hvad er planen?"
          className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
        />
      </div>

      {/* Upload */}
      <div className="md:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <label className="block text-sm font-medium text-slate-900">
            Upload (billeder)
          </label>

          {props.files.length > 0 && (
            <button
              type="button"
              onClick={() => {
                props.setFiles([]);
                props.setFileInputKey((k) => k + 1);
              }}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900"
            >
              Fjern valgte
            </button>
          )}
        </div>

        <input
          key={props.fileInputKey}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          className="mt-2 block w-full text-sm text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
        />

        {props.files.length > 0 && (
          <>
            <p className="mt-2 text-xs text-slate-600">
              Valgt: {props.files.length} fil(er)
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {previews.map((p, idx) => (
                <div
                  key={p.url}
                  className="relative overflow-hidden rounded-xl border bg-white"
                  title={p.name}
                >
                  <button
                    type="button"
                    onClick={() => removeFileAt(idx)}
                    className="absolute right-1 top-1 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white hover:bg-black"
                    aria-label="Fjern billede"
                  >
                    ✕
                  </button>

                  <img
                    src={p.url}
                    alt={p.name}
                    className="h-24 w-full object-cover"
                  />

                  <div className="px-2 py-1 text-[11px] text-slate-600 truncate">
                    {p.name}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
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
