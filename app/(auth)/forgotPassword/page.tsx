import ForgotPasswordCard from "@/features/auth/forms/ForgotPasswordCard";
import AuthRedirect from "@/features/auth/guards/AuthRedirect";

export default function ForgotPasswordPage() {
  return (
    <AuthRedirect whenAuthedTo="/events">
      <main className="mx-auto max-w-md p-6">
        <ForgotPasswordCard />
      </main>
    </AuthRedirect>
  );
}
