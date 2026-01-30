"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const TIME_COLON_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const TIME_DIGITS_REGEX = /^([01]\d|2[0-3])([0-5]\d)$/; // 1645

function normalizeTime(raw: string): string {
  const v = raw.trim();

  // Already HH:mm
  if (TIME_COLON_REGEX.test(v)) return v;

  // 4 digits -> HH:mm
  const m = v.match(TIME_DIGITS_REGEX);
  if (m) return `${m[1]}:${m[2]}`;

  return v;
}

export default function TimeInput({
  value,
  onChange,
  placeholder = "16:45 eller 1645",
}: Props) {
  const v = value.trim();

  // ✅ valid if empty, HH:mm, or 4 digits
  const isValid =
    v === "" || TIME_COLON_REGEX.test(v) || TIME_DIGITS_REGEX.test(v);

  return (
    <div className="mt-2">
      <input
        type="text"
        inputMode="numeric"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          // keep typing flexible: digits + optional colon
          const next = e.target.value.replace(/[^\d:]/g, "");
          onChange(next);
        }}
        onBlur={() => {
          const next = normalizeTime(value);
          if (next !== value) onChange(next);
        }}
        className={[
          "w-full rounded-xl border px-3 py-2 text-sm shadow-sm outline-none",
          "bg-white text-slate-900",
          isValid
            ? "border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            : "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500",
        ].join(" ")}
      />

      {!isValid && (
        <p className="mt-1 text-xs text-rose-600">
          Tid skal være HH:mm (fx 16:30) eller 4 tal (fx 1630)
        </p>
      )}
    </div>
  );
}
