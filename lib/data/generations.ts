import type { GenerationOutput } from "@/lib/claude/schema";
import type { PlatformId } from "@/lib/platforms/types";
import { FIXTURE_GENERATIONS } from "@/lib/fixtures/generations";

export type GenerationPhoto = {
  url: string;
  width: number;
  height: number;
};

export type Generation = {
  id: string;
  sessionId: string;
  platform: PlatformId;
  inputPhotos: GenerationPhoto[];
  outputJson: GenerationOutput;
  editedJson: GenerationOutput | null;
  createdAt: string;
};

export type GenerationStore = {
  getById(id: string): Promise<Generation | null>;
  saveEdits(id: string, edited: GenerationOutput): Promise<void>;
};

// In-memory store seeded from fixtures. Edits persist for the lifetime of the
// server process only — good enough for manual QA until Supabase is wired in.
const memory: Record<string, Generation> = Object.fromEntries(
  Object.values(FIXTURE_GENERATIONS).map((g) => [
    g.id,
    {
      id: g.id,
      sessionId: g.session_id,
      platform: g.platform,
      inputPhotos: g.input_photos,
      outputJson: g.output_json,
      editedJson: g.edited_json,
      createdAt: g.created_at,
    } satisfies Generation,
  ])
);

export const generationStore: GenerationStore = {
  async getById(id) {
    return memory[id] ?? null;
  },
  async saveEdits(id, edited) {
    const row = memory[id];
    if (!row) throw new Error(`generation not found: ${id}`);
    memory[id] = { ...row, editedJson: edited };
  },
};
