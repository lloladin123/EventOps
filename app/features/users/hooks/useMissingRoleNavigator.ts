"use client";

import * as React from "react";

type HasUidAndRole = {
  uid: string;
  data: { role?: unknown | null };
};

export function useMissingRoleNavigator<T extends HasUidAndRole>({
  visibleUsers,
  focusRole,
  focusOnLoadFlagKey = "users:focusNextMissingRole",
}: {
  visibleUsers: readonly T[];
  focusRole: (uid: string) => void;
  focusOnLoadFlagKey?: string;
}) {
  const missingRoleUids = React.useMemo(
    () => visibleUsers.filter((u) => !u.data.role).map((u) => u.uid),
    [visibleUsers]
  );

  const focusMissingRelative = React.useCallback(
    (fromUid: string | null, dir: 1 | -1) => {
      if (missingRoleUids.length === 0) return;

      // If focus is currently on a missing-role user, cycle within that list
      if (fromUid) {
        const idx = missingRoleUids.indexOf(fromUid);
        if (idx !== -1) {
          const nextIdx =
            (idx + dir + missingRoleUids.length) % missingRoleUids.length;
          focusRole(missingRoleUids[nextIdx]);
          return;
        }
      }

      // Otherwise: find the next missing-role after the currently focused row in visible order
      const order = visibleUsers.map((u) => u.uid);
      const startIdx = fromUid ? order.indexOf(fromUid) : -1;

      if (dir === 1) {
        for (let i = Math.max(0, startIdx + 1); i < order.length; i++) {
          if (missingRoleUids.includes(order[i])) {
            focusRole(order[i]);
            return;
          }
        }
        // wrap
        focusRole(missingRoleUids[0]);
      } else {
        for (
          let i = (startIdx === -1 ? order.length : startIdx) - 1;
          i >= 0;
          i--
        ) {
          if (missingRoleUids.includes(order[i])) {
            focusRole(order[i]);
            return;
          }
        }
        // wrap
        focusRole(missingRoleUids[missingRoleUids.length - 1]);
      }
    },
    [missingRoleUids, visibleUsers, focusRole]
  );

  // Focus next missing role on load (via sessionStorage flag)
  React.useEffect(() => {
    const flag = sessionStorage.getItem(focusOnLoadFlagKey);
    if (flag !== "1") return;

    const uid = missingRoleUids[0];
    if (!uid) return;

    sessionStorage.removeItem(focusOnLoadFlagKey);
    requestAnimationFrame(() => focusRole(uid));
  }, [missingRoleUids, focusRole, focusOnLoadFlagKey]);

  return { missingRoleUids, focusMissingRelative };
}
