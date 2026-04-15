import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DuplicateResumeButton from "@/components/actions/duplicate-resume-button";

export default async function ResumesPage() {
  const resumes = await prisma.resume.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Resumes</h1>
            <p className="mt-2 text-slate-600">
              Create, manage, and edit your saved resumes.
            </p>
          </div>

          <Link
            href="/resumes/new"
            className="rounded-xl bg-slate-900 px-5 py-3 text-white"
          >
            New Resume
          </Link>
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