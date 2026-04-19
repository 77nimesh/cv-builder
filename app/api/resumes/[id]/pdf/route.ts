import { chromium, type Page } from "playwright";
import { NextRequest } from "next/server";

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
  const { id } = await context.params;

  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;

  try {
    const origin = req.nextUrl.origin;
    const printUrl = `${origin}/resumes/${id}/print?view=pdf&ts=${Date.now()}`;

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