import LoginRedirect from "@/components/layout/LoginRedirect/LoginRedirect";
import RequestsClient from "@/features/requests/views/RequestsClient";
import { ROLE } from "@/types/rsvp";

export default function RequestsPage() {
  return (
    <LoginRedirect
      allowedRoles={[ROLE.Admin, ROLE.Sikkerhedsledelse]}
      unauthorizedRedirectTo="/login"
      description="Du har ikke adgang til Requests."
    >
      <RequestsClient />
    </LoginRedirect>
  );
}
