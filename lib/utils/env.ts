import { z } from "zod";

const serverSchema = z.object({
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

const clientSchema = z.object({
  NEXT_PUBLIC_TOSS_CLIENT_KEY: z.string().min(1).optional(),
});

function parse<T extends z.ZodTypeAny>(schema: T, source: Record<string, string | undefined>): z.infer<T> {
  const result = schema.safeParse(source);
  if (!result.success) {
    const flat = result.error.flatten().fieldErrors;
    throw new Error(
      `Invalid environment variables:\n${Object.entries(flat)
        .map(([k, v]) => `  ${k}: ${(v ?? []).join(", ")}`)
        .join("\n")}`
    );
  }
  return result.data;
}

export const serverEnv = parse(serverSchema, {
  NODE_ENV: process.env.NODE_ENV,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SESSION_COOKIE_SECRET: process.env.SESSION_COOKIE_SECRET,
  IP_HASH_SALT: process.env.IP_HASH_SALT,
  TOSS_SECRET_KEY: process.env.TOSS_SECRET_KEY,
  TOSS_CLIENT_KEY: process.env.TOSS_CLIENT_KEY,
  WATERMARK_ENABLED: process.env.WATERMARK_ENABLED,
});

export const clientEnv = parse(clientSchema, {
  NEXT_PUBLIC_TOSS_CLIENT_KEY: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
});
