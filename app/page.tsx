"use client";

import LoginCard from "@/components/auth/forms/LoginCard";
import EmailLoginForm from "./components/auth/forms/EmailLoginForm";

const ENABLE_TEST_LOGIN = process.env.NEXT_PUBLIC_ENABLE_TEST_LOGIN === "true";

export default function Page() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-6 p-6">
      {ENABLE_TEST_LOGIN && <LoginCard />}
      <EmailLoginForm />
    </main>
  );
}
