"use client";

import * as React from "react";

type Preview = { name: string; size: number; url: string };

type Props = {
  files: File[];
  setFiles: (next: File[]) => void;

  fileInputKey: number;
  setFileInputKey: (fn: (k: number) => number) => void;

  label?: React.ReactNode;
  accept?: string;
  multiple?: boolean;

  gridClassName?: string;
};

export default function ImagePicker({
  files,
  setFiles,
  fileInputKey,
  setFileInputKey,
  label = "Upload (billeder)",
  accept = "image/*",
  multiple = true,
  gridClassName = "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4",
}: Props) {
  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    setFiles(list);
  };

  const [previews, setPreviews] = React.useState<Preview[]>([]);

  React.useEffect(() => {
    const next = files.map((f) => ({
      name: f.name,
      size: f.size,
      url: URL.createObjectURL(f),
    }));

    setPreviews(next);

    return () => {
      for (const p of next) URL.revokeObjectURL(p.url);
    };
  }, [files]);

  const removeFileAt = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);

    if (next.length === 0) setFileInputKey((k) => k + 1);
  };

  const clear = () => {
    setFiles([]);
    setFileInputKey((k) => k + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label className="block text-sm font-medium text-slate-900">
          {label}
        </label>

        {files.length > 0 ? (
          <button
            type="button"
            onClick={clear}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900"
          >
            Fjern valgte
          </button>
        ) : null}
      </div>

      <input
        key={fileInputKey}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFiles}
        className="mt-2 block w-full text-sm text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
      />

      {files.length > 0 ? (
        <>
          <p className="mt-2 text-xs text-slate-600">
            Valgt: {files.length} fil(er)
          </p>

          <div className={"mt-3 " + gridClassName}>
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

                <div className="truncate px-2 py-1 text-[11px] text-slate-600">
                  {p.name}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
