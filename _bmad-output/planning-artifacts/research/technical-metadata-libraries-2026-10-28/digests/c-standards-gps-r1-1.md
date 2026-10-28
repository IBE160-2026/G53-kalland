# Digest C — Standards, field mapping and GPS removal (round 1)

## Claims
- claim: The current IPTC Photo Metadata Standard is 2025.1 (rev. 1, 2025-11-26), containing IPTC Core 1.5 and IPTC Extension 1.9. | src: https://www.iptc.org/std/photometadata/specification/IPTC-PhotoMetadata-2025.1.html | publisher: IPTC | pub_date: 2025-11 | accessed: 2026-10-28 | conf: high | class: standard
- claim: Title maps to XMP dc:title (Lang Alt) and IIM 2:05 Object Name (max 64 bytes). | src: same | publisher: IPTC | pub_date: 2025-11 | accessed: 2026-10-28 | conf: high | class: standard
- claim: Description maps to XMP dc:description (Lang Alt) and IIM 2:120 Caption/Abstract (max 2000 bytes). | src: same | publisher: IPTC | pub_date: 2025-11 | accessed: 2026-10-28 | conf: high | class: standard
- claim: Keywords map to XMP dc:subject (Bag) and IIM 2:25 Keywords (max 64 bytes each). | src: same | publisher: IPTC | pub_date: 2025-11 | accessed: 2026-10-28 | conf: high | class: standard
- claim: Alt Text (Accessibility) is Iptc4xmpCore:AltTextAccessibility and Extended Description (Accessibility) is Iptc4xmpCore:ExtDescrAccessibility. Both are Lang Alt, XMP only, with no IIM dataset. | src: same | publisher: IPTC | pub_date: 2025-11 | accessed: 2026-10-28 | conf: high | class: standard
- claim: Both accessibility fields were added in version 2021.1, and alt text "should not exceed 250 characters". | src: same | publisher: IPTC | pub_date: 2025-11 | accessed: 2026-10-28 | conf: high | class: standard
- claim: IPTC says values "should be saved to an image file using both the IIM format and the XMP format". | src: same (sec. 5.3.4) | publisher: IPTC | pub_date: 2025-11 | accessed: 2026-10-28 | conf: high | class: standard
- claim: IIM limits are counted in bytes, not characters, so non-ASCII UTF-8 text fits fewer characters. | src: same (sec. 15.1) | publisher: IPTC | pub_date: 2025-11 | accessed: 2026-10-28 | conf: high | class: standard
- claim: IPTC notes that the MWG synchronisation guideline was only available from MWG until October 2018. ExifTool cites MWG 2.0 through a web.archive.org snapshot from 2018-09-19. | src: same; https://exiftool.org/TagNames/MWG.html | publisher: IPTC; ExifTool | pub_date: 2025-11; 2025-09 | accessed: 2026-10-28 | conf: high | class: standard
- claim: The IPTC Location structure (LocationShown/LocationCreated) has its own GPS sub-fields: exif:GPSLatitude, exif:GPSLongitude, exif:GPSAltitude and exif:GPSAltitudeRef, next to City, Sublocation, ProvinceState, CountryName/Code, WorldRegion, LocationName and LocationId. | src: IPTC 2025.1 spec | publisher: IPTC | pub_date: 2025-11 | accessed: 2026-10-28 | conf: high | class: privacy
- claim: Legacy City is photoshop:City / IIM 2:90, and Sublocation is Iptc4xmpCore:Location / IIM 2:92. | src: IPTC 2025.1 spec | publisher: IPTC | pub_date: 2025-11 | accessed: 2026-10-28 | conf: high | class: privacy
- claim: The MWG Description composite covers EXIF:ImageDescription, IPTC:Caption-Abstract and XMP-dc:Description. The Keywords composite covers IPTC:Keywords and XMP-dc:Subject. | src: https://exiftool.org/TagNames/MWG.html | publisher: ExifTool (P. Harvey) | pub_date: 2025-09 | accessed: 2026-10-28 | conf: high | class: standard
- claim: The MWG City composite covers IPTC:City, XMP-photoshop:City and XMP-iptcExt:LocationShownCity, so location text sits in three places. | src: same | publisher: ExifTool | pub_date: 2025-09 | accessed: 2026-10-28 | conf: high | class: privacy
- claim: ExifTool's MWG writing creates IPTC only if the file already has IPTC, and updates IPTCDigest only when the digest was absent or matched, which marks XMP as in sync with IIM. | src: same | publisher: ExifTool | pub_date: 2025-09 | accessed: 2026-10-28 | conf: high | class: capability
- claim: MWG recommends storing EXIF ASCII strings as UTF-8, which contradicts the EXIF spec. ExifTool sets CharsetEXIF=UTF8 when the MWG module loads. | src: same | publisher: ExifTool | pub_date: 2025-09 | accessed: 2026-10-28 | conf: high | class: standard
- claim: ExifTool reads IIM as UTF-8 only if CodedCharacterSet (1:90) = UTF8, otherwise as cp1252. It recommends setting CodedCharacterSet=UTF8 when creating new IPTC. | src: https://exiftool.org/faq.html | publisher: ExifTool | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: standard
- claim: WordPress 7.0 (May 2026) reads embedded IPTC Alt Text and uses it as the alt attribute in published image tags. | src: https://iptc.org/news/wordpress-7-0-iptc-alt-text/ | publisher: IPTC | pub_date: 2026-05 | accessed: 2026-10-28 | conf: high | class: capability
- claim: Photo Mechanic (since 2022), Adobe Creative Cloud apps (since Dec 2023), Fotoware and MediaGraph support the alt-text property. Lightroom Classic support is reportedly incomplete (no filtering). | src: same; Adobe community (search snippet) | publisher: IPTC; Adobe | pub_date: 2026-05 | accessed: 2026-10-28 | conf: medium | class: capability
- claim: `-o OUTFILE` writes a new file, leaves the source untouched and never overwrites an existing file. Otherwise ExifTool keeps a `_original` backup unless `-overwrite_original` is used. | src: https://exiftool.org/exiftool_pod.html | publisher: ExifTool | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: capability
- claim: In JPEG, deleting EXIF/IFD0 also deletes the GPS and MakerNotes subdirectories. MakerNotes tags cannot be deleted one by one, and "not all groups are deletable" (see `-listd`). | src: same; https://exiftool.org/faq.html | publisher: ExifTool | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: privacy
- claim: `-geotag=` deletes only the GPS tags the geotag feature wrote, and "does not remove all GPS tags". `-gps:all=` removes all EXIF GPS, and `-xmp:geotag=` removes XMP GPS written by geotagging. | src: https://exiftool.org/geotag.html | publisher: ExifTool | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: privacy
- claim: The ExifTool author's forum advice is `-gps:all=` for EXIF GPS and `"-gps*="` to also catch XMP GPS. One user reports `-gps:all=` did nothing on a .mov. | src: https://exiftool.org/forum/index.php?msg=43562 (search snippet only; page unavailable on fetch) | publisher: ExifTool forum | pub_date: unknown | accessed: 2026-10-28 | conf: low | class: privacy
- claim: Removing GPS does not remove the EXIF thumbnail. That needs `-ThumbnailImage= -PreviewImage=` or `-ifd1:all=`, and a cropped photo can still carry an uncropped original thumbnail. | src: exiftool forum msg=12290/10890 (snippets); gentoo-user list | publisher: ExifTool forum; Gentoo list | pub_date: unknown | accessed: 2026-10-28 | conf: low | class: privacy
- claim: ExifTool never generates previews (no image manipulation) and edits are lossless to image data. | src: https://exiftool.org/faq.html | publisher: ExifTool | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: capability
- claim: HEIC and WebP support read, write and create of EXIF and XMP but not IPTC-IIM. PNG supports EXIF, IPTC and XMP (EXIF and IPTC are non-standard in PNG). C2PA can only be deleted. | src: https://exiftool.org/ | publisher: ExifTool | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: capability
- claim: ExifTool says metadata removal is not always complete: TIFF keeps some IFD0 EXIF, PNG loses only certain chunks, and MOV/MP4 loses most top-level metadata. | src: https://exiftool.org/ | publisher: ExifTool | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: privacy
- claim: ExifTool is licensed "under the same terms as Perl itself" (Artistic or GPL). | src: https://exiftool.org/ | publisher: ExifTool | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: licence
- claim: Install options are a Windows standalone zip (32/64-bit, bundled Perl, keep the `exiftool_files` folder), a macOS .pkg into /usr/local/bin, and a Unix source tarball needing Perl 5.004+. ExifTool makes no internet connections. | src: https://exiftool.org/ | publisher: ExifTool | pub_date: current docs | accessed: 2026-10-28 | conf: high | class: install
- claim: The latest version seen is 13.59 (2026-05-27) and the latest marked production release is 13.55 (2026-04-07). Releases come roughly every 1–3 weeks. | src: https://exiftool.org/history.html | publisher: ExifTool | pub_date: 2026-05 | accessed: 2026-10-28 | conf: medium | class: version

## Field mapping table
| app field | XMP property | IPTC-IIM dataset | EXIF tag | notes |
|---|---|---|---|---|
| title | dc:title (Lang Alt) | 2:05 Object Name (64 B) | (none standard; XPTitle is Windows-only, unverified) | IIM limit in bytes |
| description | dc:description (Lang Alt) | 2:120 Caption/Abstract (2000 B) | IFD0 ImageDescription | MWG: keep all three in sync, EXIF as UTF-8 |
| alt text | Iptc4xmpCore:AltTextAccessibility (Lang Alt) | none | none | since 2021.1; ≤250 chars; read by WordPress 7.0 |
| long description (optional) | Iptc4xmpCore:ExtDescrAccessibility | none | none | since 2021.1 |
| keywords | dc:subject (Bag) | 2:25 Keywords (64 B each, repeatable) | none | set 1:90 CodedCharacterSet=UTF8 |

## Where GPS/location hides — checklist
- EXIF GPS IFD (`-gps:all=`), confirmed.
- XMP exif:GPS* (top level, from geotagging), confirmed.
- XMP Iptc4xmpExt:LocationShown / LocationCreated, which include GPS lat/lon/alt sub-fields plus City, Sublocation, State and Country, confirmed.
- Legacy text location: photoshop:City, Iptc4xmpCore:Location, photoshop:State/Country, IIM 2:90/2:92/2:95/2:101, confirmed.
- EXIF thumbnail (IFD1) and PreviewImage: GPS stripping leaves them, and they may show an uncropped original (low-confidence sources).
- Maker notes: removed with the EXIF block in JPEG, cannot be edited tag by tag. GPS inside maker notes was not verified.
- HEIC: EXIF and XMP, plus QuickTime-style items. MOV/MP4 location in QuickTime ItemList/Keys/UserData is not cleared by `-gps:all=` (low).
- PNG: EXIF/XMP/IPTC chunks plus native text chunks. WebP: EXIF/XMP chunks.
- C2PA manifests may carry assertions (deletable only).
- Suggested verification (my composition, not doc-stated): `exiftool -a -G1 -s -n -ee -u "-gps*" "-*location*" "-*city*" -ThumbnailImage -PreviewImage out.jpg` should return nothing.

## Leads worth chasing
- Safest pipeline: `exiftool -all= -tagsfromfile @ -icc_profile ... -o out.jpg in.jpg`, then write only the chosen fields (whitelist rather than blacklist). Check exiftool_pod after offset 100000 for `-tagsfromfile` examples.
- IPTC software-support list: iptc.org/standards/photo-metadata/software-support.
- Apple HEIC: Apple maker notes and QuickTime location keys; Live Photo companion MOV.
- MWG 2.0 PDF (archive.org) for exact read/reconcile rules.
- ExifTool forum on GitHub/SourceForge mirrors (the main forum was down) to confirm the thumbnail and `-gps*=` claims.

## Looked for but not found
- An ExifTool version newer than 13.59 (May 2026). The history page may be cached, so the release status as of Oct 2026 is not confirmed against the ≤1-month freshness rule.
- An official ExifTool statement on whether the EXIF thumbnail carries its own GPS.
- Apple developer docs on HEIC location fields.
- Homebrew and Linux package names/versions (not fetched). I believe `brew install exiftool` and Debian's `libimage-exiftool-perl` exist, but neither is verified in this run.
- An EXIF tag for title. An IIM field for alt text (none exists per IPTC).
