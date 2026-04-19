import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DuplicateResumeButton from "@/components/actions/duplicate-resume-button";
import DeleteResumeButton from "@/components/actions/delete-resume-button";
import LogoutButton from "@/components/auth/logout-button";
import { requireCurrentUser } from "@/lib/auth/session";

function readDisplayName(name: string | null, email: string | null | undefined) {
  const trimmedName = name?.trim();

  if (trimmedName) {
    return trimmedName;
  }

  return email ?? "your account";
}

export default async function ResumesPage() {
  const user = await requireCurrentUser();

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Resumes</h1>
            <p className="mt-2 text-slate-600">
              Create, manage, and edit your saved resumes.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Signed in as {readDisplayName(user.name ?? null, user.email)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3"
            >
              Home
            </Link>

            <LogoutButton className="rounded-xl border border-slate-300 bg-white px-4 py-3" />

            <Link
              href="/resumes/new"
              className="rounded-xl bg-slate-900 px-5 py-3 text-white"
            >
              New Resume
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4">
          {resumes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-lg font-medium">No resumes yet</p>
              <p className="mt-2 text-slate-600">
                Create your first resume to get started.
              </p>
            </div>
          ) : (
            resumes.map((resume) => (
              <div
                key={resume.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{resume.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Template: {resume.template}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Updated: {new Date(resume.updatedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <DuplicateResumeButton
                      resumeId={resume.id}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2"
                    />

                    <DeleteResumeButton
                      resumeId={resume.id}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-red-600"
                    />

                    <Link
                      href={`/resumes/${resume.id}/edit`}
                      className="rounded-xl border border-slate-300 px-4 py-2"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}