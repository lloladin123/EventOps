"use client";

import * as React from "react";
import type { UserDoc } from "@/lib//firestore/users.client";

type Props = {
  uid: string;
  data: UserDoc;
  deleteUser: (uid: string) => void | Promise<void>;
  confirmDelete: (uid: string, data: UserDoc) => boolean;
};

export function DeleteUserButton({
  uid,
  data,
  deleteUser,
  confirmDelete,
}: Props) {
  return (
    <button
      type="button"
      onClick={async () => {
        if (!confirmDelete(uid, data)) return;
        await deleteUser(uid);
      }}
      className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 active:scale-[0.99]"
      title="Slet bruger"
      aria-label="Slet bruger"
    >
      Slet
    </button>
  );
}
