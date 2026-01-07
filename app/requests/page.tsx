import LoginRedirect from "@/components/layout/LoginRedirect";
import RequestsClient from "@/app/components/requests/RequestsClient";

export default function RequestsPage() {
  return (
    <LoginRedirect
      allowedRoles={["Admin"]}
      unauthorizedRedirectTo="/login"
      description="Du har ikke adgang til Requests."
    >
      <RequestsClient />
    </LoginRedirect>
  );
}
