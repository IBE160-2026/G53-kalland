// One tab list and one search target per shell (UX-DR-6). Tabs for later surfaces are added with their stories.
export type Surface = "staff" | "client";

export type Tab = { href: string; labelKey: "library" | "upload" | "licences" | "overview" | "findImages" };

export const tabs: Record<Surface, readonly Tab[]> = {
  staff: [
    { href: "/library", labelKey: "library" },
    { href: "/upload", labelKey: "upload" },
    { href: "/licences", labelKey: "licences" },
  ],
  client: [
    { href: "/overview", labelKey: "overview" },
    { href: "/find-images", labelKey: "findImages" },
  ],
};

// Header search submits as a GET to this surface; it does not filter anything yet (1.4, 1.8).
export const searchTarget: Record<Surface, string> = {
  staff: "/library",
  client: "/find-images",
};

export const landingPath: Record<Surface, string> = {
  staff: "/library",
  client: "/overview",
};
