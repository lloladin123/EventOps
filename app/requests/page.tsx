import LoginRedirect from "@/components/layout/LoginRedirect/LoginRedirect";
import RequestsClient from "@/features/requests/views/RequestsClient";
import { SYSTEM_ROLE } from "@/types/systemRoles";

export default function RequestsPage() {
  return (
    <LoginRedirect
      allowedSystemRoles={[SYSTEM_ROLE.Admin]}
      unauthorizedRedirectTo="/login"
      description="Du har ikke adgang til Requests."
    >
      <RequestsClient />
    </LoginRedirect>
  );
}
