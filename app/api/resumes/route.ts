import { NextResponse } from "next/server";
import { createDefaultResumeData } from "@/lib/default-resume";
import { prisma } from "@/lib/prisma";
import { toPrismaResumeData } from "@/lib/resume/prisma-json";
import { normalizeResumeRecord } from "@/lib/resume/record";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(
      resumes.map((resume) => normalizeResumeRecord(resume))
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
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = createDefaultResumeData({ template: "modern-1" });

    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        title: "Untitled Resume",
        template: data.layout.template,
        themeColor: data.layout.themeColor,
        fontFamily: data.layout.fontFamily,
        photoPath: null,
        data: toPrismaResumeData(data),
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