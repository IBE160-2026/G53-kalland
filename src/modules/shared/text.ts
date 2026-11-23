// Embedded metadata, AI output and upload file names are untrusted text (AD-16). Control characters
// (C0 and C1, including DEL) are removed before the text is stored. A multi-line field keeps its line
// breaks; in a one-line field, line breaks and tabs become spaces. The result is trimmed.
const CONTROL_EXCEPT_TAB_AND_NEWLINE = /[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g;

export function stripControlCharacters(value: string, { multiline = false } = {}): string {
  const lines = value.replace(/\r\n?/g, "\n");
  const flat = multiline ? lines : lines.replace(/[\t\n]+/g, " ");
  return flat.replace(CONTROL_EXCEPT_TAB_AND_NEWLINE, "").trim();
}

// The longest alt text a field may hold (Conventions: Validation). One shared constant.
export const ALT_TEXT_MAX = 250;
