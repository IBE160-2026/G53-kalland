import pino, { type DestinationStream } from "pino";

const SECRET_KEYS = ["password", "passwordHash", "token", "tokenHash", "cookie", "authorization", '["set-cookie"]'];

function pathsFor(key: string): string[] {
  const nested = key.startsWith("[") ? key : `.${key}`;
  return [key, `*${nested}`, `*.*${nested}`];
}

// Never logs passwords, tokens or cookies (Conventions: Logging), at the top level or up to two levels deep.
export const REDACT_PATHS = SECRET_KEYS.flatMap(pathsFor);

export function createLogger(destination?: DestinationStream) {
  const options = { redact: { paths: REDACT_PATHS, censor: "[redacted]" } };
  return destination ? pino(options, destination) : pino(options);
}

export const log = createLogger();
