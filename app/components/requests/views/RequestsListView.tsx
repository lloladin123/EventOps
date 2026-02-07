"use client";

import * as React from "react";
import type { Event } from "@/types/event";
import type { RSVPRow } from "@/types/requests";
import { RSVP_ATTENDANCE } from "@/types/rsvpIndex";

import GroupedList from "@/components/ui/GroupedList";

import { requestsGroupMeta } from "../ui/requestsGroupMeta";
import { RequestRowCard } from "../utils/RequestRowCard";
import { RequestsNoResponsesList } from "../utils/RequestsNoResponsesList";

type Props = {
  grouped: Map<string, RSVPRow[]>;
  eventsById: Map<string, Event>;
  onCopyApproved: (eventId: string) => void;
  approvalsDisabled?: boolean;
};

export default function RequestsListView({
  grouped,
  eventsById,
  approvalsDisabled,
  onCopyApproved,
}: Props) {
  // Flatten map into rows for GroupedList
  const rows = React.useMemo(() => {
    const out: RSVPRow[] = [];
    for (const [, list] of grouped.entries()) out.push(...list);
    return out;
  }, [grouped]);

  return (
    <GroupedList<RSVPRow, string>
      rows={rows}
      getGroupId={(r) => r.eventId}
      getGroupMeta={requestsGroupMeta({ onCopyApproved, eventsById })}
      getRowKey={(r) => `${r.eventId}:${r.uid}`}
      // ✅ main list excludes "No"
      filterGroupRows={(_, list) =>
        list.filter((r) => r.attendance !== RSVP_ATTENDANCE.No)
      }
      renderRow={(r) => (
        <RequestRowCard r={r} approvalsDisabled={approvalsDisabled} />
      )}
      // ✅ render "No" under each event
      renderGroupAfter={(_, list) => {
        const noRows = list.filter((r) => r.attendance === RSVP_ATTENDANCE.No);
        return (
          <RequestsNoResponsesList
            rows={noRows}
            approvalsDisabled={approvalsDisabled}
          />
        );
      }}
    />
  );
}
