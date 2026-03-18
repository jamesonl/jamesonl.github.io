const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = process.cwd();
const INPUT_PATH = process.argv[2] || path.join(ROOT, "_data", "curated-sources.json");
const SOURCES_DIR = path.join(ROOT, "_sources");
const COVERS_DIR = path.join(ROOT, "images", "source-covers");
const BOOKS_DIR = path.join(ROOT, "_books");
const PORTRAIT_METADATA_PATH = path.join(ROOT, "_data", "source-portrait-metadata.json");
const ICON_METADATA_PATH = path.join(ROOT, "_data", "source-icon-metadata.json");
const GENERATED_PAPER_CATEGORIES = new Set(["AI & Language", "Forecasting & Operations", "Systems & Sensemaking"]);

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function yamlEscape(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function categorySlug(value) {
  return slugify(value || "");
}

function isRemoteUrl(value) {
  return /^https?:\/\//i.test(String(value || ""));
}

function domainFromUrl(value) {
  try {
    return new URL(value).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

function wrapLines(text, maxChars, maxLines) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;

  const trimmed = lines.slice(0, maxLines);
  trimmed[maxLines - 1] = trimmed[maxLines - 1].replace(/[.,;:!?-]*$/, "") + "…";
  return trimmed;
}

function monogramFor(entry) {
  const seed =
    entry.monogram_source === "title"
      ? entry.title || "Source"
      : entry.creator || entry.publication || entry.domain || entry.title || "Source";
  const pieces = seed
    .replace(/^www\./i, "")
    .split(/[\s.\-/]+/)
    .filter(Boolean)
    .slice(0, 2);
  return pieces.map((piece) => piece[0]).join("").toUpperCase() || "S";
}

function hashValue(value) {
  return Array.from(String(value || "")).reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
}

function loadIconMetadata() {
  if (!fs.existsSync(ICON_METADATA_PATH)) return {};
  return JSON.parse(fs.readFileSync(ICON_METADATA_PATH, "utf8"));
}

function buildIconDataUri(iconPath, mime) {
  const buffer = fs.readFileSync(iconPath);
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

function renderSourceCoverSvg(entry, icon = null) {
  const seed = hashValue(entry.slug || entry.title);
  const shiftA = 36 + (seed % 90);
  const shiftB = 72 + (seed % 120);
  const shiftC = 108 + (seed % 160);
  const mono = monogramFor(entry);
  const titleLines = wrapLines(entry.title, 18, 4);
  const meta = wrapLines(entry.creator || entry.publication || entry.domain || entry.source_type || "", 22, 2);
  const label = `${entry.category || "Source"} · ${entry.source_type || "Reading"}`.toUpperCase();
  const slugSeed = hashValue(entry.category || "");
  const accentOpacity = (0.08 + (slugSeed % 7) * 0.01).toFixed(2);
  const iconMarkup = icon
    ? `<image href="${icon.dataUri}" x="88" y="104" width="104" height="104" preserveAspectRatio="xMidYMid meet"/>`
    : `<text x="140" y="173" text-anchor="middle" fill="#F5F1EB" font-family="IBM Plex Mono, monospace" font-size="54" font-weight="600">${mono}</text>`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="640" height="960" viewBox="0 0 640 960" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="640" height="960" rx="42" fill="#090B0E"/>
  <rect x="18" y="18" width="604" height="924" rx="30" fill="#0F1217" stroke="#2A2F36" stroke-width="2"/>
  <rect x="38" y="38" width="564" height="884" rx="24" fill="#11141A" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
  <g opacity="${accentOpacity}">
    <path d="M92 ${shiftA}C178 ${shiftA - 18} 258 ${shiftB} 344 ${shiftA + 8}C430 ${shiftA - 12} 494 ${shiftB - 24} 548 ${shiftC}" stroke="#FFFFFF" stroke-width="2.2"/>
    <path d="M92 ${shiftB + 140}C170 ${shiftB + 116} 250 ${shiftC + 48} 332 ${shiftB + 156}C404 ${shiftB + 246} 488 ${shiftA + 210} 550 ${shiftC + 122}" stroke="#FFFFFF" stroke-width="1.8"/>
    <path d="M94 ${shiftC + 332}C202 ${shiftC + 286} 286 ${shiftC + 380} 364 ${shiftC + 332}C442 ${shiftC + 282} 510 ${shiftC + 402} 548 ${shiftC + 356}" stroke="#FFFFFF" stroke-width="1.6"/>
  </g>
  <rect x="76" y="92" width="128" height="128" rx="22" fill="#07080A" stroke="#2C3138" stroke-width="2"/>
  ${iconMarkup}
  <text x="76" y="278" fill="#8E98A5" font-family="IBM Plex Mono, monospace" font-size="18" letter-spacing="2.6">${escapeXml(label)}</text>
  ${titleLines
    .map(
      (line, index) =>
        `<text x="76" y="${356 + index * 58}" fill="#F5F1EB" font-family="Fraunces, Georgia, serif" font-size="44" font-weight="600">${escapeXml(
          line
        )}</text>`
    )
    .join("\n  ")}
  ${meta
    .map(
      (line, index) =>
        `<text x="76" y="${706 + index * 32}" fill="#9AA3AE" font-family="Manrope, sans-serif" font-size="24">${escapeXml(line)}</text>`
    )
    .join("\n  ")}
  <path d="M76 846H564" stroke="#30353D" stroke-width="1.4"/>
  <text x="76" y="894" fill="#D6D0C7" font-family="IBM Plex Mono, monospace" font-size="18" letter-spacing="2.2">${escapeXml(
    (entry.first_seen || "").toUpperCase()
  )}</text>
</svg>
`;

  return svg;
}

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function writeSourceCover(entry, destinationBase, icon = null) {
  const svg = renderSourceCoverSvg(entry, icon);
  const pngDestination = `${destinationBase}.png`;
  const svgDestination = `${destinationBase}.svg`;
  const canRasterize = process.platform === "darwin" && fs.existsSync("/usr/bin/qlmanage");

  if (!canRasterize) {
    fs.writeFileSync(svgDestination, svg);
    return { image: `/images/source-covers/${path.basename(svgDestination)}`, format: "svg" };
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "source-cover-"));
  const tempSvgPath = path.join(tempDir, `${path.basename(destinationBase)}.svg`);
  const quickLookOutput = path.join(tempDir, "thumbs");
  const quickLookPngPath = path.join(quickLookOutput, `${path.basename(tempSvgPath)}.png`);

  try {
    fs.mkdirSync(quickLookOutput, { recursive: true });
    fs.writeFileSync(tempSvgPath, svg);
    execFileSync("/usr/bin/qlmanage", ["-t", "-s", "1200", "-o", quickLookOutput, tempSvgPath], { stdio: "ignore" });
    fs.renameSync(quickLookPngPath, pngDestination);
    if (fs.existsSync(svgDestination)) {
      fs.rmSync(svgDestination, { force: true });
    }
    return { image: `/images/source-covers/${path.basename(pngDestination)}`, format: "png" };
  } catch (error) {
    fs.writeFileSync(svgDestination, svg);
    return { image: `/images/source-covers/${path.basename(svgDestination)}`, format: "svg" };
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function loadExistingBookCovers() {
  const map = new Map();
  if (!fs.existsSync(BOOKS_DIR)) return map;

  fs.readdirSync(BOOKS_DIR)
    .filter((file) => file.endsWith(".md"))
    .forEach((file) => {
      const raw = fs.readFileSync(path.join(BOOKS_DIR, file), "utf8");
      const titleMatch = raw.match(/^title:\s*"(.*)"$/m);
      const coverMatch = raw.match(/^cover_image:\s*"(.*)"$/m);
      if (titleMatch && coverMatch) {
        map.set(normalize(titleMatch[1]), coverMatch[1]);
      }
    });

  return map;
}

function loadPortraitMetadata() {
  if (!fs.existsSync(PORTRAIT_METADATA_PATH)) return {};
  return JSON.parse(fs.readFileSync(PORTRAIT_METADATA_PATH, "utf8"));
}

function readExistingFields(markdownPath) {
  if (!fs.existsSync(markdownPath)) return {};
  const raw = fs.readFileSync(markdownPath, "utf8");
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return {};

  const frontmatter = frontmatterMatch[1];
  const fields = {};
  [
    "impact_blurb",
    "key_idea",
    "lasting_impact",
    "revisit_trigger",
    "reflection_status",
    "recommended_for",
  ].forEach((key) => {
    const match = frontmatter.match(new RegExp(`^${key}:\\s*"(.*)"$`, "m"));
    if (match) fields[key] = match[1];
  });

  const body = raw.replace(/^---\n[\s\S]*?\n---\n?/, "");
  fields.body = body.trim();
  return fields;
}

function placeholderBody(entry) {
  return `## Why this source stayed with me

[Write 1-3 paragraphs about what made this source worth keeping and why it still belongs in the library.]

## What I kept returning to

- [Argument, model, diagram, phrase, or method]
- [Argument, model, diagram, phrase, or method]
- [Argument, model, diagram, phrase, or method]

## Where it still shows up

[Write about where this source still shapes your work, your reading, or the way you frame problems.]

## How I would hand it to someone else

[Write about who this is useful for, what context it belongs in, and when you would point someone toward it.]
`;
}

function buildMarkdown(entry, cover, existing) {
  const body = existing.body && existing.body.length ? existing.body : placeholderBody(entry);

  return `---
title: "${yamlEscape(entry.title)}"
creator: "${yamlEscape(entry.creator || "")}"
publication: "${yamlEscape(entry.publication || "")}"
domain: "${yamlEscape(entry.domain || "")}"
category: "${yamlEscape(entry.category || "")}"
source_type: "${yamlEscape(entry.source_type || "")}"
first_seen: "${yamlEscape(entry.first_seen || "")}"
source_url: "${yamlEscape(entry.source_url || "")}"
cover_image: "${yamlEscape(cover.image)}"
cover_alt: "${yamlEscape(cover.alt)}"
cover_kind: "${yamlEscape(cover.kind || "")}"
cover_subject: "${yamlEscape(cover.subject || "")}"
cover_credit: "${yamlEscape(cover.credit || "")}"
cover_credit_url: "${yamlEscape(cover.creditUrl || "")}"
cover_license: "${yamlEscape(cover.license || "")}"
theme_slug: "${yamlEscape(entry.theme_slug || "")}"
featured: ${entry.featured ? "true" : "false"}
impact_blurb: "${yamlEscape(existing.impact_blurb || entry.impact_blurb || "")}"
key_idea: "${yamlEscape(existing.key_idea || entry.key_idea || "")}"
lasting_impact: "${yamlEscape(existing.lasting_impact || entry.lasting_impact || "")}"
revisit_trigger: "${yamlEscape(existing.revisit_trigger || entry.revisit_trigger || "")}"
recommended_for: "${yamlEscape(existing.recommended_for || entry.recommended_for || "")}"
reflection_status: "${yamlEscape(existing.reflection_status || entry.reflection_status || "Draft")}"
---

${body}
`;
}

function shouldForceGeneratedPaperCover(entry) {
  return entry.source_type === "Paper" && GENERATED_PAPER_CATEGORIES.has(entry.category || "");
}

function syncSource(entry, bookCoverMap, portraitMetadata, iconMetadata) {
  const slug = entry.slug || slugify(entry.title);
  const markdownPath = path.join(SOURCES_DIR, `${slug}.md`);
  const coverOutputBase = path.join(COVERS_DIR, slug);
  entry.domain = entry.domain || domainFromUrl(entry.source_url);
  entry.theme_slug = entry.theme_slug || categorySlug(entry.category);
  let cover = null;
  const portrait = portraitMetadata[slug];
  const bookCover = bookCoverMap.get(normalize(entry.title)) || "";
  const iconEntry = entry.domain ? iconMetadata[entry.domain] : null;
  const forceGeneratedPaperCover = shouldForceGeneratedPaperCover(entry);

  if (forceGeneratedPaperCover) {
    const generatedCover = writeSourceCover({ ...entry, slug, monogram_source: "title" }, coverOutputBase, null);
    cover = {
      image: generatedCover.image,
      alt: `Cover treatment for ${entry.title}`,
      kind: "generated",
      subject: "",
      credit: "",
      creditUrl: "",
      license: "",
    };
  } else if (bookCover) {
    cover = {
      image: bookCover,
      alt: entry.cover_alt || `Cover for ${entry.title}`,
      kind: "book_cover",
      subject: entry.creator || "",
      credit: "",
      creditUrl: "",
      license: "",
    };
  } else if (
    portrait &&
    portrait.cover_image &&
    (isRemoteUrl(portrait.cover_image) || fs.existsSync(path.join(ROOT, portrait.cover_image.replace(/^\//, ""))))
  ) {
    cover = {
      image: portrait.cover_image,
      alt: portrait.cover_alt || `Portrait of ${portrait.cover_subject || entry.creator || entry.publication || entry.title}`,
      kind: portrait.cover_kind || "author_portrait",
      subject: portrait.cover_subject || "",
      credit: portrait.cover_credit || "",
      creditUrl: portrait.cover_credit_url || "",
      license: portrait.cover_license || "",
    };
  } else {
    const iconPath = iconEntry && iconEntry.icon_path ? path.join(ROOT, iconEntry.icon_path.replace(/^\//, "")) : "";
    const icon =
      iconEntry && iconEntry.icon_path && iconEntry.mime && iconPath && fs.existsSync(iconPath)
        ? {
            dataUri: buildIconDataUri(iconPath, iconEntry.mime),
            source: iconEntry.source || "",
          }
        : null;
    const generatedCover = writeSourceCover({ ...entry, slug }, coverOutputBase, icon);
    cover = {
      image: generatedCover.image,
      alt: entry.cover_alt || (icon ? `Logo treatment for ${entry.title}` : `Cover treatment for ${entry.title}`),
      kind: icon ? "site_logo" : "generated",
      subject: "",
      credit: "",
      creditUrl: icon ? icon.source : "",
      license: "",
    };
  }

  const existing = readExistingFields(markdownPath);
  const markdown = buildMarkdown({ ...entry, slug }, cover, existing);
  fs.writeFileSync(markdownPath, markdown);
}

function main() {
  if (!fs.existsSync(INPUT_PATH)) {
    throw new Error(`Missing source manifest: ${INPUT_PATH}`);
  }

  const entries = JSON.parse(fs.readFileSync(INPUT_PATH, "utf8"));
  if (!Array.isArray(entries)) {
    throw new Error(`Expected an array in ${INPUT_PATH}`);
  }

  fs.mkdirSync(SOURCES_DIR, { recursive: true });
  fs.mkdirSync(COVERS_DIR, { recursive: true });

  const bookCoverMap = loadExistingBookCovers();
  const portraitMetadata = loadPortraitMetadata();
  const iconMetadata = loadIconMetadata();

  entries.forEach((entry) => syncSource(entry, bookCoverMap, portraitMetadata, iconMetadata));
  console.log(`Synced ${entries.length} sources.`);
}

main();
