"use server";

import { z } from "zod";
import { getDb } from "@/db/client";
import { requireStaff } from "@/modules/auth";
import { createUploadRows } from "@/modules/images";
import { toFormState } from "@/modules/shared/errors";
import { stripControlCharacters } from "@/modules/shared/text";

const filename = z
  .string()
  .transform((value) => stripControlCharacters(value))
  .pipe(z.string().min(1).max(255));

const startUploadInput = z.object({
  batchId: z.uuid().optional(),
  filenames: z.array(filename).min(1).max(500),
});

export type StartUploadResult =
  | { ok: true; batchId: string; images: { id: string; filename: string }[] }
  | { ok: false; error: string };

// Creates the batch (when there is none yet) and one `uploading` row per file, before any file is
// sent (AD-11). The files themselves go to the upload Route Handler, never through a Server Action.
export async function startUpload(input: { batchId?: string; filenames: string[] }): Promise<StartUploadResult> {
  const actor = await requireStaff();
  const parsed = startUploadInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "errors.validation" };
  try {
    return { ok: true, ...(await createUploadRows(getDb(), actor, parsed.data)) };
  } catch (error) {
    return { ok: false, error: toFormState(error).error ?? "errors.unexpected" };
  }
}
