"use client";

import * as React from "react";

export type GuardCardProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
};

export default function GuardCard({
  title,
  description,
  actions,
  footer,
}: GuardCardProps) {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>

        {description ? (
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        ) : null}

        {actions ? (
          <div className="mt-4 flex flex-wrap gap-2">{actions}</div>
        ) : null}

        {footer ? (
          <div className="mt-3 text-xs text-slate-500">{footer}</div>
        ) : null}
      </div>
    </main>
  );
}
