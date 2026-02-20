import LoginRedirect from "@/components/layout/LoginRedirect/LoginRedirect";
import { PERMISSION } from "@/features/auth/lib/permissions";
import RequestsClient from "@/features/requests/views/RequestsClient";

export default function RequestsPage() {
  return (
    <LoginRedirect
      action={PERMISSION.requests.dashboard.view}
      unauthorizedRedirectTo="/login"
      description="Du har ikke adgang til Requests."
    >
      <RequestsClient />
    </LoginRedirect>
  );
}
