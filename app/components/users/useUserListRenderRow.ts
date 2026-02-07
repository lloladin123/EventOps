"use client";

import * as React from "react";
import type { Role, CrewSubRole } from "@/types/rsvp";
import type { UserDoc } from "@/utils/users.firestore";

import { buildUserListRenderRow } from "./buildUserListRenderRow";
import { confirmDeleteUser } from "./confirmDeleteUser";

type Row = { uid: string; data: UserDoc };

type Params = {
  roles: readonly Role[];
  crewSubRoles: readonly CrewSubRole[];
  setUserRole: (uid: string, nextRole: Role) => void | Promise<void>;
  setUserSubRole: (
    uid: string,
    nextSubRole: CrewSubRole | null
  ) => void | Promise<void>;
  deleteUser: (uid: string) => void | Promise<void>;

  focusMissingRelative: (fromUid: string | null, dir: 1 | -1) => void;

  flashUid: string | null;

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
    ]
  );
}
