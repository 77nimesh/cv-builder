import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/session";

export default async function LoginPage() {
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
            <h1 className="mt-4 text-3xl font-bold tracking-tight">Login</h1>
            <p className="mt-2 text-slate-600">
              Sign in to manage your resumes.
            </p>
          </div>

          <LoginForm />

          <p className="mt-6 text-sm text-slate-600">
            Do not have an account?{" "}
            <Link href="/signup" className="font-medium text-slate-900">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}