"use client";

import * as React from "react";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useUndoStack } from "@/features/users/hooks/useUndoStack";
import { ROLES, ROLE, CREW_SUBROLES, type Role } from "@/types/rsvp";

type Option = { value: string; label: string };

type Props = {
  eventId: string;
  uid: string;
  value?: string | null;
  disabled?: boolean;
  options?: Role[] | Option[];
};

function normalizeOptions(input?: string[] | Option[]): Option[] {
  const base = input ?? [];

  if (Array.isArray(base) && base.length > 0 && typeof base[0] === "object") {
    const opts = base as Option[];
    const hasEmpty = opts.some((o) => (o.value ?? "") === "");
    return hasEmpty ? opts : [{ value: "", label: "—" }, ...opts];
  }

  const list = base as string[];
  return [
    { value: "", label: "—" },
    ...list.map((r) => ({ value: r, label: r })),
  ];
}

export function RsvpRoleSelectCell({
  eventId,
  uid,
  value,
  disabled,
  options,
}: Props) {
  const { push } = useUndoStack();

  const [savingRole, setSavingRole] = React.useState(false);
  const [savingSub, setSavingSub] = React.useState(false);
  const [loadingInitial, setLoadingInitial] = React.useState(false);

  const roleOptions = React.useMemo(
    () => normalizeOptions(options ?? ROLES),
    [options],
  );
  const subRoleOptions = React.useMemo(
    () => normalizeOptions(CREW_SUBROLES),
    [],
  );

  const [selected, setSelected] = React.useState<string>(value ?? "");

  React.useEffect(() => {
    if (savingRole) return;
    const incoming = value ?? "";
    if (incoming !== "") setSelected(incoming);
  }, [value, savingRole]);

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if ((value ?? "") !== "") return;

      setLoadingInitial(true);
      try {
        const ref = doc(db, "events", eventId, "rsvps", uid);
        const snap = await getDoc(ref);
        if (cancelled) return;

        const data = snap.exists() ? snap.data() : null;
        const role = (data?.rsvpRole ?? "") as string;

        setSelected((curr) => (curr === "" ? role : curr));
      } catch (err) {
        console.error("Failed to load rsvpRole", err);
      } finally {
        if (!cancelled) setLoadingInitial(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [eventId, uid, value]);

  const isCrew = selected === ROLE.Crew;
  const [subSelected, setSubSelected] = React.useState<string>("");

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!isCrew || subSelected !== "") return;

      try {
        const ref = doc(db, "events", eventId, "rsvps", uid);
        const snap = await getDoc(ref);
        if (cancelled) return;

        const data = snap.exists() ? snap.data() : null;
        const sub = (data?.rsvpSubRole ?? "") as string;

        setSubSelected((curr) => (curr === "" ? sub : curr));
      } catch (err) {
        console.error("Failed to load rsvpSubRole", err);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [eventId, uid, isCrew, subSelected]);

  const onChangeRole = async (next: string) => {
    if (disabled) return;

    const prevSelected = selected;
    setSelected(next);
    if (next !== ROLE.Crew) setSubSelected("");
    setSavingRole(true);

    const ref = doc(db, "events", eventId, "rsvps", uid);

    try {
      const snap = await getDoc(ref);
      const prev = snap.exists() ? snap.data() : null;

      const prevRole = (prev?.rsvpRole ?? "") as string;
      const prevSub = (prev?.rsvpSubRole ?? "") as string;

      await updateDoc(ref, {
        rsvpRole: next || null,
        updatedAt: serverTimestamp(),
      });

      window.dispatchEvent(new Event("requests-changed"));
      window.dispatchEvent(new Event("events-changed"));

      push({
        label: "Rolle ændret",
        undo: async () => {
          await updateDoc(ref, {
            rsvpRole: prevRole || null,
            rsvpSubRole: prevSub || null,
            updatedAt: serverTimestamp(),
          });
          window.dispatchEvent(new Event("requests-changed"));
          window.dispatchEvent(new Event("events-changed"));
        },
        redo: async () => {
          await updateDoc(ref, {
            rsvpRole: next || null,
            updatedAt: serverTimestamp(),
          });
          window.dispatchEvent(new Event("requests-changed"));
          window.dispatchEvent(new Event("events-changed"));
        },
      });
    } catch (err) {
      console.error("Failed to update rsvpRole", err);
      setSelected(prevSelected);
    } finally {
      setSavingRole(false);
    }
  };

  const onChangeSubRole = async (next: string) => {
    if (disabled) return;

    const prevSelected = subSelected;
    setSubSelected(next);
    setSavingSub(true);

    const ref = doc(db, "events", eventId, "rsvps", uid);

    try {
      const snap = await getDoc(ref);
      const prev = snap.exists() ? snap.data() : null;
      const prevSub = (prev?.rsvpSubRole ?? "") as string;

      await updateDoc(ref, {
        rsvpSubRole: next || null,
        updatedAt: serverTimestamp(),
      });

      window.dispatchEvent(new Event("requests-changed"));
      window.dispatchEvent(new Event("events-changed"));

      push({
        label: "Crew subrolle ændret",
        undo: async () => {
          await updateDoc(ref, {
            rsvpSubRole: prevSub || null,
            updatedAt: serverTimestamp(),
          });
          window.dispatchEvent(new Event("requests-changed"));
          window.dispatchEvent(new Event("events-changed"));
        },
        redo: async () => {
          await updateDoc(ref, {
            rsvpSubRole: next || null,
            updatedAt: serverTimestamp(),
          });
          window.dispatchEvent(new Event("requests-changed"));
          window.dispatchEvent(new Event("events-changed"));
        },
      });
    } catch (err) {
      console.error("Failed to update rsvpSubRole", err);
      setSubSelected(prevSelected);
    } finally {
      setSavingSub(false);
    }
  };

  const busy = loadingInitial || savingRole || savingSub;
  const statusText = loadingInitial ? "Henter…" : busy ? "Gemmer…" : "";

  return (
    <div className="flex flex-col items-start gap-1">
      {/* Dropdown row */}
      <div className="flex items-center gap-2">
        <select
          className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-800 disabled:opacity-60"
          value={selected}
          disabled={disabled || busy}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onChange={(e) => onChangeRole(e.target.value)}
        >
          {roleOptions.map((o) => (
            <option key={o.value || "__empty_role"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-800 disabled:opacity-60"
          value={subSelected}
          disabled={disabled || busy || !isCrew}
          onChange={(e) => onChangeSubRole(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {subRoleOptions.map((o) => (
            <option key={o.value || "__empty_sub"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Status under dropdowns (no table push) */}
      <div className="h-4 text-xs text-slate-400 leading-none">
        {statusText}
      </div>
    </div>
  );
}
