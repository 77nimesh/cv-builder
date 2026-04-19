import Link from "next/link";
import { redirect } from "next/navigation";
import SignupForm from "@/components/auth/signup-form";
import { getCurrentUser } from "@/lib/auth/session";

export default async function SignupPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/resumes");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-16">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <Link href="/" className="text-sm text-slate-500">
              ← Back to home
            </Link>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">
              Create Account
            </h1>
            <p className="mt-2 text-slate-600">
              Start saving and managing resumes under your own account.
            </p>
          </div>

          <SignupForm />

          <p className="mt-6 text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-slate-900">
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}