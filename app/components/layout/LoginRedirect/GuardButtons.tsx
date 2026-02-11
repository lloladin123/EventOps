"use client";

import * as React from "react";

type ButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
};

export function PrimaryButton({ children, onClick }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
    >
      {children}
    </button>
  );
}
