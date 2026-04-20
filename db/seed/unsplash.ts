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
 * The script upserts rows by `unsplash_id` — re-running is safe.
 * Runs outside Next.js (via tsx) and reads env from .env.local directly.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { config as loadDotenv } from "dotenv";
import {
  UNSPLASH_CATEGORIES,
  isUnsplashCategory,
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
];

function parseCsv(src: string): Record<string, string>[] {
  // Minimal CSV parser. Fields wrapped in double quotes may contain commas;
  // escape a quote by doubling it.
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

type Row = {
  unsplash_id: string;
  url_regular: string;
  url_small: string;
  photographer: string;
  photographer_url: string;
  category: string;
  tags: string[];
  slot_hint: string | null;
};

function validate(r: Record<string, string>, idx: number): Row {
  const missing = ["unsplash_id", "url_regular", "url_small", "photographer", "photographer_url", "category"]
    .filter((k) => !r[k]);
  if (missing.length) {
    throw new Error(`row ${idx + 2}: missing ${missing.join(", ")}`);
  }
  if (!isUnsplashCategory(r.category)) {
    throw new Error(
      `row ${idx + 2}: invalid category "${r.category}". Allowed: ${UNSPLASH_CATEGORIES.join(", ")}`
    );
  }
  const slot = r.slot_hint || null;
  if (slot && !["hero", "feature", "spec", "any"].includes(slot)) {
    throw new Error(`row ${idx + 2}: invalid slot_hint "${slot}"`);
  }
  return {
    unsplash_id: r.unsplash_id,
    url_regular: r.url_regular,
    url_small: r.url_small,
    photographer: r.photographer,
    photographer_url: r.photographer_url,
    category: r.category,
    tags: r.tags ? r.tags.split("|").map((t) => t.trim()).filter(Boolean) : [],
    slot_hint: slot,
  };
}

async function main() {
  if (!existsSync(CSV_PATH)) {
    console.error(`CSV not found: ${CSV_PATH}`);
    console.error("Create it with the header listed in the script header comment.");
    process.exit(1);
  }
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
    process.exit(1);
  }

  const src = readFileSync(CSV_PATH, "utf8");
  const raw = parseCsv(src);
  const rows = raw.map(validate);
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
