import LoginRedirect from "@/components/layout/LoginRedirect/LoginRedirect";
import RequestsClient from "@/features/requests/views/RequestsClient";
import { SYSTEM_ROLE_GROUP } from "@/types/systemRoles";

export default function RequestsPage() {
  return (
    <LoginRedirect
      allowedSystemRoles={SYSTEM_ROLE_GROUP.AdminOnly}
      unauthorizedRedirectTo="/login"
      description="Du har ikke adgang til Requests."
    >
      <RequestsClient />
    </LoginRedirect>
  );
}
