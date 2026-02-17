"use client";

import * as React from "react";
import type { UserDoc } from "@/lib/firestore/users.client";
import type { SystemRole } from "@/types/systemRoles";
import { isSystemAdmin, SYSTEM_ROLE } from "@/types/systemRoles";

import GroupedList from "@/components/ui/patterns/GroupedList";
import { UsersViewState } from "./UsersViewState";
import { usersGroupMeta } from "../config/UsersGroupMeta";

import { useFlashUid } from "../hooks/useFlashUid";
import { useUserHotkeys } from "../hooks/useUserHotkeys";
import { confirmDeleteUser } from "../utils/confirmDeleteUser";
import { useUserListRowFocus } from "../hooks/useUserListRowFocus";
import { useUserListRenderRow } from "../hooks/useUserListRenderRow";
import { UserHotkeysHint } from "./UserHotkeysHint";
import { getAuth } from "firebase/auth";

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
}: Props) {
  const uid = getAuth().currentUser?.uid ?? null;

  const currentSystemRole = React.useMemo(() => {
    if (!uid) return null;
    return (users.find((u) => u.uid === uid)?.data.systemRole ??
      null) as SystemRole | null;
  }, [users, uid]);

  const visibleUsers = React.useMemo(() => {
    // 🚫 Never show Superadmins in this list
    const base = users.filter(
      (u) => u.data.systemRole !== SYSTEM_ROLE.Superadmin,
    );

    // No "staff" concept anymore — admins and non-admins see the same base list
    // (keeping this check is harmless, but it no longer changes filtering)
    if (isSystemAdmin(currentSystemRole)) return base;
    return base;
  }, [users, currentSystemRole]);

  const { flashUid, flash } = useFlashUid(2200);

  const { setRowRef, setRoleRef, focusRoleSelect } = useUserListRowFocus();

  useUserHotkeys({
    enabled: true,
    users: visibleUsers,
    onDeleteUser: deleteUser,
    confirmDelete: (_label, row) => confirmDeleteUser(row.uid, row.data),
  });

  const setRole = setUserSystemRole ?? setUserRole ?? (async () => {});

  const renderRow = useUserListRenderRow({
    systemRoles,
    setUserSystemRole: setRole,
    deleteUser,
    flashUid,
    flash,
    focusRoleSelect,
    setRowRef,
    setRoleRef,
  });

  return (
    <UsersViewState busy={busy} isEmpty={visibleUsers.length === 0}>
      <GroupedList<Row, GroupId>
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
