import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildResumeDataFromFormData, normalizeResumeData } from "@/lib/resume/normalizers";
import { resumeFormSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const resume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...resume,
      data: normalizeResumeData(resume.data, {
        template: resume.template,
        themeColor: resume.themeColor,
        fontFamily: resume.fontFamily,
      }),
    });
  } catch (error) {
    console.error("Failed to fetch resume:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const rawBody = await req.json();
    const body = resumeFormSchema.parse(rawBody);

    const data = buildResumeDataFromFormData(body.data, {
      template: body.template,
      themeColor: body.themeColor ?? null,
      fontFamily: body.fontFamily ?? null,
    });

    const updatedResume = await prisma.resume.update({
      where: { id },
      data: {
        title: body.title,
        template: body.template,
        themeColor: body.themeColor || null,
        fontFamily: body.fontFamily || null,
        data,
        photoPath: body.photoPath || null,
      },
    });

    return NextResponse.json({
      ...updatedResume,
      data: normalizeResumeData(updatedResume.data, {
        template: updatedResume.template,
        themeColor: updatedResume.themeColor,
        fontFamily: updatedResume.fontFamily,
      }),
    });
  } catch (error) {
    console.error("Failed to update resume:", error);
    return NextResponse.json(
      { error: "Failed to update resume" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.resume.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete resume:", error);
    return NextResponse.json(
      { error: "Failed to delete resume" },
      { status: 500 }
    );
  }
}
