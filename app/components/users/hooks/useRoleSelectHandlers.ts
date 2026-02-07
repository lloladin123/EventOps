"use client";

import * as React from "react";
import { ROLE } from "@/types/rsvp";
import type { Role } from "@/types/rsvp";

type Args = {
  uid: string;
  setUserRole: (uid: string, nextRole: Role) => void | Promise<void>;
  focusSubRoleSelect: (uid: string) => void;
  focusMissingRelative: (fromUid: string | null, dir: 1 | -1) => void;
};

export function useRoleSelectHandlers({
  uid,
  setUserRole,
  focusSubRoleSelect,
  focusMissingRelative,
}: Args) {
  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLSelectElement>) => {
      if (e.key !== "Enter") return;

      e.preventDefault();

      const picked = (e.currentTarget.value || "") as Role | "";
      if (!picked) return;

      if (picked === ROLE.Crew) {
        requestAnimationFrame(() => focusSubRoleSelect(uid));
      } else {
        requestAnimationFrame(() => focusMissingRelative(uid, 1));
      }
    },
    [uid, focusSubRoleSelect, focusMissingRelative]
  );

  const onChange = React.useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const next = e.target.value as Role;
      await setUserRole(uid, next);

      if (next === ROLE.Crew) {
        requestAnimationFrame(() => focusSubRoleSelect(uid));
        return;
      }

      requestAnimationFrame(() => focusMissingRelative(uid, 1));
    },
    [uid, setUserRole, focusSubRoleSelect, focusMissingRelative]
  );

  return { onKeyDown, onChange };
}
