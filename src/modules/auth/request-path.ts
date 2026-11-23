// Set by src/proxy.ts to the request's path and query, so guards can build the Login return-to.
// Display only: it is validated by safeReturnTo before any redirect uses it.
export const REQUEST_PATH_HEADER = "x-crm-dam-path";
