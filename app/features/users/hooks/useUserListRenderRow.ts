"use client";

import * as React from "react";
import type { Role, CrewSubRole } from "@/types/rsvp";

import { buildUserListRenderRow } from "../builders/buildUserListRenderRow";
import { confirmDeleteUser } from "../utils/confirmDeleteUser";

type Params = {
  roles: readonly Role[];
  crewSubRoles: readonly CrewSubRole[];
  setUserRole: (uid: string, nextRole: Role) => void | Promise<void>;
  setUserSubRole: (
    uid: string,
    nextSubRole: CrewSubRole | null,
  ) => void | Promise<void>;
  deleteUser: (uid: string) => void | Promise<void>;

  focusMissingRelative: (fromUid: string | null, dir: 1 | -1) => void;

  flashUid: string | null;
  flash: (uid: string) => void; // ✅ add
  focusRoleSelect: (uid: string) => void;

  setRowRef: (uid: string, el: HTMLElement | null) => void;
  setRoleRef: (uid: string, el: HTMLSelectElement | null) => void;
};

export function useUserListRenderRow({
  roles,
  crewSubRoles,
  setUserRole,
  setUserSubRole,
  deleteUser,
  focusMissingRelative,
  flashUid,
  flash,
  focusRoleSelect,
  setRowRef,
  setRoleRef,
}: Params) {
  return React.useMemo(
    () =>
      buildUserListRenderRow({
        roles,
        crewSubRoles,
        setUserRole,
        setUserSubRole,
        deleteUser,
        focusMissingRelative,
        flashUid,
        flash,
        focusRoleSelect,
        setRowRef,
        setRoleRef,
        confirmDeleteUser,
      }),
    [
      roles,
      crewSubRoles,
      setUserRole,
      setUserSubRole,
      deleteUser,
      focusMissingRelative,
      flashUid,
      setRowRef,
      setRoleRef,
    ],
  );
}
