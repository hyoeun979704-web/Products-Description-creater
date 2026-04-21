import { z } from "zod";
import { UNSPLASH_CATEGORIES } from "@/lib/unsplash/categories";

export const heroTextSchema = z.object({
  headline: z.string().min(1).max(40),
  sub: z.string().min(1).max(80),
});

export const featureItemSchema = z.object({
  title: z.string().min(1).max(20),
  content: z.string().min(1).max(100),
});

export const specItemSchema = z.object({
  label: z.string().min(1).max(20),
  value: z.string().min(1).max(40),
});

export const generationTextsSchema = z.object({
  hero: heroTextSchema,
  features: z.array(featureItemSchema),
  specs: z.array(specItemSchema),
  notice: z.string().max(300).default(""),
});

export const generationOutputSchema = z.object({
  category: z.enum(UNSPLASH_CATEGORIES),
  selected_template_id: z.string(),
  texts: generationTextsSchema,
});

export type HeroText = z.infer<typeof heroTextSchema>;
export type FeatureItem = z.infer<typeof featureItemSchema>;
export type SpecItem = z.infer<typeof specItemSchema>;
export type GenerationTexts = z.infer<typeof generationTextsSchema>;
export type GenerationOutput = z.infer<typeof generationOutputSchema>;

// Template-specific schema that narrows features/specs counts.
// Used by /api/analyze to validate Claude's JSON against the selected template.
export function textsSchemaFor(c: {
  features: { min: number; max: number };
  specs: { min: number; max: number };
}) {
  return z.object({
    hero: heroTextSchema,
    features: z.array(featureItemSchema).min(c.features.min).max(c.features.max),
    specs: z.array(specItemSchema).min(c.specs.min).max(c.specs.max),
    notice: z.string().max(300).default(""),
  });
}
