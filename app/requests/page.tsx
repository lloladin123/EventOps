import LoginRedirect from "@/components/layout/LoginRedirect";
import RequestsClient from "@/components/requests/views/RequestsClient";
import { ROLE } from "@/types/rsvp";

export default function RequestsPage() {
  return (
    <LoginRedirect
      allowedRoles={[ROLE.Admin]}
      unauthorizedRedirectTo="/login"
      description="Du har ikke adgang til Requests."
    >
      <RequestsClient />
    </LoginRedirect>
  );
}
