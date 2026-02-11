"use client";

import * as React from "react";
import { ROLE } from "@/types/rsvp";
import type { Role, CrewSubRole } from "@/types/rsvp";
import type { UserDoc } from "@/data/users.firestore";

import GroupedList from "@/components/ui/GroupedList";
import { UsersViewState } from "./UsersViewState";
import { usersGroupMeta } from "../config/UsersGroupMetaa";

import { useFlashUid } from "../hooks/useFlashUid";
import { useMissingRoleNavigator } from "../hooks/useMissingRoleNavigator";
import { useUserHotkeys } from "../hooks/useUserHotkeys";
import { confirmDeleteUser } from "../utils/confirmDeleteUser";
import { useUserListRowFocus } from "../hooks/useUserListRowFocus";
import { useUserListRenderRow } from "../hooks/useUserListRenderRow";
import { visibleNonAdminUsers } from "../utils/usersVisible";
import { useFlashFocus } from "../hooks/useFlashFocus";
import { UserHotkeysHint } from "./UserHotkeysHint";

type Props = {
  users: Array<{ uid: string; data: UserDoc }>;
  busy: boolean;
  roles: readonly Role[];
  crewSubRoles: readonly CrewSubRole[];
  setUserRole: (uid: string, nextRole: Role) => void | Promise<void>;
  setUserSubRole: (
    uid: string,
    nextSubRole: CrewSubRole | null
  ) => void | Promise<void>;
  deleteUser: (uid: string) => void | Promise<void>;
};

type Row = { uid: string; data: UserDoc };
type GroupId = "all";

export default function UserListView({
  users,
  busy,
  roles,
  crewSubRoles,
  setUserRole,
  setUserSubRole,
  deleteUser,
}: Props) {
  const visibleUsers = React.useMemo(
    () =>
      visibleNonAdminUsers(users).filter(
        (u) => u.data.role !== ROLE.Sikkerhedsledelse
      ),
    [users]
  );

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
    onJumpMissing: focusMissingRelative,
    onDeleteUser: deleteUser,
    confirmDelete: (_label, row) => confirmDeleteUser(row.uid, row.data),
  });

  const renderRow = useUserListRenderRow({
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
