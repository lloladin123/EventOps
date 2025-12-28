"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export default function TimeInput({
  value,
  onChange,
  placeholder = "HH:mm",
}: Props) {
  const isValid = value === "" || TIME_REGEX.test(value);

  return (
    <div className="mt-2">
      <input
        type="text"
        inputMode="numeric"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
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
          Tid skal være i format HH:mm (fx 16:30)
        </p>
      )}
    </div>
  );
}
