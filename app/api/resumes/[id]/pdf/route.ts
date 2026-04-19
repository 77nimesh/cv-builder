import { chromium, type Page } from "playwright";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  createResumePrintAccessToken,
  findOwnedResume,
} from "@/lib/auth/resume-access";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function waitForPrintReady(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForSelector("[data-resume-template]");
  await page.emulateMedia({ media: "print" });

  await page.evaluate(async () => {
    const waitForNextFrame = () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

    const fontSet = (document as Document & {
      fonts?: {
        ready?: Promise<unknown>;
      };
    }).fonts;

    if (fontSet?.ready) {
      await fontSet.ready;
    }

    const images = Array.from(document.images);

    await Promise.all(
      images.map(async (image) => {
        if (!image.complete) {
          await new Promise<void>((resolve) => {
            const done = () => resolve();

            image.addEventListener("load", done, { once: true });
            image.addEventListener("error", done, { once: true });
          });
        }

        if (typeof image.decode === "function") {
          try {
            await image.decode();
          } catch {
            // Ignore decode failures and rely on the loaded/error state above.
          }
        }
      })
    );

    await waitForNextFrame();
    await waitForNextFrame();
  });
}

export async function GET(req: NextRequest, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const resume = await findOwnedResume(user.id, id);

  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;

  try {
    const origin = req.nextUrl.origin;
    const printAccessToken = createResumePrintAccessToken({
      resumeId: id,
      userId: user.id,
    });
    const printUrl = `${origin}/resumes/${id}/print?view=pdf&printAccessToken=${encodeURIComponent(
      printAccessToken
    )}&ts=${Date.now()}`;

    browser = await chromium.launch({
      headless: true,
    });

    const page = await browser.newPage();

    await page.goto(printUrl, {
      waitUntil: "networkidle",
    });

    await waitForPrintReady(page);

    const pdfBytes = Uint8Array.from(
      await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
      })
    );

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume-${id}.pdf"`,
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (error) {
    console.error("Failed to generate PDF:", error);

    return new Response(JSON.stringify({ error: "Failed to generate PDF" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}