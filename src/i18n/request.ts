import { getRequestConfig } from "next-intl/server";

// English only in v1 (NFR-8); no locale segment in URLs.
export default getRequestConfig(async () => ({
  locale: "en",
  messages: (await import("../../messages/en.json")).default,
}));
