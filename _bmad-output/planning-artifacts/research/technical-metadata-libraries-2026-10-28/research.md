---
title: 'Technical research: metadata libraries for read, write-on-export and GPS stripping'
type: 'technical'
topic: 'Metadata libraries for EXIF/IPTC/XMP read, write-on-export and GPS stripping'
decision: 'Which metadata library v1 uses, and whether an exiftool dependency is acceptable for the examiner'
source: 'native run (3 web researchers + local experiments)'
status: complete
preset: 'standard'
validation: 'normal'
created: '2026-10-28'
updated: '2026-10-28'
claims_verified: 7
claims_unverified: 4
claims_disputed: 1
---

# Technical research: metadata libraries for read, write-on-export and GPS stripping

**Decision this research serves:** which library v1 uses to read EXIF/IPTC/XMP on upload, write edited title, description, alt text and keywords into the downloaded copy, and strip location data from that copy, and whether depending on `exiftool` is acceptable for the examiner. Shape: select between candidates in both Node and Python, because the stack is not chosen yet.

## Executive summary

**Use ExifTool, through `exiftool-vendored` if the stack is Node.** It is the only candidate that passes every gate with no extra install step. `npm i exiftool-vendored` brings ExifTool with it (Perl script on macOS/Linux using the system Perl, bundled Perl on Windows), and installed in ~1.4 s here with nothing else to do [1][2][4][30]. It reads and writes EXIF, IPTC and XMP, including HEIC/WebP/PNG [5][6]. It writes to a copy, and the image data stays byte-identical [5][7][30]. So the answer to "exiftool yes/no" is **yes, as long as the examiner never has to install it by hand**. That holds on Node and does not hold on Python.

Three findings drive this:

1. **"Strip GPS" is three operations, not one.** `-gps:all=` removes only the EXIF GPS block. Coordinates in XMP and city names in IPTC/XMP survive. This was shown locally and is backed by the ExifTool docs and author [8][9][30]. A client copy needs `"-gps*=" -location:all=`, or better a whitelist rebuild, to leave nothing behind [30].
2. **Nothing short of ExifTool or Exiv2 can do a lossless metadata write.** sharp and Pillow always re-encode the pixels and cannot write IPTC [13][14][24]. exifr and ExifReader are read-only [16][17]. piexif, piexifjs and `exif` handle EXIF only [26][27][32].
3. **On Python the zero-install path is GPL and lower-level.** pyexiv2's macOS wheel is not self-contained: it needs Homebrew's gettext, brotli and inih [30]. python-exiv2 works from a wheel, but it is GPL-3.0, has a SWIG-style API and one maintainer [23][30]. PyExifTool needs a system ExifTool and has not been released since 2023 [19][20].

**Biggest caveat:** Windows was not tested hands-on. The claim that exiftool-vendored's Windows package bundles Perl rests on ExifTool's and PhotoStructure's documentation [4][6], not a run.

## A. Node candidates

**exiftool-vendored** 39.0.1 (2026-10-06, MIT) wraps ExifTool 13.59 [1]. It pulls ExifTool in as an optional dependency per OS: `exiftool-vendored.pl` (~22 MB) on macOS/Linux and `exiftool-vendored.exe` (~35 MB) on Windows [1]. The .pl package uses the system Perl. That is present on stock macOS (macOS 26.5.2 ships `/usr/bin/perl` 5.34.1 [30]) and on most Linux distributions, but has to be installed on slim/Alpine Docker images [2]. The Windows package uses the official ExifTool Windows distribution, which bundles Perl [4][6]. It runs ExifTool as a pool of child processes; call `await exiftool.end()` on shutdown [3]. Tags are written group-prefixed, and setting a tag to `null` deletes it [3]. The package declares `node >=22`, while its install guide still says Node 20+ (a minor conflict; Node 22+ is safe) [1][2]. One maintainer (low-medium bus-factor risk).

**sharp** 0.35.5 (Apache-2.0) strips all metadata by default and can set EXIF and a whole XMP string, but it **cannot write IPTC** [13]. It **always decodes and re-encodes**, and its maintainer points users to exiftool-vendored for metadata-only edits [14][15]. It stays useful for thumbnails and previews, not for metadata.

**exifr** 7.1.3 is read-only and has been dormant since 2021 [16]. **ExifReader** 4.52.0 (2026-10-23, MPL-2.0) is read-only but current, and covers HEIC/AVIF/WebP/JXL [17]. It is a fallback reader only. **piexifjs** 1.0.6 (2019) is EXIF-only and stale [32].

**@uswriting/exiftool** 1.0.9 (Apache-2.0) is ExifTool 13.42 compiled to WASM: no Perl and no native binaries, with `writeMetadata()` returning bytes [18]. It is young (28 commits, no tagged releases) and its README shows only a browser example, so use in Node is unproven [18] (confidence medium). It is a wildcard to watch, not a v1 pick.

## B. Python candidates

**PyExifTool** 0.5.6 (2023-10, BSD/GPL dual) is a thin wrapper that needs a system ExifTool ≥ 12.15 on PATH and keeps one `-stay_open` process [19][20]. Installing ExifTool is a separate step per OS: a Windows zip with renaming and a PATH entry, a macOS .pkg that needs a Gatekeeper "Open Anyway" on macOS 15+, and a Linux tarball or package [11]. There has been no release in three years, and its `ExifToolAlpha` class is flagged as poorly tested [20] (maintenance risk).

**pyexiv2** 2.16.0 (2026-08, GPLv3) reads and writes EXIF/IPTC/XMP through Exiv2 [21]. PyPI advertises wheels for CPython 3.8–3.14 with no system libexiv2 [21]. **However, the macOS arm64 wheel links Homebrew's `libintl`, `brotli` and `inih` by absolute path, and `import pyexiv2` fails without them** [30]. The README mentions no system libraries [22]. It is not thread-safe, and files over 1 GB cannot be modified [21]. Linux and Windows wheels were not tested.

**python-exiv2** (`exiv2` 0.19.2, GPL-3.0-or-later) bundles libexiv2 in its wheels [23]. Here it installed and worked with no system libraries: erasing GPS/City/Location keys in EXIF, XMP and IPTC and writing XMP title and alt text left no location data and an unchanged image-data hash [30]. Its API mirrors the C++ library (key objects, `findKey`/`erase`), which costs more code and is less familiar to Claude Code. PyPI and GitHub disagree on the latest version (0.19.2 vs 0.20.0), and it has one maintainer [23] (confidence low on version). HEIC/BMFF support in Exiv2 depends on a build flag, and HEIC write is unconfirmed [31].

**Pillow** 13.0.0 can read EXIF/IPTC/XMP and write EXIF and XMP (JPEG since 11.0, WebP), but **cannot write IPTC**, and saving goes through the encoder [24][25] (re-encode inferred from the docs, confidence medium). **piexif** (2019, EXIF only, stale) and **exif** 1.6.1 (EXIF only, can delete GPS attributes) fail the IPTC/XMP write gate [26][27].

## C. Standards, field mapping and where location hides

The current standard is **IPTC Photo Metadata 2025.1** (Core 1.5, Extension 1.9) [28]. It says values should be written in **both IIM and XMP** [28]. Mapping for the app's fields [28][10]:

| App field | XMP | IPTC-IIM | EXIF | Notes |
|---|---|---|---|---|
| Title | `dc:title` | 2:05 Object Name (64 bytes) | — | IIM limits are bytes, so æøå count double [28] |
| Description | `dc:description` | 2:120 Caption/Abstract (2000 bytes) | IFD0 `ImageDescription` | MWG keeps all three in sync; ExifTool's `MWG:Description` writes them together [10][30] |
| Alt text | `Iptc4xmpCore:AltTextAccessibility` | none | none | Added in 2021.1; ≤ 250 characters; XMP only [28] |
| Keywords | `dc:subject` | 2:25 Keywords (64 bytes each) | — | Set IIM `CodedCharacterSet=UTF8`, or readers fall back to cp1252 [7][30] |

Embedded alt text is now read by WordPress 7.0 (May 2026), Adobe CC, Photo Mechanic and Fotoware [29], so writing it is useful to the agency's clients, not just tidy.

**HEIC and WebP cannot carry IPTC-IIM at all**, only EXIF and XMP [6]. XMP is therefore the field set that must always be written; IIM is added where the format allows it.

**Where location hides** (each must be cleared for a client copy) [8][9][28][30]:
- EXIF GPS IFD: removed by `-gps:all=`.
- XMP `exif:GPS*`: **not** removed by `-gps:all=` [9][30]; needs `"-gps*="`.
- IPTC/XMP location text: `IPTC:City` / Sub-location / State / Country, `photoshop:City`, `Iptc4xmpCore:Location`. Not removed by `"-gps*="` [30]; needs `-location:all=`.
- XMP `Iptc4xmpExt:LocationShown` / `LocationCreated`. These structures carry their own GPS sub-fields [28] and need `-location:all=` or `-XMP-iptcExt` handling [30].
- The EXIF thumbnail (IFD1) and preview images can survive GPS removal and may show the uncropped original [9] (low confidence, forum sources). Remove them with `-ThumbnailImage= -PreviewImage=` or by whitelisting.
- Maker notes go with the EXIF block in JPEG and cannot be edited tag by tag [5][7].
- ExifTool itself warns that removal is incomplete for TIFF (some IFD0 stays), PNG (only some chunks) and MOV/MP4 [6].

ExifTool `-o OUT` writes a new file and never touches the source [5]. Edits are lossless for image data [7]. Locally, the source SHA-256 and `ImageDataHash` were unchanged across every run [30].

## Verdict: decision matrix

Hard gates: G1 reads EXIF/IPTC/XMP · G2 writes IPTC/XMP into a copy without re-encoding · G3 can clear all location data · G4 OSS, maintained, cross-platform.

**Cut at the gates:** sharp and Pillow (G2: re-encode, no IPTC write) [14][24]; exifr and ExifReader (G2: read-only) [16][17]; piexif, piexifjs and `exif` (G1/G2: EXIF only) [26][27][32]. ExifReader stays as an optional pure-JS reader.

Scores 1–5 × weight; re-weight freely.

| Criterion (weight) | exiftool-vendored (Node) | python-exiv2 | PyExifTool + system ExifTool | @uswriting/exiftool (WASM) | pyexiv2 |
|---|---|---|---|---|---|
| Examiner install burden (30) | **5**: `npm i`, nothing else [1][30] | 4: wheel, self-contained on macOS [30]; other OSes not tested | 2: manual ExifTool install per OS [11] | 4: no native deps, but Node use unproven [18] | 2: macOS needs `brew install gettext brotli inih` [30] |
| Write/strip correctness (25) | **5**: MWG composites, `-location:all`, verified [10][30] | 4: works, but mapping and sync are hand-coded [30] | 5: same engine as left | 4: same engine, unverified [18] | 4: as python-exiv2 |
| Format coverage (15) | **5**: HEIC/WebP/PNG/TIFF/RAW [5][6] | 3: HEIC write unconfirmed [31] | 5 | 4 | 3 |
| Maintenance (15) | 4: release 2026-10; one maintainer [1]; ExifTool itself releases every 1–3 weeks [12] | 3: one maintainer; version conflict [23] | 2: last release 2023 [19] | 2: young [18] | 4: release 2026-08 [21] |
| Docs / Claude familiarity (10) | 4 | 2: C++-shaped API | 4 | 1 | 3 |
| Performance (5) | 4: process pool [3] | 5: in-process | 4: `-stay_open` [19] | 3 | 5 |
| **Weighted total (/100)** | **94** | **71** | **70** | **67** | **64** |

**Pick: ExifTool via `exiftool-vendored`**, which implies a Node/TypeScript backend.

**Runner-up: python-exiv2** wins if the stack is Python for other reasons. It keeps a zero-extra-install setup, at the cost of a GPL dependency (no problem for an undistributed coursework app, but worth a line in the README), more mapping code and no HEIC write guarantee. PyExifTool wins over it only if a documented `brew install exiftool` / Windows zip step in the README is acceptable.

**Strongest argument against the pick:** one npm maintainer, and on macOS/Linux it relies on a system Perl that Apple could one day drop (raised in a 2019 forum thread [9]; still present in macOS 26.5.2 [30]). The WASM build is the escape hatch if that happens.

**Cheapest hedge:** put all metadata I/O behind one small `MetadataStore` module (`read(file)`, `writeCopy(src, dest, fields, {stripLocation})`) with tests that run the GPS checklist above on a fixture image. Swapping to the WASM build or a Python library then touches one file.

## Cross-dimension insights

- **The metadata library pulls the stack decision.** Only Node gets ExifTool with zero manual steps. On Python, every option costs either an install step (PyExifTool), Homebrew libraries on macOS (pyexiv2) or a GPL, low-level API (python-exiv2). If the stack is otherwise a toss-up, this tips it to Node.
- **The brief's "GPS stripped" is narrower than the privacy intent.** City names in IPTC/XMP reveal location as precisely as coordinates for many shoots. The PRD should say *location data* is stripped from client copies, with the checklist in section C as the acceptance test.
- **Whitelist beats blacklist for client copies.** `-all= -tagsfromfile @ -icc_profile -exif:all --gps:all`, followed by writing only the app's fields, removed everything location-related in one pass [30]. It also drops thumbnails, maker notes and any unknown location field a future camera adds. Its cost is that some camera EXIF the client might want is lost, so decide in the PRD which EXIF groups to keep.
- **Write-on-export fits the tools.** `-o` and copy-then-write both leave the stored original byte-identical [5][30], so the brief's hash-based duplicate check is safe.

## Recommendations

1. **PRD:** state the metadata contract as XMP always (`dc:title`, `dc:description`, `Iptc4xmpCore:AltTextAccessibility`, `dc:subject`), IIM and EXIF `ImageDescription` where the format supports them, UTF-8 throughout, and alt text ≤ 250 characters. Basis: IPTC 2025.1 [28] and a local round-trip with æøå [30]. Confidence high.
2. **PRD:** replace "GPS stripped" with "location data stripped (coordinates and place names)" in client downloads, and use the section C checklist as acceptance criteria. Confidence high [8][28][30].
3. **Architecture:** if Node, use `exiftool-vendored` behind a `MetadataStore` seam, require Node ≥ 22 in the README, and call `exiftool.end()` on shutdown [1][3]. If Python, use python-exiv2 and note the GPL licence. Confidence high for macOS; **medium for Windows** (documented, not tested).
4. **Architecture:** generate client copies with the whitelist pipeline, then verify in a test with the checklist command `exiftool -a -G1 "-gps*" "-*location*" "-*city*" -ThumbnailImage -PreviewImage out.jpg` returning nothing [30].
5. **Test data:** include in the sample images at least one phone JPEG with GPS and a city, one with an EXIF thumbnail, and one HEIC. The thumbnail and HEIC cases were not covered here.

## Open questions

- **Windows:** does `npm i exiftool-vendored` work cleanly on a stock Windows machine, and does Defender flag the bundled exe? Answer: one install and a round-trip on any Windows PC or a GitHub Actions `windows-latest` job.
- **HEIC from a real iPhone:** does a round-trip keep the image intact and clear Apple-specific location keys? Answer: a test with one of your own phone photos.
- **EXIF thumbnail GPS:** can an IFD1 thumbnail carry its own GPS? There is no official ExifTool statement. The whitelist pipeline makes this moot.
- **pyexiv2 on Linux/Windows:** are those wheels self-contained? Only relevant if Python is chosen.
- **python-exiv2 latest version** (0.19.2 vs 0.20.0) and its HEIC write support.

## Source appendix

| # | Supports | Publisher | Pub date | Accessed | Confidence |
|---|---|---|---|---|---|
| [1] | exiftool-vendored 39.0.1, MIT, `node >=22`, .pl/.exe optional deps and sizes | [npm registry](https://registry.npmjs.org/exiftool-vendored/latest) | 2026-10 | 2026-10-28 | high |
| [2] | Uses system Perl on macOS/Linux; slim images need perl; Node 20+ in guide | [PhotoStructure – INSTALLATION.md](https://raw.githubusercontent.com/photostructure/exiftool-vendored.js/HEAD/docs/INSTALLATION.md) | current docs | 2026-10-28 | high |
| [3] | Process pool, `end()`, `null` deletes a tag, group-prefixed writes | [PhotoStructure – exiftool-vendored.js](https://github.com/photostructure/exiftool-vendored.js) | current docs | 2026-10-28 | high |
| [4] | Windows package uses the official ExifTool Windows distribution | [PhotoStructure – exiftool-vendored.exe](https://github.com/photostructure/exiftool-vendored.exe) | current docs | 2026-10-28 | medium |
| [5] | `-o` writes a new file; group delete; IFD0 delete removes GPS/MakerNotes; HEIC/WebP/PNG writable | [ExifTool – exiftool_pod](https://exiftool.org/exiftool_pod.html) | current docs | 2026-10-28 | high |
| [6] | Format support (HEIC/WebP no IIM); incomplete removal for TIFF/PNG/MOV; licence; Windows bundles Perl | [ExifTool – home](https://exiftool.org/) | current docs | 2026-10-28 | high |
| [7] | Lossless edits; IIM UTF-8 via CodedCharacterSet; MakerNotes not editable per tag | [ExifTool – FAQ](https://exiftool.org/faq.html) | current docs | 2026-10-28 | high |
| [8] | `-geotag=` does not remove all GPS; `-gps:all=` is EXIF GPS | [ExifTool – geotag](https://exiftool.org/geotag.html) | current docs | 2026-10-28 | high |
| [9] | `-gps:all=` leaves XMP GPS; `"-gps*="` advice; thumbnails survive GPS removal; macOS Perl concern | [ExifTool forum](https://exiftool.org/forum/index.php?msg=22374) | unknown / 2019 | 2026-10-28 | medium |
| [10] | MWG composites for Description, Keywords and City | [ExifTool – MWG tags](https://exiftool.org/TagNames/MWG.html) | 2025-09 | 2026-10-28 | high |
| [11] | Per-OS ExifTool install steps; Gatekeeper on macOS 15+; current 13.59 | [ExifTool – install](https://exiftool.org/install.html) | current docs | 2026-10-28 | high |
| [12] | Release cadence; 13.55 production, 13.59 latest seen | [ExifTool – history](https://exiftool.org/history.html) | 2026-05 | 2026-10-28 | medium |
| [13] | sharp metadata API; no IPTC write | [sharp – output API](https://sharp.pixelplumbing.com/api-output) | current docs | 2026-10-28 | high |
| [14] | sharp always re-encodes; points to exiftool-vendored | [lovell/sharp #3327](https://github.com/lovell/sharp/issues/3327) | 2022-08 | 2026-10-28 | high |
| [15] | Re-encode confirmed; IPTC/XMP raw blobs | [lovell/sharp #4011](https://github.com/lovell/sharp/issues/4011) | 2024 | 2026-10-28 | medium |
| [16] | exifr read-only, dormant since 2021 | [exifr – GitHub](https://github.com/MikeKovarik/exifr) | 2021-08 | 2026-10-28 | high |
| [17] | ExifReader 4.52.0 read-only, formats | [ExifReader – GitHub](https://github.com/mattiasw/ExifReader) | 2026-10 | 2026-10-28 | high |
| [18] | ExifTool-in-WASM package, maturity | [6over3/exiftool](https://github.com/6over3/exiftool) | 2025-12 | 2026-10-28 | medium |
| [19] | PyExifTool 0.5.6 (2023-10), licence, `-stay_open` | [PyPI – PyExifTool](https://pypi.org/project/PyExifTool/) | 2023-10 | 2026-10-28 | high |
| [20] | Needs system ExifTool ≥ 12.15; open issues; Alpha class warning | [sylikc/pyexiftool](https://github.com/sylikc/pyexiftool) | current docs | 2026-10-28 | medium |
| [21] | pyexiv2 2.16.0, wheels, GPLv3, not thread-safe | [PyPI – pyexiv2](https://pypi.org/project/pyexiv2/) | 2026-08 | 2026-10-28 | high |
| [22] | README install note lists no system libraries | [LeoHsiao1/pyexiv2](https://github.com/LeoHsiao1/pyexiv2) | current docs | 2026-10-28 | high |
| [23] | python-exiv2 GPL-3.0+, bundled libexiv2, version conflict | [PyPI – exiv2](https://pypi.org/pypi/exiv2/json) | current docs | 2026-10-28 | low |
| [24] | Pillow save options; no IPTC write; re-encode on save | [Pillow – image file formats](https://pillow.readthedocs.io/en/stable/handbook/image-file-formats.html) | current docs | 2026-10-28 | medium |
| [25] | Pillow 11.0 `xmp` save argument | [Pillow – 11.0.0 release notes](https://pillow.readthedocs.io/en/stable/releasenotes/11.0.0.html) | 2024-10 | 2026-10-28 | high |
| [26] | piexif EXIF only, 2019 | [PyPI – piexif](https://pypi.org/project/piexif/) | 2019-07 | 2026-10-28 | high |
| [27] | `exif` EXIF only, can delete GPS attributes | [PyPI – exif](https://pypi.org/project/exif/) | 2024-12 | 2026-10-28 | high |
| [28] | IPTC 2025.1 field mapping, alt text, both IIM and XMP, Location structure GPS | [IPTC – Photo Metadata 2025.1](https://www.iptc.org/std/photometadata/specification/IPTC-PhotoMetadata-2025.1.html) | 2025-11 | 2026-10-28 | high |
| [29] | WordPress 7.0 and other tools read IPTC alt text | [IPTC – news](https://iptc.org/news/wordpress-7-0-iptc-alt-text/) | 2026-05 | 2026-10-28 | high |
| [30] | Local experiments: GPS strip variants, whitelist, æøå, lossless hashes, installs, pyexiv2 linkage | [Digest R2 (this run)](digests/r2-local-experiments-r2-1.md) | 2026-10 | 2026-10-28 | high |
| [31] | Exiv2 BMFF/HEIC behind a build flag; latest Exiv2 0.28.7 | [Exiv2 – what's new](https://exiv2.org/whatsnew.html) | 2025-08 | 2026-10-28 | medium |
| [32] | piexifjs 1.0.6 (2019), EXIF only | [npm registry – piexifjs](https://registry.npmjs.org/piexifjs) | 2019-06 | 2026-10-28 | high |

## Staleness map

Computed with `recon_kit.py staleness` from the memlog claims. Windows: versions 1 month, capabilities 6 months, landscape 12 months, standards 24 months.

| Re-check by | Claim | Class |
|---|---|---|
| 2026-11-01 | exiftool-vendored 39.0.1 installs with ExifTool 13.59 and no extra step [1] | version |
| 2026-11-01 | exiftool-vendored.exe bundles Perl on Windows [4] (still untested) | version |
| 2026-11-01 | pyexiv2 macOS wheel needs Homebrew libraries; python-exiv2 wheel self-contained [30] | version |
| 2026-11-01 | python-exiv2 latest version 0.19.2 vs 0.20.0 [23] | version |
| 2026-12-01 | ExifTool-in-WASM package maturity [18] | landscape |
| 2027-04-01 | GPS strip variants, lossless edits, HEIC/WebP without IIM, Pillow limits [6][7][9][24] | capability |
| 2027-11-01 | IPTC 2025.1 field mapping and alt text [28] | standard |

Flagged stale by the script, but not a problem: the sharp re-encode claim [14] cites 2022–2024 issues and was re-checked against the current sharp 0.35.5 docs [13]. PyExifTool's 2023 date [19] *is* the finding (no release since).

**Earliest re-check: 2026-11-01** (version claims). Re-run the install checks before the architecture step if it starts after that date. As a selection report, this is due for a full refresh by **2027-04** (two quarters).

