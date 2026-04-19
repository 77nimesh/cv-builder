import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/session";

type LoginPageProps = {
  searchParams: Promise<{
    passwordChanged?: string;
    reset?: string;
    verified?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/resumes");
  }

  const query = await searchParams;

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

          {query.passwordChanged ? (
            <p className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              Your password was changed. Please log in again.
            </p>
          ) : null}

          {query.reset ? (
            <p className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              Your password has been reset. You can log in now.
            </p>
          ) : null}

          {query.verified ? (
            <p className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              Your email address has been verified.
            </p>
          ) : null}

          <LoginForm />

          <div className="mt-6 flex flex-col gap-3 text-sm text-slate-600">
            <p>
              Do not have an account?{" "}
              <Link href="/signup" className="font-medium text-slate-900">
                Create one
              </Link>
            </p>

            <p>
              Forgot your password?{" "}
              <Link
                href="/forgot-password"
                className="font-medium text-slate-900"
              >
                Reset it
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}