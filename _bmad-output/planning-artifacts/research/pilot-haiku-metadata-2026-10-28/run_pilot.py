"""Throwaway runner for the Haiku 5.5 metadata pilot (see pilot-plan.md).

Sends each image in images/1568/ to the Claude API with one fixed prompt and the
embedded metadata as text, and saves the prompt, raw responses and a summary
under runs/<timestamp>/. Not product code.

Usage (from the worktree root, with .env and .venv set up):
    .venv/bin/python <this file>                    # all images, once each
    .venv/bin/python <this file> 06 10 18 --runs 3  # chosen images, three times
    .venv/bin/python <this file> --dry-run          # print prompts, no API calls
"""

import argparse
import base64
import csv
import json
import os
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

PILOT_DIR = Path(__file__).resolve().parent
IMAGE_DIR = PILOT_DIR / "images" / "1568"
RUNS_DIR = PILOT_DIR / "runs"
ENV_FILE = PILOT_DIR.parents[3] / ".env"

# List prices in USD per million tokens (input, output), Haiku for prompts up
# to 100K tokens (Anthropic pricing, checked 2026-10-28). Thinking is billed as output.
PRICES = {
    "claude-haiku-5-5": (0.10, 0.50),
    "claude-sonnet-5-5": (2.00, 10.00),
}

MEDIA_TYPES = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png"}

# Each run saves the prompt it used in prompt.md; earlier versions live there.
PROMPT_VERSION = "v2"
SYSTEM_PROMPT = """\
You write metadata for images in the digital asset library of a Norwegian design agency. \
Staff search the library in Norwegian and reuse the images in client work.

Write all output in standard Norwegian bokmål with correct spelling and inflection. \
Use only real, established Norwegian words. Common nouns and adjectives are lower case, \
also those derived from names (for example "hanseatisk"); only proper nouns are capitalised.

- title: short and specific, at most about 8 words.
- description: one to three sentences on what the image shows and its mood or use.
- altText: under 150 characters, describing what matters for someone who cannot see the image.
- keywords: between 5 and 15 words or short phrases staff would search with. Never more \
than 15: choose the most useful ones. No generic noise such as "bilde" or "foto".

Title, description, alt-text and keywords must agree with each other.

The user message may include embedded metadata from the file (date taken, GPS position, \
existing keywords, caption).
- Date: you may use the season, month and year. Never mention the time of day on the clock.
- GPS: do not turn coordinates into a place name. Name a place only if it is clearly \
recognisable in the image (a sign, a well-known building or view) or given as text \
in the metadata.
- Existing keywords: keep the relevant ones, translated into natural Norwegian. Drop \
those with no good Norwegian equivalent and those that are stock-site noise; never \
keep English or German words.

Never invent facts. Describe what the image shows; do not add background knowledge \
(history, status, awards) or guess materials and techniques you cannot see clearly. \
Do not name people, brands or events unless they are visible in the image or given in \
the metadata. Describe people by what they are doing and wearing, using neutral words \
such as "person" or "personer"; do not guess identity, gender, age or ethnicity. If the \
image is abstract, dark, blurry or unclear, say so plainly instead of guessing."""

OUTPUT_SCHEMA = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "description": {"type": "string"},
        "altText": {"type": "string"},
        "keywords": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["title", "description", "altText", "keywords"],
    "additionalProperties": False,
}

EXIF_TAGS = [
    "-ExifIFD:DateTimeOriginal",
    "-Composite:GPSLatitude",
    "-Composite:GPSLongitude",
    "-IPTC:Keywords",
    "-XMP-dc:Subject",
    "-IPTC:Caption-Abstract",
    "-XMP-dc:Description",
    "-IFD0:ImageDescription",
    "-IPTC:City",
    "-IPTC:Sub-location",
    "-IPTC:Country-PrimaryLocationName",
]


def load_env(path):
    """Set variables from .env that are not already in the environment."""
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())


def as_list(value):
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


def read_metadata(image):
    """Return the embedded fields the app would pass on, as a plain dict."""
    result = subprocess.run(
        ["exiftool", "-json", "-n", "-G1", *EXIF_TAGS, str(image)],
        capture_output=True, text=True, check=True,
    )
    raw = json.loads(result.stdout)[0]
    meta = {}
    if "ExifIFD:DateTimeOriginal" in raw:
        meta["dateTaken"] = raw["ExifIFD:DateTimeOriginal"]
    if "Composite:GPSLatitude" in raw and "Composite:GPSLongitude" in raw:
        meta["gps"] = {
            "latitude": round(raw["Composite:GPSLatitude"], 5),
            "longitude": round(raw["Composite:GPSLongitude"], 5),
        }
    keywords = as_list(raw.get("IPTC:Keywords")) + as_list(raw.get("XMP-dc:Subject"))
    if keywords:
        meta["existingKeywords"] = list(dict.fromkeys(str(k) for k in keywords))
    for tag in ("IPTC:Caption-Abstract", "XMP-dc:Description", "IFD0:ImageDescription"):
        if raw.get(tag):
            meta["caption"] = str(raw[tag])
            break
    place = [str(raw[t]) for t in ("IPTC:Sub-location", "IPTC:City", "IPTC:Country-PrimaryLocationName") if raw.get(t)]
    if place:
        meta["place"] = ", ".join(place)
    return meta


def user_text(meta):
    if not meta:
        return "Write the metadata for this image. The file has no embedded metadata."
    return (
        "Write the metadata for this image. Embedded metadata from the file:\n"
        + json.dumps(meta, ensure_ascii=False, indent=2)
    )


def check_output(data):
    """Pilot checks the schema cannot enforce."""
    problems = []
    if not 5 <= len(data["keywords"]) <= 15:
        problems.append(f"{len(data['keywords'])} keywords")
    if len(data["altText"]) > 150:
        problems.append(f"altText {len(data['altText'])} chars")
    return "; ".join(problems)


def run_one(client, model, effort, image, meta):
    """Call the API once. Returns a record for the summary and the raw response."""
    image_data = base64.standard_b64encode(image.read_bytes()).decode("utf-8")
    params = {
        "model": model,
        "max_tokens": 4000,
        "system": SYSTEM_PROMPT,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": MEDIA_TYPES[image.suffix.lower()], "data": image_data}},
                {"type": "text", "text": user_text(meta)},
            ],
        }],
        "output_config": {"format": {"type": "json_schema", "schema": OUTPUT_SCHEMA}},
    }
    if effort:
        params["output_config"]["effort"] = effort

    start = time.monotonic()
    response = client.messages.create(**params)
    latency = time.monotonic() - start

    usage = response.usage
    details = getattr(usage, "output_tokens_details", None)
    thinking_tokens = getattr(details, "thinking_tokens", None) or 0
    record = {
        "latency_s": round(latency, 2),
        "stop_reason": response.stop_reason,
        "input_tokens": usage.input_tokens,
        "output_tokens": usage.output_tokens,
        "thinking_tokens": thinking_tokens,
        "cost_usd": round((usage.input_tokens * PRICES[model][0] + usage.output_tokens * PRICES[model][1]) / 1_000_000, 6),
        "valid_json": False,
        "checks": "",
    }
    text = next((b.text for b in response.content if b.type == "text"), "")
    try:
        data = json.loads(text)
        record["valid_json"] = True
        record["checks"] = check_output(data)
        record["output"] = data
    except (json.JSONDecodeError, KeyError, TypeError) as error:
        record["checks"] = f"unparsable: {error}"
        record["output_text"] = text
    return record, response.model_dump(mode="json")


def pick_images(names):
    images = sorted(p for p in IMAGE_DIR.iterdir() if p.suffix.lower() in MEDIA_TYPES)
    if not names:
        return images
    chosen = [p for p in images if p.stem in names]
    missing = set(names) - {p.stem for p in chosen}
    if missing:
        sys.exit(f"No image named {', '.join(sorted(missing))} in {IMAGE_DIR}")
    return chosen


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("images", nargs="*", help="image numbers, e.g. 06 10 (default: all)")
    parser.add_argument("--runs", type=int, default=1, help="times to run each image (default 1)")
    parser.add_argument("--effort", choices=["low", "medium", "high"], help="effort level (default: the model's, medium)")
    parser.add_argument("--dry-run", action="store_true", help="print the prompts and metadata, no API calls")
    args = parser.parse_args()

    if not IMAGE_DIR.is_dir():
        sys.exit(f"Image folder missing: {IMAGE_DIR}. See sources.md to rebuild it.")
    images = pick_images(args.images)

    if args.dry_run:
        print(SYSTEM_PROMPT, "\n")
        for image in images:
            print(f"--- {image.name}\n{user_text(read_metadata(image))}\n")
        return

    load_env(ENV_FILE)
    if not os.environ.get("ANTHROPIC_API_KEY"):
        sys.exit(f"ANTHROPIC_API_KEY is not set. Add it to {ENV_FILE}.")
    model = os.environ.get("ANTHROPIC_MODEL", "claude-haiku-5-5")
    if model not in PRICES:
        sys.exit(f"No price for {model}. Add it to PRICES.")

    import anthropic  # after the checks, so --dry-run works without the SDK
    client = anthropic.Anthropic()

    run_dir = RUNS_DIR / datetime.now().strftime("%Y-%m-%d_%H%M%S")
    (run_dir / "raw").mkdir(parents=True)
    (run_dir / "prompt.md").write_text(
        f"# Prompt {PROMPT_VERSION}\n\nModel: `{model}`, effort: `{args.effort or 'default'}`, runs per image: {args.runs}\n\n"
        f"## System\n\n```text\n{SYSTEM_PROMPT}\n```\n\n"
        f"## Output schema\n\n```json\n{json.dumps(OUTPUT_SCHEMA, indent=2)}\n```\n"
    )

    rows = []
    for image in images:
        meta = read_metadata(image)
        for run in range(1, args.runs + 1):
            label = f"{image.stem}-run{run}"
            print(f"{label} ...", end=" ", flush=True)
            try:
                record, raw = run_one(client, model, args.effort, image, meta)
            except anthropic.RateLimitError as error:
                record, raw = {"checks": f"rate limited: {error.message}"}, None
            except anthropic.APIStatusError as error:
                record, raw = {"checks": f"API error {error.status_code}: {error.message}"}, None
            except anthropic.APIConnectionError as error:
                record, raw = {"checks": f"connection error: {error}"}, None
            record = {"image": image.name, "run": run, "metadata": meta, **record}
            (run_dir / f"{label}.json").write_text(json.dumps(record, ensure_ascii=False, indent=2))
            if raw is not None:
                (run_dir / "raw" / f"{label}.json").write_text(json.dumps(raw, ensure_ascii=False, indent=2))
            print(f"{record.get('latency_s', '-')} s {record['checks']}")
            rows.append(record)

    fields = ["image", "run", "valid_json", "latency_s", "input_tokens", "output_tokens",
              "thinking_tokens", "cost_usd", "stop_reason", "checks"]
    with open(run_dir / "summary.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)

    done = [r for r in rows if "latency_s" in r]
    if done:
        latencies = sorted(r["latency_s"] for r in done)
        print(f"\n{len(done)}/{len(rows)} calls succeeded, median latency {latencies[len(latencies) // 2]} s, "
              f"total cost ${sum(r['cost_usd'] for r in done):.4f}")
    print(f"Saved to {run_dir}")


if __name__ == "__main__":
    main()
