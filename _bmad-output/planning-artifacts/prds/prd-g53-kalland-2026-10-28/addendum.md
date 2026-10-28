# Addendum: CRM-DAM PRD

Depth that belongs downstream (architecture, UX) rather than in the PRD. The [brief's addendum](../../briefs/brief-g53-kalland-2026-09-11/addendum.md) still holds for the access-model data shape, the client model and the Tripletex notes.

## Data model accommodations added on 2026-10-28

| Later feature | v1 accommodation |
|---|---|
| More licence types, each with its own price (e.g. Standard commercial 5 USD, Extended commercial 8 USD) | Licence types are records with a price and a licence text, not a constant; an image is only free or paid |
| Licence types included for free for a given organisation | Room for an organisation–licence-type relation; not built in v1 |
| Display currencies chosen by the agency and each organisation | Every price and licence stores a currency code (USD in v1); licences store the price in the base currency |
| Private batches | Batches are records with an owner, even though all drafts are shared in v1 |

## AI provider (from the Haiku pilot)

- v1 real provider: Claude Haiku 5.5 at effort `medium` with prompt v2, structured JSON output. Median 5.9 s, about $0.0007 per image. See [pilot results](../../research/pilot-haiku-metadata-2026-10-28/results.md).
- The pilot validated Norwegian output; v1 generates English. Norwegian must be re-tested when the Norwegian pack arrives, since it matters most to the agency.
- The app owns the prompt and schema, post-processes every provider's output and passes a place name it derived itself. Stage 2: Gemini Flash and a local model through the same interface.

## Metadata contract (from the metadata-library research)

Title → `dc:title` / IIM 2:05; description → `dc:description` / IIM 2:120 / EXIF `ImageDescription`; alt-text → `Iptc4xmpCore:AltTextAccessibility`; keywords → `dc:subject` / IIM 2:25 with UTF-8. Client copies are rebuilt from a whitelist and checked with the location checklist in the [research](../../research/technical-metadata-libraries-2026-10-28/research.md), section C.

## Upload size

50 MB covers full-frame camera JPEGs at the highest quality (about 15–40 MB at 45–61 MP). Full-resolution PNGs above 50 MB are rejected in v1. The AI provider receives a copy resized to about 1568 px.

## Settled for the architecture

- **Metadata is generated in the background** after upload (FR-12). This closes the open question in the pilot results and D-021.
- **Client copies are rebuilt from a whitelist** (FR-29): the agency's fields, camera EXIF, date taken and the colour profile are copied in; everything else, including all location fields and thumbnails, is left out. The same pipeline produces previews and the image-page view.
- **Edit locks on images and batches** (FR-14): editing an image locks that image and its batch's settings; editing a batch locks the batch and every image in it. One user at a time either way.
