const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = process.cwd();
const INPUT_PATH = path.join(ROOT, "_data", "curated-sources.json");
const OUTPUT_PATH = path.join(ROOT, "_data", "source-icon-metadata.json");
const ICONS_DIR = path.join(ROOT, "images", "source-icons");
const USER_AGENT = "Mozilla/5.0 Codex/1.0";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function domainFromUrl(value) {
  try {
    return new URL(value).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

function detectMime(buffer) {
  if (!buffer || !buffer.length) return "";
  const signature = buffer.subarray(0, 12);
  if (signature[0] === 0x89 && signature[1] === 0x50 && signature[2] === 0x4e && signature[3] === 0x47) return "image/png";
  if (signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff) return "image/jpeg";
  if (buffer.subarray(0, 6).toString() === "GIF87a" || buffer.subarray(0, 6).toString() === "GIF89a") return "image/gif";
  if (signature[0] === 0x00 && signature[1] === 0x00 && signature[2] === 0x01 && signature[3] === 0x00) return "image/x-icon";
  const text = buffer.subarray(0, 200).toString("utf8").trim().toLowerCase();
  if (text.startsWith("<svg") || text.startsWith("<?xml")) return "image/svg+xml";
  if (text.startsWith("<!doctype html") || text.startsWith("<html")) return "text/html";
  return "";
}

function extensionForMime(mime) {
  switch (mime) {
    case "image/png":
      return ".png";
    case "image/jpeg":
      return ".jpg";
    case "image/gif":
      return ".gif";
    case "image/x-icon":
      return ".ico";
    case "image/svg+xml":
      return ".svg";
    default:
      return "";
  }
}

function fetchBuffer(url) {
  const result = spawnSync("curl", ["-fsSL", "--connect-timeout", "3", "--max-time", "6", "-A", USER_AGENT, url], {
    encoding: null,
    maxBuffer: 8 * 1024 * 1024,
  });
  if (result.status !== 0 || !result.stdout || !result.stdout.length) return null;
  return result.stdout;
}

function loadExistingMetadata() {
  if (!fs.existsSync(OUTPUT_PATH)) return {};
  return JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf8"));
}

function existingIconOk(entry) {
  if (!entry || !entry.icon_path) return false;
  const iconPath = path.join(ROOT, entry.icon_path.replace(/^\//, ""));
  return fs.existsSync(iconPath);
}

function main() {
  const entries = JSON.parse(fs.readFileSync(INPUT_PATH, "utf8"));
  const domains = [...new Set(entries.map((entry) => domainFromUrl(entry.source_url)).filter(Boolean))];
  const existingMetadata = loadExistingMetadata();
  const metadata = {};

  fs.mkdirSync(ICONS_DIR, { recursive: true });

  domains.forEach((domain) => {
    if (existingIconOk(existingMetadata[domain])) {
      metadata[domain] = existingMetadata[domain];
      return;
    }

    const attempts = [`https://www.google.com/s2/favicons?sz=128&domain_url=${domain}`];

    let selected = null;
    for (const url of attempts) {
      const buffer = fetchBuffer(url);
      const mime = detectMime(buffer);
      if (!buffer || !mime || mime === "text/html") continue;
      selected = { buffer, mime, source: url };
      break;
    }

    if (!selected) return;

    const ext = extensionForMime(selected.mime);
    if (!ext) return;

    const iconSlug = slugify(domain);
    const iconPath = path.join(ICONS_DIR, `${iconSlug}${ext}`);
    fs.writeFileSync(iconPath, selected.buffer);
    metadata[domain] = {
      icon_path: `/images/source-icons/${iconSlug}${ext}`,
      mime: selected.mime,
      source: selected.source,
    };
  });

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(metadata, null, 2) + "\n");
  console.log(`Cached ${Object.keys(metadata).length} source icons.`);
}

main();
