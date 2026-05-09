// attendance/components/ApprovedUsersAdminActions.tsx
import AdminAddApprovedStaffButton from "../../event/AdminAddApprovedStaffButton";
import AdminAddCustomRsvpButton from "../../event/AdminAddCustomRsvpButton";

type Props = {
  eventId: string;
  actorUid: string | null;
  canAddSelfApproved: boolean;
  canCreateCustom: boolean;
};

export default function ApprovedUsersAdminActions({
  eventId,
  actorUid,
  canAddSelfApproved,
  canCreateCustom,
}: Props) {
  if (!canAddSelfApproved && !canCreateCustom) return null;

  return (
    <div className="mb-3 flex justify-center">
      <div className="w-full max-w-3xl space-y-2">
        <div className="text-center text-xs font-medium text-slate-500">
          Admin handling
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
          <div className="flex flex-col items-center gap-2">
            {canAddSelfApproved ? (
              <AdminAddApprovedStaffButton
                eventId={eventId}
                className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 text-xs rounded-md"
              />
            ) : null}

            {canCreateCustom ? (
              <AdminAddCustomRsvpButton eventId={eventId} actorUid={actorUid} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
