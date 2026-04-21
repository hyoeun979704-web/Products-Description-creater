/**
 * Unsplash curated-pool seed script.
 *
 * Usage:
 *   1. Create db/seed/unsplash-seed.csv with header:
 *      unsplash_id,url_regular,url_small,photographer,photographer_url,category,tags,slot_hint
 *      - tags: pipe-separated (e.g. "warm|cozy|wood")
 *      - slot_hint: one of hero|feature|spec|any (empty -> null)
 *   2. pnpm seed:unsplash
 *
 * Idempotent — upserts on `unsplash_id`. Runs outside Next.js via tsx and
 * reads env from .env.local directly.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { config as loadDotenv } from "dotenv";
import { z } from "zod";
import {
  UNSPLASH_CATEGORIES,
  SLOT_HINTS,
} from "../../lib/unsplash/categories";

loadDotenv({ path: resolve(process.cwd(), ".env.local") });

const CSV_PATH = resolve(process.cwd(), "db/seed/unsplash-seed.csv");
const REQUIRED_HEADER = [
  "unsplash_id",
  "url_regular",
  "url_small",
  "photographer",
  "photographer_url",
  "category",
  "tags",
  "slot_hint",
] as const;

// Minimal CSV parser: handles double-quoted fields with embedded commas and
// doubled-quote escape (RFC 4180 subset).
function parseCsv(src: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (field.length || row.length) {
        row.push(field);
        rows.push(row);
      }
      row = [];
      field = "";
      if (c === "\r" && src[i + 1] === "\n") i++;
    } else {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim());
  for (const required of REQUIRED_HEADER) {
    if (!header.includes(required)) {
      throw new Error(`CSV missing required column: ${required}`);
    }
  }
  return rows.slice(1).map((cols) => {
    const obj: Record<string, string> = {};
    header.forEach((h, i) => {
      obj[h] = (cols[i] ?? "").trim();
    });
    return obj;
  });
}

const rowSchema = z.object({
  unsplash_id: z.string().min(1),
  url_regular: z.string().url(),
  url_small: z.string().url(),
  photographer: z.string().min(1),
  photographer_url: z.string().url(),
  category: z.enum(UNSPLASH_CATEGORIES),
  tags: z
    .string()
    .transform((s) => s.split("|").map((t) => t.trim()).filter(Boolean)),
  slot_hint: z
    .string()
    .transform((s) => (s === "" ? null : s))
    .pipe(z.enum(SLOT_HINTS).nullable()),
});

async function main() {
  if (!existsSync(CSV_PATH)) {
    console.error(`CSV not found: ${CSV_PATH}`);
    console.error("See header comment for the required schema.");
    process.exit(1);
  }
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
    process.exit(1);
  }

  const raw = parseCsv(readFileSync(CSV_PATH, "utf8"));
  const rows = raw.map((r, idx) => {
    const parsed = rowSchema.safeParse(r);
    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((i) => `    ${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("\n");
      throw new Error(`row ${idx + 2} invalid:\n${issues}`);
    }
    return parsed.data;
  });
  console.log(`Parsed ${rows.length} rows. Upserting...`);

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase
    .from("unsplash_images")
    .upsert(rows, { onConflict: "unsplash_id" });

  if (error) {
    console.error("Upsert failed:", error);
    process.exit(1);
  }
  console.log(`Upserted ${rows.length} rows into unsplash_images.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
