import { Prisma } from "@prisma/client";
import type { ResumeData } from "@/lib/types";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Build proper JSON (allows nested `null`), then cast at the Prisma boundary.
function toPrismaJsonValue(value: unknown): Prisma.JsonValue {
  if (value === null) return null;

  if (value === undefined) {
    // Undefined isn't valid JSON. We'll treat it as "omit" by throwing here;
    // callers should filter undefined out (we do for objects/arrays below).
    throw new TypeError("Resume data contains `undefined`, which is not valid JSON.");
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    // Remove undefined entries; keep `null` entries (valid JSON)
    const filtered = value.filter((v) => v !== undefined);
    return filtered.map((item) => toPrismaJsonValue(item)) as Prisma.JsonArray;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(([key, entryValue]) => [key, toPrismaJsonValue(entryValue)]);

    return Object.fromEntries(entries) as Prisma.JsonObject;
  }

  throw new TypeError("Resume data contains a non-JSON value.");
}

export function toPrismaResumeData(data: ResumeData): Prisma.InputJsonObject {
  // Prisma create/update expects InputJson*, which (annoyingly) excludes `null` in TS types.
  // We generate valid JSON and cast at the boundary.
  return toPrismaJsonValue(data) as unknown as Prisma.InputJsonObject;
}