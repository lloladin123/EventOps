import SignupCard from "@/features/auth/forms/SignupCard";
import AuthRedirect from "@/features/auth/guards/AuthRedirect";

const page = () => {
  return (
    <div>
      <AuthRedirect whenAuthedTo="/events">
        <SignupCard></SignupCard>
      </AuthRedirect>
    </div>
  );
};

export default page;
