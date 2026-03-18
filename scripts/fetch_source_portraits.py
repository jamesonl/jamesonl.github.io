#!/usr/bin/env python3

import html
import json
import mimetypes
import re
import subprocess
import sys
import time
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import quote, unquote, urlparse
from urllib.request import Request, urlopen


ROOT = Path.cwd()
REQUESTS_PATH = ROOT / "_data" / "source-portrait-requests.json"
OUTPUT_PATH = ROOT / "_data" / "source-portrait-metadata.json"
PORTRAITS_DIR = ROOT / "images" / "source-portraits"
USER_AGENT = "Mozilla/5.0 Codex/1.0"


def fetch_json(url: str) -> dict:
    req = Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(4):
        try:
            with urlopen(req, timeout=30) as response:
                return json.load(response)
        except HTTPError as exc:
            if exc.code != 429 or attempt == 3:
                raise
            time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"Could not fetch JSON: {url}")


def strip_html(value: str) -> str:
    plain = re.sub(r"<[^>]+>", "", value or "")
    return html.unescape(plain).replace("\xa0", " ").strip()


def infer_file_title(image_url: str) -> str:
    filename = unquote(Path(urlparse(image_url).path).name)
    if re.match(r"^\d+px-", filename):
        filename = re.sub(r"^\d+px-", "", filename)
    return filename


def infer_extension(image_url: str) -> str:
    suffix = Path(urlparse(image_url).path).suffix.lower()
    if suffix in {".jpg", ".jpeg", ".png", ".webp"}:
        return suffix
    guessed = mimetypes.guess_extension("image/jpeg")
    return guessed or ".jpg"


def choose_credit(artist: str, credit: str) -> str:
    for candidate in (artist, credit):
        cleaned = re.sub(r"\s+", " ", strip_html(candidate))
        cleaned = cleaned.replace("potography:", "photography:")
        cleaned = cleaned.replace("AurélienPierre", "Aurélien Pierre")
        if cleaned.lower() == "unknown authorunknown author":
            cleaned = "Unknown author"
        if cleaned:
            return cleaned
    return "Wikimedia Commons"


def existing_portrait_ok(entry: dict) -> bool:
    cover_image = (entry or {}).get("cover_image", "")
    if not cover_image.startswith("/images/source-portraits/"):
        return False
    local_path = ROOT / cover_image.removeprefix("/")
    return local_path.exists()


def main() -> int:
    if not REQUESTS_PATH.exists():
        raise SystemExit(f"Missing portrait request manifest: {REQUESTS_PATH}")

    requests = json.loads(REQUESTS_PATH.read_text())
    PORTRAITS_DIR.mkdir(parents=True, exist_ok=True)
    existing_output = json.loads(OUTPUT_PATH.read_text()) if OUTPUT_PATH.exists() else {}
    output = {}

    for item in requests:
        slug = item["slug"]
        wiki_title = item["wiki_title"]
        subject = item["subject"]

        if existing_portrait_ok(existing_output.get(slug)):
            output[slug] = existing_output[slug]
            continue

        summary = fetch_json(
            f"https://en.wikipedia.org/api/rest_v1/page/summary/{quote(wiki_title, safe='')}"
        )
        thumbnail = summary.get("thumbnail", {}) or {}
        original = summary.get("originalimage", {}) or {}
        image_url = (thumbnail or original).get("source")
        if not image_url:
            print(f"Skipping {slug}: no page image for {wiki_title}", file=sys.stderr)
            continue

        file_title = infer_file_title(image_url)
        commons = fetch_json(
            "https://commons.wikimedia.org/w/api.php"
            f"?action=query&prop=imageinfo&iiprop=url|extmetadata&titles={quote('File:' + file_title, safe='')}&format=json"
        )
        pages = commons.get("query", {}).get("pages", {})
        image_page = next(iter(pages.values()), {})
        image_info = next(iter(image_page.get("imageinfo", [])), {})
        metadata = image_info.get("extmetadata", {})
        extension = infer_extension(image_url)
        local_cover_path = PORTRAITS_DIR / f"{slug}{extension}"
        subprocess.run(
            ["curl", "-fsSL", "-A", USER_AGENT, image_url, "-o", str(local_cover_path)],
            check=True,
        )

        output[slug] = {
            "cover_image": f"/images/source-portraits/{slug}{extension}",
            "cover_alt": f"Portrait of {subject}",
            "cover_kind": "author_portrait",
            "cover_subject": subject,
            "cover_credit": choose_credit(
                metadata.get("Artist", {}).get("value", ""),
                metadata.get("Credit", {}).get("value", ""),
            ),
            "cover_credit_url": image_info.get("descriptionurl", ""),
            "cover_license": strip_html(metadata.get("LicenseShortName", {}).get("value", "")),
        }
        time.sleep(0.75)

    OUTPUT_PATH.write_text(json.dumps(output, indent=2) + "\n")
    print(f"Wrote portrait metadata for {len(output)} sources.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
