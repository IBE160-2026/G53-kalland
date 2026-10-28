# Digest B — Python metadata libraries (round 1)

## Claims
- claim: PyExifTool's latest release is 0.5.6 (2023-10-22) and requires Python 3.6+; no release in about 3 years. | src: https://pypi.org/project/PyExifTool/ | publisher: PyPI | pub_date: 2023-10 | accessed: 2026-10-28 | conf: high | class: version
- claim: PyExifTool is dual-licensed GPLv3+ or BSD, so it can be used under the permissive BSD terms. | src: https://pypi.org/project/PyExifTool/ | publisher: PyPI | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: licence
- claim: PyExifTool needs a system exiftool (version 12.15 or later). It finds it on PATH, or you pass `ExifTool(executable=<full path>)`. | src: https://github.com/sylikc/pyexiftool | publisher: GitHub (sylikc) | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: install
- claim: PyExifTool starts one exiftool process in batch mode and reuses it for many queries. `ExifToolHelper` auto-starts it. | src: https://pypi.org/project/PyExifTool/ | publisher: PyPI | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: performance
- claim: The PyExifTool repo has 20 open issues and 8 open PRs. Its `ExifToolAlpha` class is flagged as "not very well-tested" and may contain buggy code. | src: https://github.com/sylikc/pyexiftool | publisher: GitHub | pub_date: current docs | accessed: 2026-10-28 | conf: medium | class: maintenance
- claim: The current ExifTool version is 13.59. | src: https://exiftool.org/install.html | publisher: exiftool.org (Phil Harvey) | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: version
- claim: On Windows, ExifTool ships as a standalone exe zip that needs no separate Perl install. The user must rename `exiftool(-k).exe` and put it and `exiftool_files` on PATH. | src: https://exiftool.org/install.html | publisher: exiftool.org | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: install
- claim: On macOS, ExifTool installs via a .pkg. On macOS 15+, Gatekeeper requires "Open Anyway" in Privacy & Security. Linux installs from a tarball with `perl Makefile.PL && make install`. | src: https://exiftool.org/install.html | publisher: exiftool.org | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: install
- claim: `exiftool -gps:all=` deletes only the EXIF GPS group. GPS stored in XMP (the XMP-exif namespace) needs separate handling, because `-XMP-exif:all=` removes more than GPS. | src: https://exiftool.org/forum/index.php?msg=22374 | publisher: ExifTool forum | pub_date: unknown | accessed: 2026-10-28 | conf: medium | class: capability
- claim: Alternatives are `exiftool "-gps*="` (any tag named GPS*) and `-location:all=` (also city/country). | src: https://exiftool.org/forum/index.php?msg=40034 | publisher: ExifTool forum | pub_date: unknown | accessed: 2026-10-28 | conf: low | class: capability
- claim: pyexiv2 2.16.0 (2026-08-02) reads and writes EXIF, IPTC, XMP and ICC. It is based on the Exiv2 C++ API. | src: https://pypi.org/project/pyexiv2/ | publisher: PyPI | pub_date: 2026-08 | accessed: 2026-10-28 | conf: high | class: version
- claim: pyexiv2 ships wheels for CPython 3.8–3.14 on Windows x86-64, Linux x86-64/ARM64 (glibc 2.17+) and macOS 15.0+ x86-64/ARM64. No system libexiv2 is needed. | src: https://pypi.org/project/pyexiv2/ | publisher: PyPI | pub_date: 2026-08 | accessed: 2026-10-28 | conf: high | class: install
- claim: pyexiv2 is GPLv3. | src: https://pypi.org/project/pyexiv2/ | publisher: PyPI | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: licence
- claim: pyexiv2 is not thread-safe (it uses C++ globals), cannot read images over 2 GB and cannot modify images over 1 GB. | src: https://pypi.org/project/pyexiv2/ | publisher: PyPI | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: capability
- claim: python-exiv2 (PyPI `exiv2`, by Jim Easterbrook) is GPL-3.0-or-later. Its wheels have bundled libexiv2 0.28.2 or later since v0.16.3. | src: https://pypi.org/pypi/exiv2/json | publisher: PyPI | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: licence
- claim: The latest python-exiv2 version is 0.19.2 on PyPI JSON but v0.20.0 on the GitHub README. The two disagree and neither gives a date. The repo shows 1 open issue and one named author. | src: https://github.com/jim-easterbrook/python-exiv2 | publisher: GitHub | pub_date: current docs | accessed: 2026-10-28 | conf: low | class: version
- claim: Exiv2 has supported BMFF (HEIC/HEIF/AVIF) since 0.27.4 behind the `EXIV2_ENABLE_BMFF` build flag. Whether it can write HEIC is unconfirmed. | src: https://newreleases.io/project/github/Exiv2/exiv2/release/v0.27.4 | publisher: newreleases.io (Exiv2 release notes) | pub_date: 2021 | accessed: 2026-10-28 | conf: medium | class: capability
- claim: The latest Exiv2 release is 0.28.7 (2025-08-31). | src: https://exiv2.org/whatsnew.html | publisher: exiv2.org | pub_date: 2025-08 | accessed: 2026-10-28 | conf: medium | class: version
- claim: The current Pillow release is 13.0.0 (2026-10-16). | src: https://pillow.readthedocs.io/en/stable/releasenotes/index.html | publisher: Pillow docs | pub_date: 2026-10 | accessed: 2026-10-28 | conf: high | class: version
- claim: Pillow 11.0.0 added an `xmp` save argument for JPEG and MPO. | src: https://pillow.readthedocs.io/en/stable/releasenotes/11.0.0.html | publisher: Pillow docs | pub_date: 2024-10 | accessed: 2026-10-28 | conf: high | class: capability
- claim: Pillow's format docs list `exif`/`icc_profile` save options for JPEG, PNG and TIFF and `xmp` for WebP. No IPTC write option is documented; IPTC support is read-only. | src: https://pillow.readthedocs.io/en/stable/handbook/image-file-formats.html | publisher: Pillow docs | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: capability
- claim: Pillow's JPEG `quality="keep"` keeps the original quality, subsampling and qtables. The docs do not describe it as a pass-through. Saving goes through the encoder, so a metadata-only edit is not byte-preserving for the pixel data. | src: https://pillow.readthedocs.io/en/stable/handbook/image-file-formats.html | publisher: Pillow docs | pub_date: current docs | accessed: 2026-10-28 | conf: medium | class: capability
- claim: piexif 1.1.3 (2019-07-01) is MIT-licensed, pure Python and handles EXIF only (insert/remove) for JPEG and WebP. It is effectively unmaintained. | src: https://pypi.org/project/piexif/ | publisher: PyPI | pub_date: 2019-07 | accessed: 2026-10-28 | conf: high | class: maintenance
- claim: exif 1.6.1 (2024-12-10) is MIT-licensed, pure Python (py3-none-any) and has no third-party dependencies. It can delete individual GPS attributes (e.g. `del img.gps_latitude`). It does not mention IPTC or XMP. | src: https://pypi.org/project/exif/ | publisher: PyPI | pub_date: 2024-12 | accessed: 2026-10-28 | conf: high | class: capability

## Capability table
| library | version (date) | read EXIF/IPTC/XMP | write IPTC/XMP | selective GPS strip | lossless (no re-encode) | formats | licence | install notes |
|---|---|---|---|---|---|---|---|---|
| PyExifTool + exiftool | 0.5.6 (2023-10) / exiftool 13.59 | yes / yes / yes | yes / yes | yes (`-gps:all=`; XMP GPS needs extra tags) | yes (unverified here, exiftool is metadata-only by design) | very broad; HEIC write status not verified this run | BSD or GPLv3 (wrapper); exiftool under Perl terms (not checked) | pure-Python wrapper; **system exiftool required** (Win exe zip + PATH, mac .pkg with Gatekeeper step, Linux tarball/Perl) |
| pyexiv2 | 2.16.0 (2026-08) | yes / yes / yes | yes / yes | likely by deleting keys (tag deletion not documented on PyPI) | believed yes (Exiv2 edits metadata in place), not verified | Exiv2 list (JPEG, PNG, TIFF, WebP; HEIC unclear) | GPLv3 | binary wheels for cp38–3.14, Win x64, Linux x64/arm64, macOS 15+ x64/arm64; not thread-safe |
| python-exiv2 (`exiv2`) | 0.19.2 or 0.20.0 (date unknown) | yes / yes / yes (full libexiv2 API) | yes / yes | yes via the API (not verified) | as above | as libexiv2 0.28.x | GPL-3.0+ | wheels bundle libexiv2; lower-level API; single maintainer |
| Pillow | 13.0.0 (2026-10) | EXIF yes; IPTC read-only; XMP read | IPTC no; XMP only for JPEG (11.0+) and WebP | EXIF GPS IFD editable (not verified) | **no**, saving re-encodes | JPEG, PNG, TIFF, WebP, (HEIC via pillow-heif, not checked) | MIT-CMU (HPND, not checked) | wheels everywhere |
| piexif | 1.1.3 (2019-07) | EXIF only | no | yes (EXIF) | yes for EXIF insert | JPEG, WebP | MIT | pure Python; stale |
| exif | 1.6.1 (2024-12) | EXIF only | no | yes (`del gps_*`) | not stated | JPEG (examples) | MIT | pure Python |

## Leads worth chasing
- Whether exiftool and Exiv2 can write HEIC/HEIF today. The only "read-only" source found is from 2017 and probably stale. Check the exiftool.org "Supported File Types" table and the Exiv2 BMFF docs.
- The pyexiv2 API docs (GitHub LeoHsiao1/pyexiv2 tutorial): `modify_*` with a None value to delete tags, `clear_*`, and support for writing from bytes (useful for an outgoing copy without touching the original).
- Whether pyexiv2's macOS 15.0+ wheel floor shuts out examiners on macOS 14 or older. Would that force a source build?
- PyExifTool issue tracker: Windows encoding/hang reports and the `-stay_open` timeout behaviour.
- The exiftool licence (Perl Artistic/GPL) and Homebrew/apt availability, as an easier install path than exiftool.org.
- The pillow-heif version, its metadata handling and whether it can write XMP to HEIC.
- How GPL (pyexiv2/python-exiv2) affects the student project (probably fine for a non-distributed coursework app).

## Looked for but not found
- The python-exiv2 release date and wheel platform list (the PyPI page failed to render and the JSON was truncated). Its version number conflicts between sources.
- The libexiv2 version bundled in pyexiv2 2.16.0.
- PyExifTool's last commit date and the content of its open issues.
- An explicit Pillow statement that a JPEG save always decodes and re-encodes pixels (only inferred from the docs).
- A current, primary-source confirmation of HEIC write support in Exiv2 or ExifTool.
- Pillow's licence and pillow-heif details (not fetched; budget spent).
