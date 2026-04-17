import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDefaultResumeData } from "@/lib/default-resume";
import { normalizeResumeRecord } from "@/lib/resume/record";

export async function GET() {
  try {
    const resumes = await prisma.resume.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(resumes.map((resume) => normalizeResumeRecord(resume)));
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
        photoPath: null,
        data,
      },
    });

    return NextResponse.json(normalizeResumeRecord(resume), { status: 201 });
  } catch (error) {
    console.error("Failed to create resume:", error);
    return NextResponse.json(
      { error: "Failed to create resume" },
      { status: 500 }
    );
  }
}
