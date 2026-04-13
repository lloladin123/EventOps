"use client";

import type { UserDoc } from "@/lib/firestore/users.client";

type Props = {
  uid: string;
  data: UserDoc;
  deleteUser: (uid: string) => void | Promise<void>;
  confirmDelete: (uid: string, data: UserDoc) => boolean;
  deleting?: boolean;
};

export function DeleteUserButton({
  uid,
  data,
  deleteUser,
  confirmDelete,
  deleting = false,
}: Props) {
  return (
    <button
      type="button"
      onClick={async () => {
        if (deleting) return;
        if (!confirmDelete(uid, data)) return;

        await deleteUser(uid);
      }}
      disabled={deleting}
      className={[
        "inline-flex min-w-[92px] items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
        deleting
          ? "cursor-not-allowed border-rose-200 bg-rose-50 text-rose-500 opacity-70"
          : "border-rose-200 bg-white text-rose-700 hover:bg-rose-50 active:scale-[0.99]",
      ].join(" ")}
      title={deleting ? "Sletter bruger..." : "Slet bruger"}
      aria-label={deleting ? "Sletter bruger" : "Slet bruger"}
      aria-busy={deleting}
    >
      {deleting ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="h-3.5 w-3.5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          Sletter...
        </span>
      ) : (
        "Slet"
      )}
    </button>
  );
}
