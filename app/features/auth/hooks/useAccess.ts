"use client";

import * as React from "react";
import { useAuth } from "@/features/auth/provider/AuthProvider";
import {
  AccessCtx,
  canWith,
  type Action,
} from "@/features/auth/lib/permissions";

export function useAccess() {
  const { user, systemRole, loading } = useAuth();

  const canAccess = React.useCallback(
    (action: Action, extra?: Pick<AccessCtx, "rsvpRole" | "rsvpApproved">) =>
      !loading &&
      canWith(action, {
        user,
        systemRole,
        rsvpRole: extra?.rsvpRole,
        rsvpApproved: extra?.rsvpApproved,
      }),
    [loading, user, systemRole],
  );

  return { canAccess, loading, user, systemRole };
}
