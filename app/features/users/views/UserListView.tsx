"use client";

import * as React from "react";
import type { UserDoc } from "@/lib/firestore/users.client";
import type { SystemRole } from "@/types/systemRoles";
import { isSystemAdmin, isSystemStaff } from "@/types/systemRoles";

import GroupedList from "@/components/ui/patterns/GroupedList";
import { UsersViewState } from "./UsersViewState";
import { usersGroupMeta } from "../config/UsersGroupMeta";

import { useFlashUid } from "../hooks/useFlashUid";
import { useMissingRoleNavigator } from "../hooks/useMissingRoleNavigator";
import { useUserHotkeys } from "../hooks/useUserHotkeys";
import { confirmDeleteUser } from "../utils/confirmDeleteUser";
import { useUserListRowFocus } from "../hooks/useUserListRowFocus";
import { useUserListRenderRow } from "../hooks/useUserListRenderRow";
import { useFlashFocus } from "../hooks/useFlashFocus";
import { UserHotkeysHint } from "./UserHotkeysHint";
import { getAuth } from "firebase/auth";

type Props = {
  users: Array<{ uid: string; data: UserDoc }>;
  busy: boolean;

  systemRoles: readonly SystemRole[];

  // ✅ prefer this (new)
  setUserSystemRole?: (
    uid: string,
    nextRole: SystemRole | null,
  ) => void | Promise<void>;

  // ✅ fallback (temporary) if parent still passes old prop name
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
    const withoutSuperadmins = users.filter(
      (u) => u.data.systemRole !== "Superadmin",
    );

    // Non-admins also shouldn't see staff
    if (!isSystemAdmin(currentSystemRole)) {
      return withoutSuperadmins.filter(
        (u) => !isSystemStaff(u.data.systemRole ?? null),
      );
    }

    return withoutSuperadmins;
  }, [users, currentSystemRole]);

  const { flashUid, flash } = useFlashUid(2200);

  const { setRowRef, setRoleRef, focusRoleSelect } = useUserListRowFocus();
  const focusRoleSelectFlash = useFlashFocus(flash, focusRoleSelect);

  const { focusMissingRelative } = useMissingRoleNavigator({
    visibleUsers,
    focusRole: focusRoleSelectFlash,
  });

  useUserHotkeys({
    enabled: true,
    users: visibleUsers,
    onDeleteUser: deleteUser,
    confirmDelete: (_label, row) => confirmDeleteUser(row.uid, row.data),
  });

  // ✅ normalize handler to avoid runtime "not a function"
  const setRole = setUserSystemRole ?? setUserRole ?? (async () => {});

  const renderRow = useUserListRenderRow({
    systemRoles,
    setUserSystemRole: setRole,
    deleteUser,
    focusMissingRelative,
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
