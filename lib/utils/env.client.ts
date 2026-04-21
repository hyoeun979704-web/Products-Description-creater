import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_TOSS_CLIENT_KEY: z.string().min(1).optional(),
});

const result = schema.safeParse({
  NEXT_PUBLIC_TOSS_CLIENT_KEY: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
});
if (!result.success) {
  const flat = result.error.flatten().fieldErrors;
  throw new Error(
    `Invalid client env:\n${Object.entries(flat)
      .map(([k, v]) => `  ${k}: ${(v ?? []).join(", ")}`)
      .join("\n")}`
  );
}

export const clientEnv = result.data;
