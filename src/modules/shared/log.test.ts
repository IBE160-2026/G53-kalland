import { Writable } from "node:stream";
import { expect, it } from "vitest";
import { createLogger } from "./log";

function capture() {
  const lines: string[] = [];
  const stream = new Writable({
    write(chunk, _encoding, done) {
      lines.push(chunk.toString());
      done();
    },
  });
  return { logger: createLogger(stream), output: () => lines.join("") };
}

it("never logs passwords, tokens or cookies", () => {
  const { logger, output } = capture();
  logger.info({
    password: "secret-pw-top",
    token: "secret-tok-top",
    cookie: "secret-cookie-top",
    authorization: "secret-auth-top",
    "set-cookie": "secret-set-top",
    user: { email: "ida@agency.example", password: "secret-pw-nested", passwordHash: "secret-hash-nested" },
    session: { token: "secret-tok-nested", tokenHash: "secret-tokhash-nested" },
    req: { headers: { cookie: "secret-cookie-deep", authorization: "Bearer secret-auth-deep", "set-cookie": "secret-set-deep" } },
  });
  const text = output();
  expect(text).not.toContain("secret-");
  expect(text).toContain("[redacted]");
  expect(text).toContain("ida@agency.example");
});
