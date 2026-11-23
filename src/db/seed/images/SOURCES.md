# Sample images: sources and licence

The seed uploads these 22 files as Ida Berg when the app starts on an empty `images` table with `SEED_ON_START=true` (Story 1.7). Which file plays which access row is set in [`../fixture.ts`](../fixture.ts) (`fixtureImages`); the mock AI's metadata for each file is in [`src/modules/ai/providers/mock-fixtures.ts`](../../../modules/ai/providers/mock-fixtures.ts).

**Licence:** Photos by Marthe Kalland, © all rights reserved, used only as sample data in this repo.

No file comes from Unsplash, Pexels or another stock site. The full-size originals never enter git.

| File | Author | Licence | Notes |
| --- | --- | --- | --- |
| `aerial-coast-plane-window.jpg` | Marthe Kalland | © all rights reserved, sample data only | Coast and houses seen from a plane window |
| `aquarium-jellyfish-fail.jpg` | Marthe Kalland | © all rights reserved, sample data only | The `fail` file: the mock AI fails on it, so it stays a failed draft. A child seen from behind, no face |
| `birch-path-thaw.jpg` | Marthe Kalland | © all rights reserved, sample data only | |
| `birthday-balloon-window.jpg` | Marthe Kalland | © all rights reserved, sample data only | |
| `child-garden-worm.jpg` | Marthe Kalland | © all rights reserved, sample data only | A child's hand, no face |
| `dinner-table-wine.jpg` | Marthe Kalland | © all rights reserved, sample data only | |
| `garden-clearing-trimmer.jpg` | Marthe Kalland | © all rights reserved, sample data only | A person far off, no recognisable face |
| `gilded-frame-corner.jpg` | Marthe Kalland | © all rights reserved, sample data only | |
| `jellyfish-polaria-location.png` | Marthe Kalland | © all rights reserved, sample data only | The PNG location file: keeps XMP GPS, City and Country |
| `jellyfish-tank.jpg` | Marthe Kalland | © all rights reserved, sample data only | |
| `king-crab-claw.jpg` | Marthe Kalland | © all rights reserved, sample data only | |
| `low-tide-beach.jpg` | Marthe Kalland | © all rights reserved, sample data only | A person far off, no recognisable face |
| `mountain-farm-painting.jpg` | Marthe Kalland | © all rights reserved, sample data only | A signed painting, photographed as an object |
| `pram-walk-pavement.jpg` | Marthe Kalland | © all rights reserved, sample data only | A child in a pram, face hidden by a hat |
| `seal-pool-window.jpg` | Marthe Kalland | © all rights reserved, sample data only | A child seen from the side, no clear face |
| `snowy-path-overcast.jpg` | Marthe Kalland | © all rights reserved, sample data only | |
| `starfish-aquarium.jpg` | Marthe Kalland | © all rights reserved, sample data only | |
| `sunset-footpath.jpg` | Marthe Kalland | © all rights reserved, sample data only | Saved from the photographer's own Snapchat |
| `tabby-cat-terrace-thumbnail.jpg` | Marthe Kalland | © all rights reserved, sample data only | The thumbnail file: carries a rebuilt 160 px EXIF thumbnail |
| `tromso-harbour-gps.jpg` | Marthe Kalland | © all rights reserved, sample data only | The JPEG location file: keeps EXIF GPS, IPTC and XMP City and Country |
| `winter-crosswalk-morning.jpg` | Marthe Kalland | © all rights reserved, sample data only | |
| `wrap-film-samples.jpg` | Marthe Kalland | © all rights reserved, sample data only | 3M wrap film samples, photographed as objects |

## How the files were prepared

On macOS, from the phone originals (kept outside the repo), with `sips`, `pngquant` 3 and ExifTool 13:

```bash
# Each JPEG: longest side 1600 px, JPEG quality 82 (lowered in steps of 6 until the file is under 480 KB).
sips -Z 1600 -s format jpeg -s formatOptions 82 "$ORIGINAL" --out "$FILE"
# The PNG: already 1600 px; requantised to get under 500 KB.
pngquant --quality 50-75 --speed 1 --strip --force --output jellyfish-polaria-location.png "$ORIGINAL_PNG"

# Every file: remove all metadata (camera model, timestamps, serials, GPS, maker notes), keep the colour profile.
exiftool -overwrite_original -all= --icc_profile:all "$FILE"

# The two location files: copy back only GPS, City and Country from the original.
exiftool -overwrite_original -tagsFromFile "$ORIGINAL" \
  -GPS:GPSLatitude -GPS:GPSLatitudeRef -GPS:GPSLongitude -GPS:GPSLongitudeRef \
  -IPTC:CodedCharacterSet -IPTC:City -IPTC:Country-PrimaryLocationName \
  -XMP-photoshop:City -XMP-photoshop:Country tromso-harbour-gps.jpg
exiftool -overwrite_original -tagsFromFile "$ORIGINAL_PNG" \
  -XMP-exif:GPSLatitude -XMP-exif:GPSLongitude -XMP-photoshop:City -XMP-photoshop:Country \
  jellyfish-polaria-location.png

# The thumbnail file: a fresh 160 px EXIF thumbnail of the prepared image.
sips -Z 160 -s format jpeg tabby-cat-terrace-thumbnail.jpg --out thumb.jpg
exiftool -overwrite_original -all= thumb.jpg
exiftool -overwrite_original "-ThumbnailImage<=thumb.jpg" tabby-cat-terrace-thumbnail.jpg
```

Check the result with:

```bash
exiftool -q -T -FileName -ImageSize -FileSize -Model -GPSPosition -City -ThumbnailLength src/db/seed/images
```

Every file is at most 1600 px and under 500 KB, `Model` is empty everywhere, GPS is only on the two location files, and only the thumbnail file has a `ThumbnailLength`.
