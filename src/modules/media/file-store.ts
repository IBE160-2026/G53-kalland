import { createReadStream, createWriteStream } from "node:fs";
import { access, mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import type { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { requireEnv } from "@/db/client";
import { NotFound } from "@/modules/shared/errors";

// The one storage interface (AD-15), used only by the media module. Keys are app-generated
// (`tmp/<uuid>`, `originals/<fileVersionId>`, `derived/<fileVersionId>/<kind>`), never from a file name.
export interface FileStore {
  // Writes a new file from a stream. A failed write leaves nothing behind.
  put(key: string, source: AsyncIterable<Uint8Array> | Readable): Promise<void>;
  get(key: string): Promise<Readable>;
  move(from: string, to: string): Promise<void>;
  // Deleting a missing key is a no-op.
  delete(key: string): Promise<void>;
  clearPrefix(prefix: string): Promise<void>;
  // A local path to the file for tools that only read files (sharp, ExifTool). Read only.
  localPath(key: string): Promise<string>;
}

const KEY = /^[a-z0-9-]+(\/[a-z0-9-]+)*$/;

function assertKey(key: string): void {
  if (!KEY.test(key)) throw new Error(`Invalid file store key: ${key}`);
}

// v1: local disk, on the Docker volume at FILE_STORE_DIR.
export class LocalFileStore implements FileStore {
  constructor(private readonly root: string) {}

  private pathOf(key: string): string {
    assertKey(key);
    return path.join(this.root, key);
  }

  async put(key: string, source: AsyncIterable<Uint8Array> | Readable): Promise<void> {
    const file = this.pathOf(key);
    await mkdir(path.dirname(file), { recursive: true });
    try {
      await pipeline(source, createWriteStream(file, { flags: "wx" }));
    } catch (error) {
      await rm(file, { force: true });
      throw error;
    }
  }

  async get(key: string): Promise<Readable> {
    return createReadStream(await this.localPath(key));
  }

  async move(from: string, to: string): Promise<void> {
    const target = this.pathOf(to);
    await mkdir(path.dirname(target), { recursive: true });
    await rename(this.pathOf(from), target);
  }

  async delete(key: string): Promise<void> {
    await rm(this.pathOf(key), { force: true });
  }

  async clearPrefix(prefix: string): Promise<void> {
    const trimmed = prefix.replace(/\/$/, "");
    await rm(this.pathOf(trimmed), { recursive: true, force: true });
  }

  async localPath(key: string): Promise<string> {
    const file = this.pathOf(key);
    try {
      await access(file);
    } catch {
      throw new NotFound();
    }
    return file;
  }
}

export function getFileStore(): FileStore {
  return new LocalFileStore(requireEnv("FILE_STORE_DIR"));
}
