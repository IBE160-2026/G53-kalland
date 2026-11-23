// The content decides the type, never the extension or Content-Type (FR-8).
export type ImageMediaType = "image/jpeg" | "image/png";

const JPEG = [0xff, 0xd8, 0xff];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

// Bytes needed to decide.
export const SNIFF_BYTES = PNG.length;

function startsWith(head: Uint8Array, signature: number[]): boolean {
  return head.length >= signature.length && signature.every((byte, i) => head[i] === byte);
}

export function sniffMediaType(head: Uint8Array): ImageMediaType | null {
  if (startsWith(head, JPEG)) return "image/jpeg";
  if (startsWith(head, PNG)) return "image/png";
  return null;
}
