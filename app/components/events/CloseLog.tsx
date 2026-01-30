"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/app/components/auth/AuthProvider";
import { isAdmin } from "@/types/rsvp";
import { setEventOpen } from "@/app/lib/firestore/events";

type Props = {
  eventId: string;
  open: boolean; // ✅ source of truth comes from Firestore snapshot
  disabled?: boolean;
  onClosed?: () => void;
  onReopened?: () => void;
};

const WAIT_SECONDS = 5;

export default function CloseLog({
  eventId,
  open,
  disabled,
  onClosed,
  onReopened,
}: Props) {
  const router = useRouter();
  const { role, loading } = useAuth();

  const closed = !open;

  const [openCloseModal, setOpenCloseModal] = React.useState(false);
  const [openReopenModal, setOpenReopenModal] = React.useState(false);
  const [secondsLeft, setSecondsLeft] = React.useState(WAIT_SECONDS);
  const [saving, setSaving] = React.useState(false);

  // countdown for close-confirm modal
  React.useEffect(() => {
    if (!openCloseModal) return;

    setSecondsLeft(WAIT_SECONDS);

    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [openCloseModal]);

  const canConfirmClose = secondsLeft === 0;

  const closeLog = async () => {
    try {
      setSaving(true);
      await setEventOpen(eventId, false); // ✅ close == open:false
      onClosed?.();
      setOpenCloseModal(false);
      router.push("/events");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Kunne ikke lukke log");
    } finally {
      setSaving(false);
    }
  };

  const reopenLog = async () => {
    try {
      setSaving(true);
      await setEventOpen(eventId, true); // ✅ reopen == open:true
      onReopened?.();
      setOpenReopenModal(false);
      router.push("/events");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Kunne ikke genåbne log");
    } finally {
      setSaving(false);
    }
  };

  const showReopen = !loading && closed && isAdmin(role);

  return (
    <>
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {closed ? "Log lukket" : "Luk log"}
            </h3>
            <p className="text-sm text-slate-600">
              {closed
                ? "Loggen er lukket. Nye hændelser kan ikke tilføjes."
                : "Når du lukker, kan der ikke længere logges nye hændelser."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!closed && (
              <button
                type="button"
                disabled={disabled || saving}
                onClick={() => setOpenCloseModal(true)}
                className={[
                  "mt-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm sm:mt-0",
                  disabled || saving
                    ? "cursor-not-allowed bg-slate-200 text-slate-500"
                    : "bg-red-600 text-white hover:bg-red-700",
                ].join(" ")}
              >
                Luk log
              </button>
            )}

            {showReopen && (
              <button
                type="button"
                disabled={saving}
                onClick={() => setOpenReopenModal(true)}
                className={[
                  "mt-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 sm:mt-0",
                  saving ? "cursor-not-allowed opacity-60" : "",
                ].join(" ")}
              >
                Genåbn log
              </button>
            )}
          </div>
        </div>
      </div>

      {openCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" />

          <div className="relative w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-xl">
            <h4 className="text-lg font-semibold text-red-700">
              ⚠️ Er du HELT sikker?
            </h4>

            <p className="mt-2 text-sm text-slate-700">
              Dette lukker kampen og loggen.
              <br />
              <strong>Nye hændelser kan ikke tilføjes.</strong>
            </p>

            <p className="mt-3 text-sm text-slate-600">
              Bekræftelse aktiveres om{" "}
              <span className="font-semibold text-red-700">{secondsLeft}</span>{" "}
              sekunder…
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setOpenCloseModal(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Annuller
              </button>

              <button
                type="button"
                disabled={!canConfirmClose || saving}
                onClick={closeLog}
                className={[
                  "rounded-xl px-4 py-2 text-sm font-semibold transition",
                  canConfirmClose && !saving
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "cursor-not-allowed bg-red-200 text-red-400",
                ].join(" ")}
              >
                {saving
                  ? "Lukker…"
                  : canConfirmClose
                  ? "Ja, luk log"
                  : `Vent ${secondsLeft}s`}
              </button>
            </div>
          </div>
        </div>
      )}

      {openReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h4 className="text-lg font-semibold text-slate-900">
              Genåbn log?
            </h4>

            <p className="mt-2 text-sm text-slate-700">
              Når loggen genåbnes, kan der igen tilføjes nye hændelser.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setOpenReopenModal(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Annuller
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={reopenLog}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Genåbner…" : "Ja, genåbn"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
