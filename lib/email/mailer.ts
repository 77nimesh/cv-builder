import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type StoredEmail = {
  id: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  purpose: string;
  createdAt: string;
  previewUrl: string;
};

function getOutboxDirectory() {
  const configured = process.env.DEV_EMAIL_OUTBOX_DIR?.trim();

  if (!configured) {
    return path.join(process.cwd(), ".dev-emails");
  }

  return path.isAbsolute(configured)
    ? configured
    : path.join(process.cwd(), configured);
}

export function getAppBaseUrl() {
  return process.env.APP_BASE_URL?.trim() || "http://localhost:3000";
}

export function buildAbsoluteUrl(pathname: string) {
  return new URL(pathname, getAppBaseUrl()).toString();
}

async function ensureOutboxDirectory() {
  const outboxDirectory = getOutboxDirectory();
  await mkdir(outboxDirectory, { recursive: true });
  return outboxDirectory;
}

function isSafePreviewId(id: string) {
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

export async function sendAppEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
  purpose: string;
}) {
  const id = `${Date.now()}-${randomUUID()}`;
  const previewUrl = buildAbsoluteUrl(`/dev/emails/${id}`);

  const record: StoredEmail = {
    id,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
    purpose: input.purpose,
    createdAt: new Date().toISOString(),
    previewUrl,
  };

  const outboxDirectory = await ensureOutboxDirectory();

  await writeFile(
    path.join(outboxDirectory, `${id}.json`),
    JSON.stringify(record, null, 2),
    "utf8"
  );

  console.log(
    [
      "DEV EMAIL PREPARED",
      `To: ${record.to}`,
      `Subject: ${record.subject}`,
      `Preview: ${record.previewUrl}`,
      `Purpose: ${record.purpose}`,
    ].join("\n")
  );

  return record;
}

export async function listStoredEmails() {
  try {
    const outboxDirectory = await ensureOutboxDirectory();
    const filenames = await readdir(outboxDirectory);

    const emailRecords = await Promise.all(
      filenames
        .filter((filename) => filename.endsWith(".json"))
        .map(async (filename) => {
          const fileContents = await readFile(
            path.join(outboxDirectory, filename),
            "utf8"
          );

          return JSON.parse(fileContents) as StoredEmail;
        })
    );

    return emailRecords.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [] as StoredEmail[];
  }
}

export async function readStoredEmail(id: string) {
  if (!isSafePreviewId(id)) {
    return null;
  }

  try {
    const outboxDirectory = await ensureOutboxDirectory();
    const fileContents = await readFile(
      path.join(outboxDirectory, `${id}.json`),
      "utf8"
    );

    return JSON.parse(fileContents) as StoredEmail;
  } catch {
    return null;
  }
}