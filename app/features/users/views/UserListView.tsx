"use client";

import * as React from "react";
import type { UserDoc } from "@/lib/firestore/users.client";
import type { SystemRole } from "@/types/systemRoles";
import { SYSTEM_ROLE } from "@/types/systemRoles";

import GroupedList from "@/components/ui/patterns/GroupedList";
import { UsersViewState } from "./UsersViewState";
import { usersGroupMeta } from "../config/UsersGroupMeta";

import { useFlashUid } from "../hooks/useFlashUid";
import { useUserHotkeys } from "../hooks/useUserHotkeys";
import { confirmDeleteUser } from "../utils/confirmDeleteUser";
import { useUserListRowFocus } from "../hooks/useUserListRowFocus";
import { useUserListRenderRow } from "../hooks/useUserListRenderRow";
import { UserHotkeysHint } from "./UserHotkeysHint";

import { useAuth } from "@/features/auth/provider/AuthProvider";
import { canWith, PERMISSION } from "@/features/auth/lib/permissions";

type Props = {
  users: Array<{ uid: string; data: UserDoc }>;
  busy: boolean;

  systemRoles: readonly SystemRole[];

  setUserSystemRole?: (
    uid: string,
    nextRole: SystemRole | null,
  ) => void | Promise<void>;

  setUserRole?: (
    uid: string,
    nextRole: SystemRole | null,
  ) => void | Promise<void>;

  deleteUser: (uid: string) => void | Promise<void>;
  pendingDeleteUids?: string[];
};

type Row = { uid: string; data: UserDoc };
type GroupId = "all";

export default function UserListView({
  users,
  busy,
  systemRoles,
  setUserSystemRole,
  setUserRole,
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

  const { setRowRef, setRoleRef, focusRoleSelect } = useUserListRowFocus();

  useUserHotkeys({
    enabled: canManageUsers,
    users: visibleUsers,
    onDeleteUser: deleteUser,
    confirmDelete: (_label, row) => confirmDeleteUser(row.uid, row.data),
  });

  const setRole = setUserSystemRole ?? setUserRole ?? (async () => {});

  const renderRow = useUserListRenderRow({
    systemRoles,
    setUserSystemRole: setRole,
    currentSystemRole: systemRole,
    deleteUser,
    flashUid,
    flash,
    focusRoleSelect,
    setRowRef,
    setRoleRef,
    canEditRoles,
    canManageUsers,
    pendingDeleteUids,
  });

  return (
    <UsersViewState busy={busy} isEmpty={visibleUsers.length === 0}>
      <GroupedList<Row, GroupId>
        key={pendingDeleteUids.join("|")}
        rows={visibleUsers}
        getGroupId={() => "all"}
        getGroupMeta={usersGroupMeta}
        getRowKey={(r) => r.uid}
        sortHint={<UserHotkeysHint />}
        renderRow={renderRow}
      />
    </UsersViewState>
  );
}
