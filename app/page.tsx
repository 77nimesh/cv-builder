import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight">CV Builder</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Local-first resume builder with live preview and PDF export.
        </p>

        <div className="mt-8 flex gap-4">
          <a
            href="/resumes"
            className="rounded-xl bg-slate-900 px-5 py-3 text-white"
          >
            View Resumes
          </a>
          <a
            href="/resumes/new"
            className="rounded-xl border border-slate-300 px-5 py-3"
          >
            Create Resume
          </a>
        </div>
      </div>
    </main>
  );
}
