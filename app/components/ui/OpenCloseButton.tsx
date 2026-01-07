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

  const base =
    "rounded-xl px-3 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.99]";
  const enabled = isOpenTarget
    ? "bg-sky-600 text-white hover:bg-sky-500"
    : "bg-rose-600 text-white hover:bg-rose-500";
  const disabledCls =
    "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none";

  return (
    <button
      {...props}
      type={props.type ?? "button"}
      onClick={onClick}
      disabled={disabled}
      className={[base, disabled ? disabledCls : enabled, className].join(" ")}
    >
      {props.children ?? (isOpenTarget ? "Åbn" : "Luk")}
    </button>
  );
}
