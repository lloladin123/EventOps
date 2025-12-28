import type { Incident } from "@/types/incident";
import IncidentListItem from "./IncidentListItem";

type Props = {
  incidents: Incident[];
};

export default function IncidentList({ incidents }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Hændelser</h2>
        <span className="text-sm text-slate-600">{incidents.length} stk</span>
      </div>

      {incidents.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">
          Ingen hændelser endnu — tilføj den første 👇
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {incidents.map((i) => (
            <IncidentListItem key={i.id} incident={i} />
          ))}
        </ul>
      )}
    </section>
  );
}
