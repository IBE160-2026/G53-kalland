// Why media refused a file. The images module turns these into NFR-7 rejection messages.
export type MediaRejectionReason = "notImage" | "tooLarge" | "damaged" | "unsafePreview";

export class MediaRejected extends Error {
  constructor(
    readonly reason: MediaRejectionReason,
    options?: ErrorOptions,
  ) {
    super(`File rejected: ${reason}`, options);
    this.name = "MediaRejected";
  }
}
