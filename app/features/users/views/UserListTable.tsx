"use client";

import * as React from "react";
import type { UserDoc } from "@/lib/firestore/users.client";
import GroupedTable from "@/components/ui/patterns/table/GroupedTable";
import { SortState } from "@/components/ui/patterns/table/types";

import { UsersViewState } from "./UsersViewState";
import { usersGroupMeta } from "../config/UsersGroupMeta";
import { UserHotkeysHint } from "./UserHotkeysHint";

import { useUserHotkeys } from "../hooks/useUserHotkeys";
import { useFlashUid } from "../hooks/useFlashUid";
import { useUserRowFocus } from "../hooks/useUserRowFocus";
import { useMissingRoleNavigator } from "../hooks/useMissingRoleNavigator";
import { useFlashFocus } from "../hooks/useFlashFocus";
import { confirmDeleteUser } from "../utils/confirmDeleteUser";

import { useAuth } from "@/features/auth/provider/AuthProvider";
import { canWith, PERMISSION } from "@/features/auth/lib/permissions";
import { SYSTEM_ROLE, type SystemRole } from "@/types/systemRoles";

import { buildUserTableColumns } from "../builders/buildUserTableColumns";

type Props = {
  users: Array<{ uid: string; data: UserDoc }>;
  busy: boolean;
  systemRoles: readonly SystemRole[];
  setUserSystemRole: (
    uid: string,
    nextRole: SystemRole | null,
  ) => void | Promise<void>;
  deleteUser: (uid: string) => void | Promise<void>;
  pendingDeleteUids?: string[];
};

type Row = { uid: string; data: UserDoc };
type GroupId = "all";

type ColumnKey = "user" | "uid" | "systemRole" | "actions";
type SortKey = Exclude<ColumnKey, "actions">;

export default function UserListTable({
  users,
  busy,
  systemRoles,
  setUserSystemRole,
  deleteUser,
  pendingDeleteUids = [],
}: Props) {
  const { user, systemRole } = useAuth();

  const authCtx = { user, systemRole };

  const canViewUsers = canWith(PERMISSION.users.dashboard.view, authCtx);
  const canManageUsers = canWith(PERMISSION.users.manage, authCtx);
  const canEditRoles = canWith(PERMISSION.users.rolesEdit, authCtx);

  const visibleUsers = React.useMemo(() => {
    if (!canViewUsers) return [];

    // Never show Superadmins in this list
    return users.filter((u) => u.data.systemRole !== SYSTEM_ROLE.Superadmin);
  }, [users, canViewUsers]);

  const { flashUid, flash } = useFlashUid(2200);

  const { setRowRef, setRoleRef, focusRoleSelect } = useUserRowFocus();
  const focusRoleSelectFlash = useFlashFocus(flash, focusRoleSelect);

  const { focusMissingRelative } = useMissingRoleNavigator({
    visibleUsers,
    focusRole: focusRoleSelectFlash,
  });

  const columns = React.useMemo(
    () =>
      buildUserTableColumns({
        systemRoles,
        setUserSystemRole,
        deleteUser,
        setRowRef,
        setRoleRef,
        focusRoleSelect,
        flashUid,
        flash,
        focusMissingRelative,
        canEditRoles,
        canManageUsers,
        pendingDeleteUids,
      }),
    [
      systemRoles,
      setUserSystemRole,
      deleteUser,
      setRowRef,
      setRoleRef,
      focusRoleSelect,
      flashUid,
      flash,
      focusMissingRelative,
      canEditRoles,
      canManageUsers,
      pendingDeleteUids,
    ],
  );

  useUserHotkeys({
    enabled: canManageUsers,
    users: visibleUsers,
    onDeleteUser: deleteUser,
    confirmDelete: (_label, row) => confirmDeleteUser(row.uid, row.data),
  });

  const initialSort: SortState<SortKey> = { key: "user", dir: "asc" };

  if (!canViewUsers) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white text-sm text-slate-600">
        Du har ikke adgang til brugere.
      </div>
    );
  }

  if (busy) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white text-sm text-slate-600">
        Loading users…
      </div>
    );
  }

  if (visibleUsers.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white text-sm text-slate-600">
        No users found.
      </div>
    );
  }

  return (
    <UsersViewState busy={busy} isEmpty={visibleUsers.length === 0}>
      <GroupedTable<Row, GroupId, ColumnKey, SortKey>
        rows={visibleUsers}
        initialSort={initialSort}
        tableMinWidthClassName="min-w-[980px]"
        getGroupId={() => "all"}
        sortHint={<UserHotkeysHint />}
        getGroupMeta={usersGroupMeta}
        columns={columns}
      />
    </UsersViewState>
  );
}
