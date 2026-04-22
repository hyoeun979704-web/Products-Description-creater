import type { GenerationOutput } from "@/lib/claude/schema";
import type { PlatformId } from "@/lib/platforms/types";
import type { ResolvedSlot } from "@/components/templates/registry";
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
  /**
   * Persisted slot → image override from the editor. Empty object means
   * "use the default resolveSlots()". Non-empty means "user has customized
   * the image layout; honor this exactly and skip auto-resolution".
   */
  imageSlots: Record<string, ResolvedSlot>;
  createdAt: string;
};

export type GenerationEditPatch = {
  edited?: GenerationOutput;
  imageSlots?: Record<string, ResolvedSlot>;
};

export type GenerationStore = {
  getById(id: string): Promise<Generation | null>;
  saveEdits(id: string, patch: GenerationEditPatch): Promise<void>;
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
      imageSlots: g.image_slots,
      createdAt: g.created_at,
    } satisfies Generation,
  ])
);

export const generationStore: GenerationStore = {
  async getById(id) {
    return memory[id] ?? null;
  },
  async saveEdits(id, patch) {
    const row = memory[id];
    if (!row) throw new Error(`generation not found: ${id}`);
    memory[id] = {
      ...row,
      editedJson: patch.edited ?? row.editedJson,
      imageSlots: patch.imageSlots ?? row.imageSlots,
    };
  },
};
