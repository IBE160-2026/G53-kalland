import { log } from "./log";

// Typed module errors (Conventions: Errors). Each carries a key into messages/en.json.
export abstract class ModuleError extends Error {
  abstract readonly status: number;
  constructor(readonly messageKey: string) {
    super(messageKey);
    this.name = new.target.name;
  }
}

export class NotFound extends ModuleError {
  readonly status = 404;
  constructor(messageKey = "errors.notFound") {
    super(messageKey);
  }
}

export class Forbidden extends ModuleError {
  readonly status = 403;
  constructor(messageKey = "errors.forbidden") {
    super(messageKey);
  }
}

export class Conflict extends ModuleError {
  readonly status = 409;
  constructor(messageKey = "errors.conflict") {
    super(messageKey);
  }
}

export class Validation extends ModuleError {
  readonly status = 422;
  constructor(messageKey = "errors.validation") {
    super(messageKey);
  }
}

export class Locked extends ModuleError {
  readonly status = 423;
  constructor(messageKey = "errors.locked") {
    super(messageKey);
  }
}

export const UNEXPECTED_KEY = "errors.unexpected";

export type FormState = { error?: string };

export function toHttpStatus(error: unknown): number {
  return error instanceof ModuleError ? error.status : 500;
}

// Maps a thrown error to the form state a Server Action returns. Unknown errors are logged and
// shown as the generic message, never with their own text.
export function toFormState(error: unknown): FormState {
  if (error instanceof ModuleError) return { error: error.messageKey };
  log.error({ err: error }, "Unexpected error in a Server Action");
  return { error: UNEXPECTED_KEY };
}
