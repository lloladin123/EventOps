import type { Incident } from "@/types/incident";

export default function IncidentListItem({
  incident: i,
}: {
  incident: Incident;
}) {
  return (
    <li className="rounded-xl border border-slate-200 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-900">{i.time}</span>

        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-800">
          {i.type}
        </span>

        {i.politiInvolveret && (
          <span className="rounded-full bg-rose-50 px-2 py-1 text-xs text-rose-700 ring-1 ring-rose-200">
            Politi
          </span>
        )}

        {i.beredskabInvolveret && (
          <span className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-700 ring-1 ring-amber-200">
            Beredskab
          </span>
        )}
      </div>

      <p className="mt-2 text-sm text-slate-800">
        <span className="font-medium text-slate-900">Modtaget fra:</span>{" "}
        {i.modtagetFra}
      </p>
      <p className="mt-2 text-sm text-slate-800">
        <span className="font-medium text-slate-900">Logged af:</span>{" "}
        {i.loggetAf}
      </p>

      <p className="mt-1 text-sm text-slate-700">
        <span className="font-medium text-slate-900">Hændelse:</span>{" "}
        {i.haendelse}
      </p>

      {i.loesning && (
        <p className="mt-1 text-sm text-slate-700">
          <span className="font-medium text-slate-900">Løsning:</span>{" "}
          {i.loesning}
        </p>
      )}

      {i.files?.length > 0 && (
        <p className="mt-2 text-xs text-slate-600">
          Uploads: {i.files.length} billede(r)
        </p>
      )}
    </li>
  );
}
