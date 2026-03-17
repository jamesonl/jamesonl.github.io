const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

const ROOT = process.cwd();
const BOOKS_DIR = path.join(ROOT, "_books");
const COVERS_DIR = path.join(ROOT, "images", "book-covers");

const BOOKS = [
  { title: "Prelude to Foundation", author: "Isaac Asimov", category: "Science Fiction", series: "Foundation series", order: 101 },
  { title: "Forward the Foundation", author: "Isaac Asimov", category: "Science Fiction", series: "Foundation series", order: 102 },
  { title: "Foundation", author: "Isaac Asimov", category: "Science Fiction", series: "Foundation series", order: 103 },
  { title: "Foundation and Empire", author: "Isaac Asimov", category: "Science Fiction", series: "Foundation series", order: 104 },
  { title: "Second Foundation", author: "Isaac Asimov", category: "Science Fiction", series: "Foundation series", order: 105 },
  { title: "Foundation's Edge", author: "Isaac Asimov", category: "Science Fiction", series: "Foundation series", order: 106 },
  { title: "Foundation and Earth", author: "Isaac Asimov", category: "Science Fiction", series: "Foundation series", order: 107 },
  { title: "Foundation's Fear", author: "Gregory Benford", category: "Science Fiction", series: "Second Foundation Trilogy", order: 108 },
  { title: "Foundation and Chaos", author: "Greg Bear", category: "Science Fiction", series: "Second Foundation Trilogy", order: 109 },
  {
    title: "Foundation's Triumph",
    author: "David Brin",
    category: "Science Fiction",
    series: "Second Foundation Trilogy",
    order: 110,
    cover_url: "https://covers.openlibrary.org/b/id/44242-L.jpg",
  },
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
  { title: "The Dream Machine", author: "M. Mitchell Waldrop", category: "Nonfiction", order: 301 },
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
${book.series ? `series: "${yamlEscape(book.series)}"\n` : ""}order: ${book.order}
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
  const coverOutput = path.join(COVERS_DIR, `${slug}.png`);
  const coverImage = `/images/book-covers/${slug}.png`;

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

  if (!fs.existsSync(coverOutput)) {
    if (!coverUrl) {
      throw new Error(`No cover found for ${book.title}`);
    }
    await downloadCover(coverUrl, coverOutput);
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
