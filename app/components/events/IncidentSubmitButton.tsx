"use client";

type Props = {
  disabled: boolean;
  loading?: boolean;
};

export default function IncidentSubmitButton({ disabled, loading }: Props) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={[
        "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition",
        isDisabled
          ? "cursor-not-allowed bg-slate-200 text-slate-500"
          : "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99]",
      ].join(" ")}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
      )}

      {loading ? "Gemmer…" : "Tilføj hændelse"}
    </button>
  );
}
