"use client";

import * as React from "react";
import { ROLE } from "@/types/rsvp";
import type { Role, CrewSubRole } from "@/types/rsvp";
import type { UserDoc } from "@/utils/users.firestore";

import { UserIdentityCell } from "../cells/UserIdentityCell";
import { RoleSelectCell } from "../cells/RoleSelectCell";
import { SubRoleSelect } from "../cells/SubRoleSelect";
import { DeleteUserButton } from "../cells/DeleteUserButton";
import { confirmDeleteUser } from "../utils/confirmDeleteUser";

type Row = { uid: string; data: UserDoc };
type ColumnKey = "user" | "uid" | "role" | "subRole" | "actions";
type SortKey = Exclude<ColumnKey, "actions">;

function asText(v: unknown) {
  return (v ?? "").toString().trim().toLowerCase();
}

type Params = {
  roles: readonly Role[];
  crewSubRoles: readonly CrewSubRole[];
  setUserRole: (uid: string, nextRole: Role | null) => void | Promise<void>;
  setUserSubRole: (
    uid: string,
    nextSubRole: CrewSubRole | null
  ) => void | Promise<void>;
  deleteUser: (uid: string) => void | Promise<void>;

  // focus + refs
  setRowRef: (uid: string, el: HTMLElement | null) => void;
  setRoleRef: (uid: string, el: HTMLSelectElement | null) => void;
  setSubRoleRef: (uid: string, el: HTMLSelectElement | null) => void;

  focusSubRoleSelect: (uid: string) => void;
  focusMissingRelative: (fromUid: string | null, dir: 1 | -1) => void;

  // flash state
  flashUid: string | null;
  flash: (uid: string) => void;
};

export function buildUserTableColumns({
  roles,
  crewSubRoles,
  setUserRole,
  setUserSubRole,
  deleteUser,
  setRowRef,
  setRoleRef,
  setSubRoleRef,
  focusSubRoleSelect,
  focusMissingRelative,
  flashUid,
  flash,
}: Params) {
  const columns: Array<{
    key: ColumnKey;
    header: string;
    headerTitle?: string;
    align?: "left" | "right" | "center";
    sortValue?: (r: Row) => string;
    cell: (r: Row) => React.ReactNode;
  }> = [
    {
      key: "user",
      header: "Bruger",
      headerTitle: "Sortér efter navn",
      sortValue: (r) =>
        r.data.displayName?.trim() || r.data.email?.split("@")[0] || r.uid,
      cell: (r) => (
        <UserIdentityCell
          uid={r.uid}
          data={r.data}
          setRowRef={setRowRef}
          onActivate={() => flash(r.uid)}
        />
      ),
    },
    {
      key: "uid",
      header: "UID",
      headerTitle: "Sortér efter UID",
      sortValue: (r) => asText(r.uid),
      cell: (r) => <code className="text-xs text-slate-700">{r.uid}</code>,
    },
    {
      key: "role",
      header: "Rolle",
      headerTitle: "Sortér efter rolle",
      sortValue: (r) => asText(r.data.role ?? ""),
      cell: (r) => (
        <RoleSelectCell
          uid={r.uid}
          role={(r.data.role ?? null) as Role | null}
          roles={roles}
          setRoleRef={setRoleRef}
          setUserRole={setUserRole}
          focusSubRoleSelect={focusSubRoleSelect}
          focusMissingRelative={focusMissingRelative}
        />
      ),
    },
    {
      key: "subRole",
      header: "Under rolle",
      headerTitle: "Sortér efter subrole",
      sortValue: (r) => asText(r.data.subRole ?? ""),
      cell: (r) => (
        <SubRoleSelect
          uid={r.uid}
          role={(r.data.role ?? null) as Role | null}
          subRole={(r.data.subRole ?? null) as CrewSubRole | null}
          crewSubRoles={crewSubRoles}
          setSubRoleRef={setSubRoleRef}
          setUserSubRole={setUserSubRole}
        />
      ),
    },
    {
      key: "actions",
      header: " ",
      align: "right",
      cell: (r) => (
        <DeleteUserButton
          uid={r.uid}
          data={r.data}
          deleteUser={deleteUser}
          confirmDelete={confirmDeleteUser}
        />
      ),
    },
  ];

  return columns as any; // GroupedTable typing is usually picky; cast if needed
}
