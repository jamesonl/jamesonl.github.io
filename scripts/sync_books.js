const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

const ROOT = process.cwd();
const BOOKS_DIR = path.join(ROOT, "_books");
const COVERS_DIR = path.join(ROOT, "images", "book-covers");

const BOOKS = [
  { title: "Foundation", author: "Isaac Asimov", category: "Science Fiction", series: "Foundation series", order: 103 },
  { title: "Foundation and Empire", author: "Isaac Asimov", category: "Science Fiction", series: "Foundation series", order: 104 },
  { title: "Second Foundation", author: "Isaac Asimov", category: "Science Fiction", series: "Foundation series", order: 105 },
  { title: "Foundation's Edge", author: "Isaac Asimov", category: "Science Fiction", series: "Foundation series", order: 106 },
  { title: "Foundation and Earth", author: "Isaac Asimov", category: "Science Fiction", series: "Foundation series", order: 107 },
  { title: "The Naked Sun", author: "Isaac Asimov", category: "Science Fiction", series: "Robot series", order: 111 },
  { title: "The Robots of Dawn", author: "Isaac Asimov", category: "Science Fiction", series: "Robot series", order: 112 },
  {
    title: "Electric Dreams",
    author: "Philip K. Dick",
    category: "Science Fiction",
    order: 113,
    google_title: "Philip K. Dick's Electric Dreams",
  },
  { title: "Minority Report", author: "Philip K. Dick", category: "Science Fiction", order: 114 },
  { title: "The Mountain in the Sea", author: "Ray Nayler", category: "Science Fiction", order: 115 },
  { title: "The Languages of Pao", author: "Jack Vance", category: "Science Fiction", order: 116 },
  { title: "Tales of the Dying Earth", author: "Jack Vance", category: "Science Fiction", order: 117 },
  { title: "The Fifth Science", author: "Exurb1a", category: "Science Fiction", order: 118 },
  { title: "There Is No Antimemetics Division", author: "qntm", category: "Science Fiction", order: 119 },
  {
    title: "Valuable Humans in Transit",
    author: "qntm",
    category: "Science Fiction",
    order: 120,
    google_title: "Valuable Humans in Transit and Other Stories",
    cover_url: "https://covers.openlibrary.org/b/id/14821211-L.jpg",
  },
  { title: "Ra", author: "qntm", category: "Science Fiction", order: 121 },
  { title: "Morphotrophic", author: "Greg Egan", category: "Science Fiction", order: 122 },
  { title: "The Unreasoning Mask", author: "Philip Jose Farmer", category: "Science Fiction", order: 123 },
  { title: "Whiplash: How to Survive Our Faster Future", author: "Joi Ito and Jeff Howe", category: "Science Fiction", order: 124 },
  { title: "Last and First Men", author: "Olaf Stapledon", category: "Science Fiction", order: 125 },
  { title: "Star Maker", author: "Olaf Stapledon", category: "Science Fiction", order: 126 },
  { title: "Forecasting: Principles and Practice", author: "Rob J Hyndman", category: "Technical", order: 201 },
  { title: "Zero to One", author: "Peter Thiel", category: "Technical", order: 202 },
  { title: "Seeing Like a State", author: "James C. Scott", category: "Technical", order: 203 },
  { title: "On Writing", author: "Stephen King", category: "Technical", order: 204 },
  {
    title: "Maintenance: Of Everything, Part One",
    author: "Stewart Brand",
    category: "Nonfiction",
    order: 300,
    currently_reading: true,
  },
  { title: "The Dream Machine", author: "M. Mitchell Waldrop", category: "Nonfiction", order: 301 },
  { title: "Tools for Thought", author: "Howard Rheingold", category: "Nonfiction", order: 302 },
  { title: "Redwall", author: "Brian Jacques", category: "Fantasy", series: "Redwall Chronicles", order: 416 },
  { title: "Mossflower", author: "Brian Jacques", category: "Fantasy", series: "Redwall Chronicles", order: 417 },
  {
    title: "Magician",
    author: "Raymond E. Feist",
    category: "Fantasy",
    series: "Riftwar Cycle",
    order: 401,
    google_title: "Magician: Apprentice",
    cover_url: "https://covers.openlibrary.org/b/id/1005965-L.jpg",
  },
  { title: "Silverthorn", author: "Raymond E. Feist", category: "Fantasy", series: "Riftwar Cycle", order: 402 },
  { title: "A Darkness at Sethanon", author: "Raymond E. Feist", category: "Fantasy", series: "Riftwar Cycle", order: 403 },
  { title: "Prince of the Blood", author: "Raymond E. Feist", category: "Fantasy", series: "Riftwar Cycle", order: 404 },
  { title: "The King's Buccaneer", author: "Raymond E. Feist", category: "Fantasy", series: "Riftwar Cycle", order: 405 },
  { title: "Shadow of a Dark Queen", author: "Raymond E. Feist", category: "Fantasy", series: "Serpentwar Saga", order: 406 },
  { title: "Rise of a Merchant Prince", author: "Raymond E. Feist", category: "Fantasy", series: "Serpentwar Saga", order: 407 },
  { title: "Rage of a Demon King", author: "Raymond E. Feist", category: "Fantasy", series: "Serpentwar Saga", order: 408 },
  {
    title: "Shards of a Broken Crown",
    author: "Raymond E. Feist",
    category: "Fantasy",
    series: "Serpentwar Saga",
    order: 409,
    cover_url: "https://covers.openlibrary.org/b/id/1006030-L.jpg",
  },
  { title: "Krondor: The Betrayal", author: "Raymond E. Feist", category: "Fantasy", series: "Riftwar Legacy", order: 410 },
  { title: "Krondor: The Assassins", author: "Raymond E. Feist", category: "Fantasy", series: "Riftwar Legacy", order: 411 },
  { title: "Krondor: Tear of the Gods", author: "Raymond E. Feist", category: "Fantasy", series: "Riftwar Legacy", order: 412 },
  { title: "Talon of the Silver Hawk", author: "Raymond E. Feist", category: "Fantasy", series: "Conclave of Shadows", order: 413 },
  {
    title: "King of Foxes",
    author: "Raymond E. Feist",
    category: "Fantasy",
    series: "Conclave of Shadows",
    order: 414,
    cover_url: "https://covers.openlibrary.org/b/id/237832-L.jpg",
  },
  { title: "Exile's Return", author: "Raymond E. Feist", category: "Fantasy", series: "Conclave of Shadows", order: 415 },
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalize(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function yamlEscape(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
  trimmed[maxLines - 1] = trimmed[maxLines - 1].replace(/[.,;:!?-]*$/, "") + "...";
  return trimmed;
}

function hashValue(value) {
  return Array.from(String(value || "")).reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
}

function monogramForBook(book) {
  const seed = book.title || book.author || "Book";
  const parts = seed
    .split(/[\s:/'"-]+/)
    .filter(Boolean)
    .slice(0, 2);
  return parts.map((part) => part[0]).join("").toUpperCase() || "BK";
}

function coverImagePath(slug, extension) {
  return `/images/book-covers/${slug}.${extension}`;
}

function existingCoverImage(slug) {
  const pngPath = path.join(COVERS_DIR, `${slug}.png`);
  const svgPath = path.join(COVERS_DIR, `${slug}.svg`);

  if (fs.existsSync(pngPath)) return coverImagePath(slug, "png");
  if (fs.existsSync(svgPath)) return coverImagePath(slug, "svg");
  return "";
}

function createGeneratedCover(book, destination) {
  const seed = hashValue(`${book.title}:${book.author}:${book.category}:${book.series || ""}`);
  const accentA = 52 + (seed % 88);
  const accentB = 128 + (seed % 136);
  const accentC = 238 + (seed % 182);
  const accentOpacity = (0.16 + (seed % 7) * 0.025).toFixed(2);
  const mono = monogramForBook(book);
  const label = (book.category || "Book").toUpperCase();
  const titleLines = wrapLines(book.title, 18, 4);
  const authorLines = wrapLines(book.author, 24, 2);
  const seriesLines = book.series ? wrapLines(book.series, 28, 2) : [];

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="640" height="960" viewBox="0 0 640 960" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="640" height="960" rx="42" fill="#151110"/>
  <rect x="18" y="18" width="604" height="924" rx="30" fill="#1F1716" stroke="#4D3F3A" stroke-width="2"/>
  <rect x="38" y="38" width="564" height="884" rx="24" fill="#261C19" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
  <g opacity="${accentOpacity}">
    <path d="M88 ${accentA}C180 ${accentA - 18} 260 ${accentB} 344 ${accentA + 10}C428 ${accentA - 12} 500 ${accentB - 18} 552 ${accentC}" stroke="#F4D4B8" stroke-width="2.4"/>
    <path d="M88 ${accentB + 122}C166 ${accentB + 104} 254 ${accentC + 36} 338 ${accentB + 144}C420 ${accentB + 214} 492 ${accentA + 216} 552 ${accentC + 118}" stroke="#F4D4B8" stroke-width="2"/>
    <path d="M88 ${accentC + 286}C192 ${accentC + 236} 286 ${accentC + 336} 370 ${accentC + 284}C454 ${accentC + 232} 512 ${accentC + 352} 552 ${accentC + 298}" stroke="#F4D4B8" stroke-width="1.7"/>
  </g>
  <rect x="76" y="92" width="132" height="132" rx="24" fill="#F0E0CD" stroke="#E1CAB3" stroke-width="2"/>
  <text x="142" y="176" text-anchor="middle" fill="#201715" font-family="IBM Plex Mono, monospace" font-size="40" font-weight="700">${escapeXml(mono)}</text>
  <text x="76" y="280" fill="#D8B89A" font-family="IBM Plex Mono, monospace" font-size="20" letter-spacing="2.8">${escapeXml(label)}</text>
  ${titleLines
    .map(
      (line, index) =>
        `<text x="76" y="${356 + index * 58}" fill="#FBF4EC" font-family="Fraunces, Georgia, serif" font-size="46" font-weight="600">${escapeXml(
          line
        )}</text>`
    )
    .join("\n  ")}
  ${authorLines
    .map(
      (line, index) =>
        `<text x="76" y="${702 + index * 30}" fill="#DCCAB9" font-family="IBM Plex Mono, monospace" font-size="24">${escapeXml(
          line
        )}</text>`
    )
    .join("\n  ")}
  <path d="M76 808H564" stroke="#5A4B45" stroke-width="1.4"/>
  ${seriesLines
    .map(
      (line, index) =>
        `<text x="76" y="${856 + index * 28}" fill="#BFA896" font-family="IBM Plex Mono, monospace" font-size="20" letter-spacing="1.3">${escapeXml(
          line.toUpperCase()
        )}</text>`
    )
    .join("\n  ")}
</svg>
`;

  fs.writeFileSync(destination, svg);
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "CodexBookSync/1.0",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status}`);
  }

  return response.json();
}

function scoreGoogleItem(book, item, index) {
  const info = item.volumeInfo || {};
  const itemTitle = normalize(info.title || "");
  const bookTitle = normalize(book.title);
  const itemSubtitle = normalize(info.subtitle || "");
  const authorNames = normalize((info.authors || []).join(" "));
  const bookAuthor = normalize(book.author);

  let score = 0;
  if (itemTitle === bookTitle) score += 8;
  if (itemTitle.includes(bookTitle) || bookTitle.includes(itemTitle)) score += 4;
  if (itemSubtitle && bookTitle.includes(itemSubtitle)) score += 1.5;
  if (authorNames.includes(bookAuthor) || bookAuthor.includes(authorNames)) score += 3;
  if ((info.printType || "") === "BOOK") score += 1;
  score += Math.max(0, 1 - index * 0.15);
  return score;
}

async function lookupGoogleBook(book) {
  const queryTitle = book.google_title || book.title;
  const query = encodeURIComponent(`intitle:${queryTitle} inauthor:${book.author}`);
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&printType=books&langRestrict=en&maxResults=5`;
  const data = await fetchJson(url);
  const items = Array.isArray(data.items) ? data.items : [];
  if (!items.length) return null;

  const ranked = items
    .map((item, index) => ({ item, score: scoreGoogleItem(book, item, index) }))
    .sort((a, b) => b.score - a.score);

  return ranked[0].item;
}

async function lookupOpenLibrary(book) {
  const queryTitle = book.openlibrary_title || book.title;
  const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(queryTitle)}&author=${encodeURIComponent(
    book.author
  )}&limit=5`;
  const data = await fetchJson(url);
  const docs = Array.isArray(data.docs) ? data.docs : [];
  if (!docs.length) return null;

  const bookTitle = normalize(book.title);
  const bookAuthor = normalize(book.author);

  const ranked = docs
    .map((doc, index) => {
      const title = normalize(doc.title || "");
      const authors = normalize((doc.author_name || []).join(" "));
      let score = 0;
      if (title === bookTitle) score += 8;
      if (title.includes(bookTitle) || bookTitle.includes(title)) score += 4;
      if (authors.includes(bookAuthor) || bookAuthor.includes(authors)) score += 3;
      score += Math.max(0, 1 - index * 0.15);
      return { doc, score };
    })
    .sort((a, b) => b.score - a.score);

  return ranked[0].doc;
}

function bestIsbn(industryIdentifiers = []) {
  const isbn13 = industryIdentifiers.find((item) => item.type === "ISBN_13");
  const isbn10 = industryIdentifiers.find((item) => item.type === "ISBN_10");
  return (isbn13 && isbn13.identifier) || (isbn10 && isbn10.identifier) || "";
}

async function downloadCover(coverUrl, outputPath) {
  const response = await fetch(coverUrl, {
    headers: {
      "User-Agent": "CodexBookSync/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Cover request failed: ${coverUrl} (${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const tempBase = path.join(os.tmpdir(), `book-cover-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const tempInput = `${tempBase}.img`;
  const tempOutput = `${tempBase}.png`;
  fs.writeFileSync(tempInput, Buffer.from(arrayBuffer));

  try {
    execFileSync("sips", ["-s", "format", "png", tempInput, "--out", tempOutput], { stdio: "ignore" });
    fs.copyFileSync(tempOutput, outputPath);
  } finally {
    if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
    if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
  }
}

function buildMarkdown(book, coverImage, amazonUrl) {
  const notePrompt = `## Why this book stayed with me

[Write 1-3 paragraphs about the emotional, intellectual, or practical impact of this book.]

## What I kept returning to

- [Idea, scene, argument, or pattern]
- [Idea, scene, argument, or pattern]
- [Idea, scene, argument, or pattern]

## Where it still shows up

[Write about how this book still shapes your work, your reading, or the way you notice systems.]

## Who I would hand it to

[Write about the kind of reader or moment this book is right for.]
`;

  return `---
title: "${yamlEscape(book.title)}"
author: "${yamlEscape(book.author)}"
category: "${yamlEscape(book.category)}"
${book.series ? `series: "${yamlEscape(book.series)}"\n` : ""}${book.currently_reading ? "currently_reading: true\n" : ""}order: ${book.order}
amazon_url: "${yamlEscape(amazonUrl)}"
cover_image: "${yamlEscape(coverImage)}"
impact_blurb: ""
key_idea: ""
lasting_impact: ""
recommended_for: ""
reflection_status: "Draft"
---

${notePrompt}
`;
}

function readExistingFields(markdownPath) {
  if (!fs.existsSync(markdownPath)) return {};
  const raw = fs.readFileSync(markdownPath, "utf8");
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return {};

  const frontmatter = frontmatterMatch[1];
  const fields = {};
  ["impact_blurb", "key_idea", "lasting_impact", "recommended_for", "reflection_status"].forEach((key) => {
    const match = frontmatter.match(new RegExp(`^${key}:\\s*"(.*)"$`, "m"));
    if (match) {
      fields[key] = match[1];
    }
  });
  return fields;
}

function buildMarkdownFromExisting(book, coverImage, amazonUrl, existing) {
  const base = buildMarkdown(book, coverImage, amazonUrl);
  return base
    .replace('impact_blurb: ""', `impact_blurb: "${yamlEscape(existing.impact_blurb || "")}"`)
    .replace('key_idea: ""', `key_idea: "${yamlEscape(existing.key_idea || "")}"`)
    .replace('lasting_impact: ""', `lasting_impact: "${yamlEscape(existing.lasting_impact || "")}"`)
    .replace('recommended_for: ""', `recommended_for: "${yamlEscape(existing.recommended_for || "")}"`)
    .replace('reflection_status: "Draft"', `reflection_status: "${yamlEscape(existing.reflection_status || "Draft")}"`);
}

async function syncBook(book) {
  const slug = slugify(book.title);
  const markdownPath = path.join(BOOKS_DIR, `${slug}.md`);
  const pngCoverOutput = path.join(COVERS_DIR, `${slug}.png`);
  const svgCoverOutput = path.join(COVERS_DIR, `${slug}.svg`);
  let coverImage = existingCoverImage(slug);

  let googleItem = null;
  let openLibraryDoc = null;

  try {
    googleItem = await lookupGoogleBook(book);
  } catch (error) {
    console.error(`Google Books lookup failed for ${book.title}: ${error.message}`);
  }

  if (!googleItem) {
    try {
      openLibraryDoc = await lookupOpenLibrary(book);
    } catch (error) {
      console.error(`Open Library lookup failed for ${book.title}: ${error.message}`);
    }
  }

  const info = googleItem ? googleItem.volumeInfo || {} : {};
  const isbn = bestIsbn(info.industryIdentifiers || []) || (openLibraryDoc && (openLibraryDoc.isbn || [])[0]) || "";
  const amazonQuery = book.amazon_query || isbn || `${book.title} ${book.author}`;
  const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(amazonQuery)}`;

  let coverUrl = book.cover_url || "";
  if (info.imageLinks) {
    coverUrl =
      info.imageLinks.extraLarge ||
      info.imageLinks.large ||
      info.imageLinks.medium ||
      info.imageLinks.thumbnail ||
      info.imageLinks.smallThumbnail ||
      "";
  }

  if (!coverUrl && openLibraryDoc && openLibraryDoc.cover_i) {
    coverUrl = `https://covers.openlibrary.org/b/id/${openLibraryDoc.cover_i}-L.jpg`;
  }

  if (coverUrl) {
    coverUrl = coverUrl.replace(/^http:\/\//i, "https://");
  }

  if (!coverImage && coverUrl) {
    try {
      await downloadCover(coverUrl, pngCoverOutput);
      coverImage = coverImagePath(slug, "png");
    } catch (error) {
      console.error(`Cover download failed for ${book.title}: ${error.message}`);
    }
  }

  if (!coverImage) {
    if (!fs.existsSync(svgCoverOutput)) {
      createGeneratedCover(book, svgCoverOutput);
    }
    coverImage = coverImagePath(slug, "svg");
  }

  const existingFields = readExistingFields(markdownPath);
  const markdown = buildMarkdownFromExisting(book, coverImage, amazonUrl, existingFields);

  if (!fs.existsSync(markdownPath)) {
    fs.writeFileSync(markdownPath, markdown);
  } else {
    const current = fs.readFileSync(markdownPath, "utf8");
    if (!current.includes('reflection_status:')) {
      fs.writeFileSync(markdownPath, markdown);
    }
  }

  return { title: book.title, amazonUrl, coverImage };
}

async function main() {
  fs.mkdirSync(BOOKS_DIR, { recursive: true });
  fs.mkdirSync(COVERS_DIR, { recursive: true });

  const results = [];
  const failures = [];

  for (const book of BOOKS) {
    try {
      const result = await syncBook(book);
      results.push(result);
      console.log(`Synced ${book.title}`);
    } catch (error) {
      failures.push({ title: book.title, message: error.message });
      console.error(`Failed ${book.title}: ${error.message}`);
    }
  }

  console.log(`\nSynced ${results.length} books.`);
  if (failures.length) {
    console.log(`Missing ${failures.length} books:`);
    failures.forEach((failure) => console.log(`- ${failure.title}: ${failure.message}`));
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
