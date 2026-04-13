"use client";

import * as React from "react";
import type { SystemRole } from "@/types/systemRoles";

import { buildUserListRenderRow } from "../builders/buildUserListRenderRow";
import { confirmDeleteUser } from "../utils/confirmDeleteUser";

type Params = {
  systemRoles: readonly SystemRole[];
  setUserSystemRole: (
    uid: string,
    nextRole: SystemRole | null,
  ) => void | Promise<void>;
  deleteUser: (uid: string) => void | Promise<void>;

  currentSystemRole: SystemRole | null;

  flashUid: string | null;
  flash: (uid: string) => void;
  focusRoleSelect: (uid: string) => void;

  setRowRef: (uid: string, el: HTMLElement | null) => void;
  setRoleRef: (uid: string, el: HTMLSelectElement | null) => void;

  canEditRoles: boolean;
  canManageUsers: boolean;
  pendingDeleteUids: string[];
};

export function useUserListRenderRow({
  systemRoles,
  setUserSystemRole,
  deleteUser,
  currentSystemRole,
  flashUid,
  flash,
  focusRoleSelect,
  setRowRef,
  setRoleRef,
  canEditRoles,
  canManageUsers,
  pendingDeleteUids,
}: Params) {
  return React.useMemo(
    () =>
      buildUserListRenderRow({
        systemRoles,
        setUserSystemRole,
        deleteUser,
        currentSystemRole,
        flashUid,
        flash,
        focusRoleSelect,
        setRowRef,
        setRoleRef,
        canEditRoles,
        canManageUsers,
        confirmDeleteUser,
        pendingDeleteUids,
      }),
    [
      systemRoles,
      setUserSystemRole,
      deleteUser,
      flashUid,
      flash,
      focusRoleSelect,
      setRowRef,
      setRoleRef,
      canEditRoles,
      canManageUsers,
      pendingDeleteUids,
    ],
  );
}
