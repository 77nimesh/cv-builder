import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { defaultResumeData } from "@/lib/default-resume";

export async function GET() {
  try {
    const resumes = await prisma.resume.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(resumes);
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
    const resume = await prisma.resume.create({
      data: {
        title: "Untitled Resume",
        template: "modern-1",
        data: defaultResumeData,
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