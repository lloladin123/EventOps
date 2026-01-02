"use client";

import * as React from "react";
import type { Incident } from "@/types/incident";
import IncidentListItem from "./IncidentListItem";

type Props = {
  incidents: Incident[];
};

type ViewMode = "list" | "table";
const VIEW_KEY = "incidentViewMode";

function getInitialView(): ViewMode {
  // Next can render client components during SSR/SSG, so guard window.
  if (typeof window === "undefined") return "list";
  const raw = localStorage.getItem(VIEW_KEY);
  return raw === "table" || raw === "list" ? raw : "list";
}

export default function IncidentList({ incidents }: Props) {
  const [view, setView] = React.useState<ViewMode>(() => getInitialView());

  // Persist preference
  React.useEffect(() => {
    localStorage.setItem(VIEW_KEY, view);
  }, [view]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Hændelser</h2>
          <span className="text-sm text-slate-600">{incidents.length} stk</span>
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setView("list")}
            className={btnCls(view === "list")}
          >
            Liste
          </button>
          <button
            type="button"
            onClick={() => setView("table")}
            className={btnCls(view === "table")}
          >
            Tabel
          </button>
        </div>
      </div>

      {incidents.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">
          Ingen hændelser endnu — tilføj den første 👇
        </p>
      ) : view === "list" ? (
        <ul className="mt-4 space-y-3">
          {incidents.map((i) => (
            <IncidentListItem key={i.id} incident={i} />
          ))}
        </ul>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left">
                <th className="px-3 py-2 font-medium">Tid</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Hændelse</th>
                <th className="px-3 py-2 font-medium">Logget af</th>
                <th className="px-3 py-2 font-medium">Politi</th>
                <th className="px-3 py-2 font-medium">Beredskab</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((i) => (
                <tr key={i.id} className="border-b last:border-0">
                  <td className="px-3 py-2 text-slate-600">{i.time}</td>
                  <td className="px-3 py-2">{i.type}</td>
                  <td className="px-3 py-2 truncate max-w-xs">{i.haendelse}</td>
                  <td className="px-3 py-2 text-slate-600">{i.loggetAf}</td>
                  <td className="px-3 py-2 text-center">
                    {i.politiInvolveret ? "✔︎" : "—"}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {i.beredskabInvolveret ? "✔︎" : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function btnCls(active: boolean) {
  return [
    "rounded-lg px-3 py-1 text-sm font-medium",
    active
      ? "bg-slate-900 text-white"
      : "bg-slate-100 text-slate-600 hover:bg-slate-200",
  ].join(" ");
}
