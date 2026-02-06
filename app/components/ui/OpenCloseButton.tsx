"use client";

import * as React from "react";

export default function OpenCloseButton({
  target,
  disabled,
  onClick,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  target: "open" | "close";
}) {
  const isOpenTarget = target === "open";

  // EventSection button style
  const base =
    "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition active:scale-[0.99]";
  const disabledCls =
    "bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100";

  return (
    <button
      {...props}
      type={props.type ?? "button"}
      onClick={onClick}
      disabled={disabled}
      className={[base, disabled ? disabledCls : "", className].join(" ")}
    >
      {props.children ?? (isOpenTarget ? "Vis" : "Skjul")}
    </button>
  );
}
