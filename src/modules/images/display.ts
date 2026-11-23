import messages from "../../../messages/en.json";

// The one title fallback for every list and page (Conventions: Display). Image text is untrusted and is
// only ever rendered as escaped React text.
export function displayTitle(title: string | null | undefined): string {
  const trimmed = title?.trim();
  return trimmed ? trimmed : messages.library.untitled;
}
