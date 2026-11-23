// The named seed users and clients (AD-7). Pure data, no imports: Playwright reads this file too.
// Demo data for development and tests only; the password is public on purpose (README).

export const DEMO_PASSWORD = "crm-dam-demo-2026";

export const fixtureClients = {
  fjordkaffe: { name: "Fjordkaffe AS", status: "active" },
  nordlys: { name: "Nordlys Sykkel AS", status: "active" },
  gammelKunde: { name: "Gammel Kunde AS", status: "inactive" },
} as const;

export type FixtureClientKey = keyof typeof fixtureClients;

export type FixtureUser =
  | { role: "staff"; name: string; email: string }
  | { role: "contact"; client: FixtureClientKey; name: string; email: string };

export const fixtureUsers = {
  ida: { role: "staff", name: "Ida Berg", email: "ida@agency.example" },
  per: { role: "staff", name: "Per Lund", email: "per@agency.example" },
  jonas: { role: "contact", client: "fjordkaffe", name: "Jonas Fjell", email: "jonas@fjordkaffe.example" },
  kari: { role: "contact", client: "fjordkaffe", name: "Kari Vik", email: "kari@fjordkaffe.example" },
  emil: { role: "contact", client: "nordlys", name: "Emil Strand", email: "emil@nordlys.example" },
  liv: { role: "contact", client: "gammelKunde", name: "Liv Moe", email: "liv@gammelkunde.example" },
} as const satisfies Record<string, FixtureUser>;
