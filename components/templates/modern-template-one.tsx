import type { ResumeData } from "@/lib/types";
import { getPersonalDetails, getSummaryText } from "@/lib/resume/selectors";

type ModernTemplateOneProps = {
  data: ResumeData;
};

export default function ModernTemplateOne({
  data,
}: ModernTemplateOneProps) {
  const personal = getPersonalDetails(data);
  const summary = getSummaryText(data);

  return (
    <div className="mx-auto w-full max-w-[850px] rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 print:max-w-none print:rounded-none print:shadow-none print:ring-0">
      <div className="grid min-h-[1100px] grid-cols-1 md:grid-cols-[280px_1fr] print:grid-cols-[280px_1fr]">
        <aside className="bg-slate-900 px-8 py-10 text-white">
          <div>
            <h1 className="break-words text-3xl font-bold leading-tight">
              {personal.fullName || "Your Name"}
            </h1>
            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-slate-300">
              Professional Resume
            </p>
          </div>

          <div className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              Contact
            </h2>

            <div className="mt-4 space-y-4 text-sm text-slate-100">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Email
                </p>
                <p className="mt-1 break-words">
                  {personal.email || "your@email.com"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Phone
                </p>
                <p className="mt-1">{personal.phone || "+61 ..."}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Location
                </p>
                <p className="mt-1">{personal.location || "City, State"}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  LinkedIn
                </p>
                <p className="mt-1 break-words">
                  {personal.linkedIn || "linkedin.com/in/yourname"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Website
                </p>
                <p className="mt-1 break-words">
                  {personal.website || "yourwebsite.com"}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <section className="px-8 py-10 md:px-10">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Profile
            </h2>
            <div className="mt-4 h-px bg-slate-200" />
            <p className="mt-6 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
              {summary ||
                "Write a short professional summary that highlights your strengths, experience, and goals."}
            </p>
          </div>

          <div className="mt-12">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Experience
            </h2>
            <div className="mt-4 h-px bg-slate-200" />
            <p className="mt-6 text-[15px] leading-7 text-slate-500">
              Experience section will be added in the next phase.
            </p>
          </div>

          <div className="mt-12">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Education
            </h2>
            <div className="mt-4 h-px bg-slate-200" />
            <p className="mt-6 text-[15px] leading-7 text-slate-500">
              Education section will be added in the next phase.
            </p>
          </div>

          <div className="mt-12">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Skills
            </h2>
            <div className="mt-4 h-px bg-slate-200" />
            <p className="mt-6 text-[15px] leading-7 text-slate-500">
              Skills section will be added in the next phase.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
