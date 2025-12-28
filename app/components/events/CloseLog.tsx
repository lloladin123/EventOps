"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { setEventClosed } from "@/utils/eventStatus";

type Props = {
  eventId: string;
  disabled?: boolean;
  onClosed?: () => void;
};

const WAIT_SECONDS = 5;

export default function CloseLog({ eventId, disabled, onClosed }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [secondsLeft, setSecondsLeft] = React.useState(WAIT_SECONDS);

  // start countdown when popup opens
  React.useEffect(() => {
    if (!open) return;

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
  }, [open]);

  const closeLog = () => {
    setEventClosed(eventId, true);
    onClosed?.();
    setOpen(false);

    router.push("/events");
  };

  const canConfirm = secondsLeft === 0;

  return (
    <>
      <div className="rounded-2xl border w-full border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Luk log</h3>
            <p className="text-sm text-slate-600">
              Når du lukker, kan der ikke længere logges nye hændelser.
            </p>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen(true)}
            className={[
              "mt-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm sm:mt-0",
              disabled
                ? "cursor-not-allowed bg-slate-200 text-slate-500"
                : "bg-red-600 text-white hover:bg-red-700",
            ].join(" ")}
          >
            Luk log
          </button>
        </div>
      </div>

      {/* 🔥 Super annoying popup */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* backdrop — clicking does NOTHING */}
          <div className="absolute inset-0 bg-black/50" />

          <div className="relative w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-xl">
            <h4 className="text-lg font-semibold text-red-700">
              ⚠️ Er du HELT sikker?
            </h4>

            <p className="mt-2 text-sm text-slate-700">
              Dette lukker kampen og loggen permanent.
              <br />
              <strong>Dette kan ikke fortrydes.</strong>
            </p>

            <p className="mt-3 text-sm text-slate-600">
              Bekræftelse aktiveres om{" "}
              <span className="font-semibold text-red-700">{secondsLeft}</span>{" "}
              sekunder…
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Annuller
              </button>

              <button
                type="button"
                disabled={!canConfirm}
                onClick={closeLog}
                className={[
                  "rounded-xl px-4 py-2 text-sm font-semibold transition",
                  canConfirm
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "cursor-not-allowed bg-red-200 text-red-400",
                ].join(" ")}
              >
                {canConfirm ? "Ja, luk log" : `Vent ${secondsLeft}s`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
