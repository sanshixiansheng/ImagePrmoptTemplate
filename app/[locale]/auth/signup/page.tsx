import { redirect } from "next/navigation";
import { auth } from "@/auth";
import SignUpForm from "@/components/auth/signup-form";

export default async function SignUpPage() {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <SignUpForm />
    </div>
  );
}
