"use client";

type Props = {
  disabled: boolean;
};

export default function IncidentSubmitButton({ disabled }: Props) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={[
        "rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition",
        disabled
          ? "cursor-not-allowed bg-slate-200 text-slate-500"
          : "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99]",
      ].join(" ")}
    >
      Tilføj hændelse
    </button>
  );
}
