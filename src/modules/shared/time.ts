// System timestamps are stored in UTC and shown in Europe/Oslo (Conventions: Time).
const osloDate = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Oslo", day: "numeric", month: "long", year: "numeric" });
const osloTime = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

// "25 November 2026, 14:05" in Oslo time, the same shape as the date taken on the Details panel.
export function formatOsloDateTime(value: Date): string {
  return `${osloDate.format(value)}, ${osloTime.format(value)}`;
}
