# Digest A — Node metadata libraries (round 1)

## Claims
- claim: exiftool-vendored latest is 39.0.1, published 2026-10-06, MIT, single npm maintainer (mceachen), unpacked size about 1.9 MB | src: https://registry.npmjs.org/exiftool-vendored/latest (also `npm view`) | publisher: npm registry | pub_date: 2026-10 | accessed: 2026-10-28 | conf: high | class: version
- claim: exiftool-vendored 39.0.1 declares `engines: node >=22`, but INSTALLATION.md still says Node 20+ (Active/Maintenance LTS), so the two disagree | src: https://raw.githubusercontent.com/photostructure/exiftool-vendored.js/HEAD/docs/INSTALLATION.md | publisher: PhotoStructure (GitHub) | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: install
- claim: ExifTool reaches users through optionalDependencies, `exiftool-vendored.pl` 13.59.3 (os `!win32`, about 21.6 MB unpacked) and `exiftool-vendored.exe` 13.59.3 (os `win32`, about 34.6 MB unpacked), both published 2026-09-24 | src: https://registry.npmjs.org/exiftool-vendored/latest ; `npm view exiftool-vendored.exe/.pl` | publisher: npm registry | pub_date: 2026-09 | accessed: 2026-10-28 | conf: high | class: install
- claim: On macOS/Linux the vendored package is the Perl script and uses system Perl; the guide says most distros need nothing extra, but minimal images (Alpine, Debian slim, node:*-slim) need `perl` installed | src: https://raw.githubusercontent.com/photostructure/exiftool-vendored.js/HEAD/docs/INSTALLATION.md | publisher: PhotoStructure | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: install
- claim: The Windows package uses the official ExifTool Windows distribution (12.88+), which relies on Oliver Betz's portable launcher plus Strawberry Perl; the page does not say outright that Perl is bundled | src: https://github.com/photostructure/exiftool-vendored.exe | publisher: PhotoStructure | pub_date: current docs | accessed: 2026-10-28 | conf: medium | class: install
- claim: An older ExifTool forum thread says macOS has no binary ExifTool ("it is all Perl") and raises Apple possibly dropping bundled Perl in the future | src: https://exiftool.org/forum/index.php?msg=54997 | publisher: exiftool.org forum | pub_date: 2019 | accessed: 2026-10-28 | conf: low | class: install
- claim: exiftool-vendored runs ExifTool as pooled child processes (`maxProcs`); workers no longer keep Node alive after awaited work, `await exiftool.end()` is recommended for cleanup, a SIGKILL cannot clean up, and startup can take seconds | src: https://github.com/photostructure/exiftool-vendored.js | publisher: PhotoStructure | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: install
- claim: exiftool-vendored writes group-prefixed tags (e.g. `IPTC:CopyrightNotice`), deletes a tag when it is set to `null`, and has `editTags()` for list and structured values | src: https://github.com/photostructure/exiftool-vendored.js | publisher: PhotoStructure | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: capability
- claim: ExifTool deletes a whole group with `-GROUP:all=`, and deleting EXIF/IFD0 also removes the GPS IFD | src: https://exiftool.org/exiftool_pod.html | publisher: Phil Harvey / exiftool.org | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: capability
- claim: ExifTool's `-o` writes to a new output file and leaves the source untouched, and without `-o` the original is kept as `FILE_original` | src: https://exiftool.org/exiftool_pod.html | publisher: exiftool.org | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: capability
- claim: ExifTool lists HEIC, HEIF, AVIF, PNG, WebP and JXL as read/write | src: https://exiftool.org/exiftool_pod.html | publisher: exiftool.org | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: capability
- claim: sharp latest is 0.35.5, published 2026-09-27, Apache-2.0, node >=20.9.0 | src: `npm view sharp` (registry.npmjs.org) | publisher: npm registry | pub_date: 2026-09 | accessed: 2026-10-28 | conf: high | class: version
- claim: sharp strips all metadata by default; keepMetadata/keepExif/withExif/withExifMerge (0.33+) and keepXmp/withXmp (0.34.3+) let you keep or set EXIF and an arbitrary XMP string (PNG/JPEG/WebP/TIFF) | src: https://sharp.pixelplumbing.com/api-output | publisher: sharp docs | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: capability
- claim: sharp documents no way to write IPTC; IPTC can only be kept from the input | src: https://sharp.pixelplumbing.com/api-output | publisher: sharp docs | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: capability
- claim: sharp always decodes and re-encodes, so it cannot change metadata without touching the pixels; the maintainer says to use another tool and points to exiftool-vendored | src: https://github.com/lovell/sharp/issues/3327 | publisher: lovell/sharp | pub_date: 2022-08 | accessed: 2026-10-28 | conf: high | class: capability
- claim: The maintainer repeated in a later issue that sharp always does a decode/encode round trip, and its EXIF parsing comes from libexif, which treats IPTC/XMP as raw blobs | src: https://github.com/lovell/sharp/issues/4011 ; https://github.com/lovell/sharp/issues/4033 | publisher: lovell/sharp | pub_date: 2024 (approx.) | accessed: 2026-10-28 | conf: medium | class: capability
- claim: exifr is read-only and reads EXIF/GPS, IPTC (JPEG/TIFF), XMP (JPEG/TIFF/PNG) and ICC; IPTC and XMP are not supported for HEIF | src: https://github.com/MikeKovarik/exifr | publisher: GitHub | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: capability
- claim: exifr's latest version 7.1.3 dates from 2021-08-05, with 53 open issues and 13 open PRs, so it looks dormant | src: `npm view exifr time` ; https://github.com/MikeKovarik/exifr | publisher: npm / GitHub | pub_date: 2021-08 | accessed: 2026-10-28 | conf: high | class: maintenance
- claim: ExifReader 4.52.0, released 2026-10-23, is MPL-2.0 with one maintainer | src: `npm view exifreader` | publisher: npm registry | pub_date: 2026-10 | accessed: 2026-10-28 | conf: high | class: version
- claim: ExifReader reads Exif, IPTC, XMP, ICC and expanded GPS from JPEG, JXL, TIFF, PNG, HEIC/HEIF, AVIF, WebP and GIF; it is read-only, and XMP in Node needs `@xmldom/xmldom` >= 0.9.12 | src: https://github.com/mattiasw/ExifReader | publisher: GitHub | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: capability
- claim: piexifjs 1.0.6 dates from 2019-06-21 and describes itself as "Read and write exif" | src: `npm view piexifjs` | publisher: npm registry | pub_date: 2019-06 | accessed: 2026-10-28 | conf: high | class: maintenance
- claim: @uswriting/exiftool 1.0.9 (2025-12-05, Apache-2.0) is ExifTool 13.42 compiled to WASM via zeroperl, has `writeMetadata()` returning the modified bytes, and claims to need "no native binaries or system dependencies" | src: https://github.com/6over3/exiftool ; `npm view @uswriting/exiftool` | publisher: GitHub / npm | pub_date: 2025-12 | accessed: 2026-10-28 | conf: medium | class: capability
- claim: @uswriting/exiftool is small and early (28 commits, 9 open issues, 91 stars, no tagged releases), and its README shows only a browser example | src: https://github.com/6over3/exiftool | publisher: GitHub | pub_date: current | accessed: 2026-10-28 | conf: medium | class: maintenance
- claim: exiv2-wasm 0.5.13 (2025-08-29, MIT, about 5 MB) says it reads and writes EXIF/IPTC/XMP "in the browser" | src: `npm view exiv2-wasm` | publisher: npm registry | pub_date: 2025-08 | accessed: 2026-10-28 | conf: low | class: capability
- claim: `node-exiv2` does not exist on npm (404) | src: https://registry.npmjs.org/node-exiv2 | publisher: npm registry | pub_date: current | accessed: 2026-10-28 | conf: high | class: maintenance

## Capability table
| library | version (date) | read EXIF/IPTC/XMP | write IPTC/XMP | selective GPS strip | lossless (no re-encode) | formats | licence | install notes |
|---|---|---|---|---|---|---|---|---|
| exiftool-vendored | 39.0.1 (2026-10-06) | yes/yes/yes | yes/yes | yes (`null` per tag; group delete in ExifTool) | yes (ExifTool rewrites metadata only; not stated outright on the docs read) | JPEG, HEIC/HEIF, AVIF, PNG, TIFF, WebP, RAW | MIT | Node >=22 (engines); about 22 MB (.pl, uses system Perl) or about 35 MB (.exe, Windows); child processes |
| sharp | 0.35.5 (2026-09-27) | EXIF parsed; IPTC/XMP as raw buffers | IPTC no; XMP yes (whole string) | no per-tag (EXIF merge only) | no, always re-encodes | JPEG, PNG, WebP, TIFF, AVIF, GIF (HEIC not checked) | Apache-2.0 | prebuilt libvips binaries |
| exifr | 7.1.3 (2021-08) | yes/yes (JPEG/TIFF)/yes | no | n/a | n/a | JPEG, TIFF, HEIC, AVIF, PNG | MIT | pure JS; dormant |
| ExifReader | 4.52.0 (2026-10-23) | yes/yes/yes | no | n/a | n/a | JPEG, JXL, TIFF, PNG, HEIC, AVIF, WebP, GIF | MPL-2.0 | pure JS; needs xmldom for XMP |
| piexifjs | 1.0.6 (2019-06) | EXIF only (believed) | no (believed) | EXIF GPS IFD (believed) | believed yes, JPEG | JPEG (believed) | MIT | pure JS; stale |
| @uswriting/exiftool | 1.0.9 (2025-12-05) | yes (ExifTool 13.42) | yes (claimed) | probably, same tag syntax | probably | ExifTool set (unverified) | Apache-2.0 | WASM, no Perl; Node use unproven |
| exiv2-wasm | 0.5.13 (2025-08) | claimed | claimed | unknown | unknown | unknown | MIT | browser-focused |

## Leads worth chasing
- Check what `exiftool-vendored.exe` 13.59.3 contains and whether Windows Defender flags it (search its issue tracker).
- Find out whether `-gps:all=` also removes XMP GPS tags (`XMP-exif:GPS*`) and IPTC/XMP location fields; ExifTool FAQ / `-geotag=` / `-location:all=` docs. This is the key to a full GPS strip.
- Check what exiftool-vendored's `write()` defaults to (`-overwrite_original`?) and whether `writeArgs: ['-o', ...]` or copy-then-write is the documented pattern.
- Test @uswriting/exiftool in Node: where it loads the WASM from (CDN or bundled), performance, IPTC/XMP write round-trip.
- Find out whether the prebuilt sharp 0.35 decodes HEIC (HEVC licensing).
- Check whether macOS 15/16 still ships `/usr/bin/perl`, which is load-bearing for the examiner burden.

## Looked for but not found
- No pure-JS library in this round both writes IPTC/XMP and strips GPS without re-encoding; exifr and ExifReader are read-only, and piexifjs is EXIF/JPEG-only and stale (from its npm description; README not read).
- No explicit statement that ExifTool edits leave the image data byte-identical (the pod page only discusses "unsafe" tags).
- No antivirus or install-failure notes in the exiftool-vendored docs I read; the issue tracker was not searched.
- `node-exiv2` on npm; `@mtillmann/exiftool-wasm` (404).
- The minimum Perl version for exiftool-vendored.
