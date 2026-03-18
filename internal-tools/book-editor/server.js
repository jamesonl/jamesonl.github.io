const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const ROOT = path.resolve(__dirname, "../..");
const BOOKS_DIR = path.join(ROOT, "_books");
const STATIC_DIR = __dirname;
const PORT = Number(process.env.BOOK_EDITOR_PORT || 4110);
const HOST = process.env.BOOK_EDITOR_HOST || "127.0.0.1";

const KNOWN_FIELDS = [
  "title",
  "author",
  "category",
  "series",
  "order",
  "amazon_url",
  "cover_image",
  "impact_blurb",
  "key_idea",
  "lasting_impact",
  "recommended_for",
  "reflection_status",
];

const BODY_SECTION_FIELDS = [
  {
    key: "why_this_book_stayed_with_me",
    heading: "Why this book stayed with me",
    type: "text",
    placeholder: "[Write 1-3 paragraphs about the emotional, intellectual, or practical impact of this book.]",
  },
  {
    key: "what_i_kept_returning_to",
    heading: "What I kept returning to",
    type: "list",
    placeholder: "[Idea, scene, argument, or pattern]",
  },
  {
    key: "where_it_still_shows_up",
    heading: "Where it still shows up",
    type: "text",
    placeholder: "[Write about how this book still shapes your work, your reading, or the way you notice systems.]",
  },
  {
    key: "who_i_would_hand_it_to",
    heading: "Who I would hand it to",
    type: "text",
    placeholder: "[Write about the kind of reader or moment this book is right for.]",
  },
];

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function yamlEscape(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function parseScalar(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^-?\d+$/.test(trimmed)) return Number.parseInt(trimmed, 10);
  const quoted = trimmed.match(/^"(.*)"$/);
  if (quoted) {
    return quoted[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  return trimmed;
}

function formatScalar(key, value) {
  if (key === "order") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? String(parsed) : "0";
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  return `"${yamlEscape(value ?? "")}"`;
}

function splitDocument(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return {
      frontmatter: "",
      body: raw,
    };
  }
  return {
    frontmatter: match[1],
    body: match[2],
  };
}

function normalizeBodyForEditor(body) {
  return String(body || "").replace(/^\n+/, "").replace(/\n+$/, "");
}

function parseBookBodySections(body) {
  const normalizedBody = normalizeBodyForEditor(body).replace(/\r\n/g, "\n");
  const sections = Object.fromEntries(BODY_SECTION_FIELDS.map(({ key }) => [key, ""]));

  BODY_SECTION_FIELDS.forEach((field, index) => {
    const heading = `## ${field.heading}`;
    const sectionStart = normalizedBody.indexOf(heading);
    if (sectionStart === -1) return;

    const contentStart = sectionStart + heading.length;
    let contentEnd = normalizedBody.length;

    for (let cursor = index + 1; cursor < BODY_SECTION_FIELDS.length; cursor += 1) {
      const nextHeading = normalizedBody.indexOf(`## ${BODY_SECTION_FIELDS[cursor].heading}`, contentStart);
      if (nextHeading !== -1) {
        contentEnd = nextHeading;
        break;
      }
    }

    const rawContent = normalizeBodyForEditor(normalizedBody.slice(contentStart, contentEnd));
    if (!rawContent) return;

    if (field.type === "list") {
      const items = rawContent
        .split("\n")
        .map((line) => line.replace(/^\s*[-*]\s+/, "").trim())
        .filter(Boolean)
        .filter((item) => item !== field.placeholder);
      sections[field.key] = items.join("\n");
      return;
    }

    sections[field.key] = rawContent === field.placeholder ? "" : rawContent;
  });

  return sections;
}

function buildBookBodyFromSections(payload) {
  return BODY_SECTION_FIELDS.map((field) => {
    if (field.type === "list") {
      const items = normalizeBodyForEditor(payload[field.key])
        .split("\n")
        .map((line) => line.replace(/^\s*[-*]\s+/, "").trim())
        .filter(Boolean);
      const list = items.length
        ? items.map((item) => `- ${item}`).join("\n")
        : `- ${field.placeholder}\n- ${field.placeholder}\n- ${field.placeholder}`;
      return `## ${field.heading}\n\n${list}`;
    }

    const text = normalizeBodyForEditor(payload[field.key]) || field.placeholder;
    return `## ${field.heading}\n\n${text}`;
  }).join("\n\n");
}

function parseFrontmatter(text) {
  const fields = {};
  text
    .split("\n")
    .map((line) => line.trimEnd())
    .forEach((line) => {
      const match = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
      if (!match) return;
      fields[match[1]] = parseScalar(match[2]);
    });
  return fields;
}

function readBook(fileName) {
  const slug = fileName.replace(/\.md$/, "");
  const fullPath = path.join(BOOKS_DIR, fileName);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { frontmatter, body } = splitDocument(raw);
  const fields = parseFrontmatter(frontmatter);
  const response = {
    slug,
    file: `/_books/${fileName}`,
    bodyMarkdown: normalizeBodyForEditor(body),
  };
  const bodySections = parseBookBodySections(body);

  KNOWN_FIELDS.forEach((key) => {
    response[key] = fields[key] ?? (key === "order" ? 0 : "");
  });

  BODY_SECTION_FIELDS.forEach(({ key }) => {
    response[key] = bodySections[key] || "";
  });

  Object.entries(fields).forEach(([key, value]) => {
    if (!KNOWN_FIELDS.includes(key)) {
      response[key] = value;
    }
  });

  return response;
}

function listBooks() {
  return fs
    .readdirSync(BOOKS_DIR)
    .filter((file) => file.endsWith(".md"))
    .map(readBook)
    .sort((a, b) => {
      const orderA = Number.parseInt(a.order, 10) || 0;
      const orderB = Number.parseInt(b.order, 10) || 0;
      if (orderA !== orderB) return orderA - orderB;
      return String(a.title || "").localeCompare(String(b.title || ""));
    });
}

function assertSafePath(baseDir, requestedPath) {
  const resolved = path.resolve(baseDir, requestedPath);
  const relative = path.relative(baseDir, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Forbidden path");
  }
  return resolved;
}

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

function sendFile(response, fullPath) {
  const ext = path.extname(fullPath).toLowerCase();
  const mime = MIME_TYPES[ext] || "application/octet-stream";
  const stat = fs.statSync(fullPath);
  response.writeHead(200, {
    "Content-Type": mime,
    "Content-Length": stat.size,
  });
  fs.createReadStream(fullPath).pipe(response);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 4 * 1024 * 1024) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(raw));
    request.on("error", reject);
  });
}

function buildFrontmatter(existingFields, payload) {
  const merged = { ...existingFields };
  KNOWN_FIELDS.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      merged[key] = payload[key];
    }
  });

  const lines = [];
  KNOWN_FIELDS.forEach((key) => {
    const value = merged[key];
    if (key === "series" && !value) return;
    lines.push(`${key}: ${formatScalar(key, value)}`);
  });

  Object.entries(merged).forEach(([key, value]) => {
    if (KNOWN_FIELDS.includes(key)) return;
    lines.push(`${key}: ${formatScalar(key, value)}`);
  });

  return lines.join("\n");
}

function saveBook(slug, payload) {
  const safeSlug = slugify(slug);
  const fileName = `${safeSlug}.md`;
  const fullPath = assertSafePath(BOOKS_DIR, fileName);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Unknown book slug: ${safeSlug}`);
  }

  const raw = fs.readFileSync(fullPath, "utf8");
  const { frontmatter, body } = splitDocument(raw);
  const existingFields = parseFrontmatter(frontmatter);
  const nextFrontmatter = buildFrontmatter(existingFields, payload);
  const nextSections = parseBookBodySections(body);
  BODY_SECTION_FIELDS.forEach(({ key }) => {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      nextSections[key] = payload[key];
    }
  });
  const nextBody = Object.prototype.hasOwnProperty.call(payload, "bodyMarkdown")
    ? normalizeBodyForEditor(payload.bodyMarkdown)
    : buildBookBodyFromSections(nextSections);
  const currentFrontmatter = String(frontmatter || "").trimEnd();
  const currentBody = normalizeBodyForEditor(body);

  if (nextFrontmatter === currentFrontmatter && nextBody === currentBody) {
    return readBook(fileName);
  }

  const document = nextBody
    ? `---\n${nextFrontmatter}\n---\n\n${nextBody}\n`
    : `---\n${nextFrontmatter}\n---\n`;

  fs.writeFileSync(fullPath, document);
  return readBook(fileName);
}

function serveStatic(requestPath, response) {
  const relativePath = requestPath === "/" ? "index.html" : requestPath.slice(1);
  const fullPath = assertSafePath(STATIC_DIR, relativePath);
  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }
  sendFile(response, fullPath);
}

function serveRepoAsset(requestPath, response) {
  const relativePath = requestPath.replace(/^\/repo\//, "");
  const fullPath = assertSafePath(ROOT, relativePath);
  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }
  sendFile(response, fullPath);
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const method = request.method === "HEAD" ? "GET" : request.method;

    if (request.method === "HEAD") {
      const originalEnd = response.end.bind(response);
      response.end = (...args) => originalEnd();
    }

    if (method === "GET" && url.pathname === "/api/books") {
      sendJson(response, 200, { books: listBooks() });
      return;
    }

    if (method === "PUT" && url.pathname.startsWith("/api/books/")) {
      const slug = url.pathname.replace(/^\/api\/books\//, "");
      const rawBody = await readBody(request);
      const payload = JSON.parse(rawBody || "{}");
      const saved = saveBook(slug, payload);
      sendJson(response, 200, { book: saved });
      return;
    }

    if (method === "GET" && url.pathname.startsWith("/repo/")) {
      serveRepoAsset(url.pathname, response);
      return;
    }

    if (method === "GET") {
      serveStatic(url.pathname, response);
      return;
    }

    response.writeHead(405);
    response.end("Method not allowed");
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Book editor running at http://${HOST}:${PORT}`);
});
