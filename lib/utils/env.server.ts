import "server-only";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SESSION_COOKIE_SECRET: z.string().min(32).optional(),
  IP_HASH_SALT: z.string().min(16).optional(),
  TOSS_SECRET_KEY: z.string().min(1).optional(),
  TOSS_CLIENT_KEY: z.string().min(1).optional(),
  WATERMARK_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
});

// Fields stay optional during MVP so earlier steps run without later secrets.
// Consumers that need a specific secret (e.g. lib/supabase/server.ts) assert
// presence at point of use with a clear error message.
const result = schema.safeParse(process.env);
if (!result.success) {
  const flat = result.error.flatten().fieldErrors;
  throw new Error(
    `Invalid server env:\n${Object.entries(flat)
      .map(([k, v]) => `  ${k}: ${(v ?? []).join(", ")}`)
      .join("\n")}`
  );
}

export const serverEnv = result.data;
