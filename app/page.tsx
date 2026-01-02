"use client";

import LoginCard from "@/components/auth/LoginCard";
import EmailLoginForm from "./components/auth/EmailLoginForm";

export default function Page() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-6 p-6">
      <LoginCard />
      <EmailLoginForm></EmailLoginForm>
    </main>
  );
}
