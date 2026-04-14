import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDefaultResumeData } from "@/lib/default-resume";
import { normalizeResumeData } from "@/lib/resume/normalizers";

export async function GET() {
  try {
    const resumes = await prisma.resume.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(
      resumes.map((resume) => ({
        ...resume,
        data: normalizeResumeData(resume.data, {
          template: resume.template,
          themeColor: resume.themeColor,
          fontFamily: resume.fontFamily,
        }),
      }))
    );
  } catch (error) {
    console.error("Failed to fetch resumes:", error);
    return NextResponse.json(
      { error: "Failed to fetch resumes" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const data = createDefaultResumeData({ template: "modern-1" });

    const resume = await prisma.resume.create({
      data: {
        title: "Untitled Resume",
        template: data.layout.template,
        themeColor: data.layout.themeColor,
        fontFamily: data.layout.fontFamily,
        data,
      },
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (error) {
    console.error("Failed to create resume:", error);
    return NextResponse.json(
      { error: "Failed to create resume" },
      { status: 500 }
    );
  }
}
