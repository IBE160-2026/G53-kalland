// "1 June 2024, 14:05" from the date taken as captured (no time zone conversion).
export function formatDateTaken(value: string): string {
  const [date, time] = value.split(/[ T]/);
  const [year, month, day] = date.split("-").map(Number);
  const formatted = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day)));
  return time ? `${formatted}, ${time.slice(0, 5)}` : formatted;
}

// "Canon EOS R5" rather than "Canon Canon EOS R5" when the model already names the make.
export function cameraName(make: string | null, model: string | null): string | null {
  if (make && model) return model.toLowerCase().startsWith(make.toLowerCase()) ? model : `${make} ${model}`;
  return make ?? model;
}
