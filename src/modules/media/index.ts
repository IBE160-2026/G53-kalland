// Public API of the media module (AD-3, AD-15, AD-16): file storage, derived files and embedded metadata.
// Owns no tables. Only media reaches the FileStore.
export { makeAiInput } from "./ai-input";
export { MediaRejected, type MediaRejectionReason } from "./errors";
export { type EmbeddedMetadata } from "./embedded";
export {
  clearTempFiles,
  discardUploadFiles,
  openDerivedFile,
  readStagedMetadata,
  stageDerivedFiles,
  storeStagedFiles,
  type DerivedKind,
  type StagedUpload,
} from "./files";
export { MAX_UPLOAD_BYTES, receiveUpload, type ReceivedFile } from "./receive";
export { type ImageMediaType } from "./sniff";
