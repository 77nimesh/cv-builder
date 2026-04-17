import { NextRequest } from "next/server";
import { chromium, type Page } from "playwright";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

async function waitForPrintReady(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle");

  await page.evaluate(async () => {
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
      images.map((image) => {
        if (image.complete) {
          return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
          const done = () => resolve();

          image.addEventListener("load", done, { once: true });
          image.addEventListener("error", done, { once: true });
        });
      })
    );
  });
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  let browser;

  try {
    const origin = req.nextUrl.origin;
    const printUrl = `${origin}/resumes/${id}/print`;

    browser = await chromium.launch({
      headless: true,
    });

    const page = await browser.newPage();

    await page.goto(printUrl, {
      waitUntil: "networkidle",
    });

    await waitForPrintReady(page);
    await page.emulateMedia({ media: "print" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Failed to generate PDF:", error);

    return new Response(JSON.stringify({ error: "Failed to generate PDF" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
