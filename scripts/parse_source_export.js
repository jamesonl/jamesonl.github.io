const fs = require("fs");

const raw = fs.readFileSync(0, "utf8");

const SECTION = {
  NONE: "none",
  EXPLICIT: "explicit",
  URLLESS: "urlless",
  NOTEBOOKS: "notebooks",
  WEEKLY: "weekly",
};

const EXCLUDED_DOMAINS = [
  "washingtonpost.com",
  "masslive.com",
  "fool.com",
  "techcrunch.com",
  "forbes.com",
  "bloomberg.com",
  "slideshare.net",
  "quora.com",
  "goldcast.io",
  "ondemand.goldcast.io",
  "ted.com",
  "twimlai.com",
  "modernlovelongdistance.com",
  "todoist.com",
  "chatgpt.com",
  "medium.com",
  "theverge.com",
];

const EXCLUDED_TITLE_PATTERNS = [
  /earnings call/i,
  /podcast/i,
  /challenge/i,
  /interview/i,
  /launch customer/i,
  /\bvideo\b/i,
  /all holes/i,
  /money in a long distance relationship/i,
  /how to introduce yourself/i,
  /browser history with python/i,
  /the rise \(and role\) of the technology evangelist/i,
  /private equity discount programs/i,
  /vending-bench/i,
  /review of mauna kea caddy corner/i,
  /read this before you hire a community manager/i,
  /basketball$/i,
  /russian vs\. american kettlebell swing/i,
  /spine mechanics for lifters/i,
  /ladder method/i,
  /deadlift/i,
  /through the bar/i,
];

const EXCLUDED_URL_PATTERNS = [/chatgpt\.com\/c\//i, /docs\.google\.com\/spreadsheets/i, /todoist\.com/i];

const FEATURED_TITLES = new Set([
  "Dan Wang's 2019 Annual Letter",
  "How to take smart notes",
  "Tools for Thought: The Concept of a Support System",
  "A Big Little Idea Called Legibility - Venkatesh Rao",
  "Dancing with Systems",
  "The Extended Mind by Andy Clark & David J. Chalmers",
  "The Illustrated Transformer",
  "Building Effective Agents",
  "A system literacy manifesto by Hugh Dubberly, October 2014",
  "Language is primarily a tool for communication rather than thought",
  "MemGPT: Towards LLMs as Operating Systems",
]);

const CATEGORY_RULES = [
  {
    category: "Forecasting & Operations",
    patterns: [
      /\bforecast/i,
      /\bforecasting/i,
      /\bpredictive/i,
      /\bdemand\b/i,
      /\binventory/i,
      /\blogistics/i,
      /\bsupply chain/i,
      /\btime series/i,
      /\bparts\b/i,
      /\bworkforce management/i,
      /\boperations?\b/i,
      /\bmro\b/i,
      /\bscenario\b/i,
      /\bstate[- ]space/i,
      /\bplanning\b/i,
    ],
  },
  {
    category: "AI & Language",
    patterns: [
      /\bai\b/i,
      /\blanguage model/i,
      /\bllm/i,
      /\btransformer/i,
      /\bbert\b/i,
      /\bnlp\b/i,
      /\bretrieval/i,
      /\brag\b/i,
      /\bagent/i,
      /\brlhf/i,
      /\bconstitutional ai/i,
      /\bdeep learning/i,
      /\bneural/i,
      /\bembedding/i,
      /\bopenai\b/i,
      /\banthropic\b/i,
      /\beleuther/i,
      /\bdspy\b/i,
      /\bgraphrag\b/i,
      /\bcontextualized representations/i,
      /\bfew-shot/i,
      /\battention is all you need/i,
    ],
  },
  {
    category: "Tools for Thought",
    patterns: [
      /\btools for thought/i,
      /\bsmart notes/i,
      /\bnotes\b/i,
      /\bnotation/i,
      /\bshared knowledge/i,
      /\blocal-first/i,
      /\bdynabook/i,
      /\bopen tabs/i,
      /\bbrowser history/i,
      /\bknowledge/i,
      /\bmemory/i,
      /\bfile system/i,
      /\borbit\b/i,
      /\bcool tools/i,
      /\btabs are cognitive spaces/i,
      /\bevernote/i,
      /\btaxonom/i,
      /\bslack\b/i,
      /\bdocumentation\b/i,
    ],
  },
  {
    category: "Systems & Sensemaking",
    patterns: [
      /\bsystem/i,
      /\bemerg/i,
      /\blegibil/i,
      /\bcomplex/i,
      /\bcybernet/i,
      /\bcoordination/i,
      /\borganization/i,
      /\borganizational/i,
      /\bhierarchy/i,
      /\bsensemaking/i,
      /\booda/i,
      /\bchoice architecture/i,
      /\binteractive planning/i,
      /\bdesign thinking/i,
      /\bconway/i,
      /\bscenario/i,
      /\bnetwork-centric/i,
      /\bextended mind/i,
      /\binterface theory/i,
      /\bhebbian/i,
      /\bknot theory/i,
      /\bself-organization/i,
    ],
  },
  {
    category: "Design & Interfaces",
    patterns: [
      /\bdesign\b/i,
      /\binterface/i,
      /\binteraction/i,
      /\bvisual/i,
      /\bnotation/i,
      /\bcolor/i,
      /\bui\b/i,
      /\bux\b/i,
      /\baccessibility/i,
      /\bgenre lifecycle/i,
      /\bjourneys & notes/i,
      /\bsocial computing/i,
    ],
  },
  {
    category: "Organizations & Strategy",
    patterns: [
      /\bvc\b/i,
      /\bventure/i,
      /\bmarketing/i,
      /\bcommunity\b/i,
      /\bboard\b/i,
      /\bgo-to-market/i,
      /\bgrowth\b/i,
      /\boperator/i,
      /\barr\b/i,
      /\bnrr\b/i,
      /\bdue diligence/i,
      /\brevenue/i,
      /\bmanager\b/i,
      /\bsaas\b/i,
      /\bcommand of the message/i,
      /\bcorporate venture/i,
    ],
  },
];

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

function rootDomain(hostname) {
  const clean = String(hostname || "").replace(/^www\./i, "");
  const parts = clean.split(".").filter(Boolean);
  if (parts.length <= 2) return clean;
  return parts.slice(-2).join(".");
}

function prettyPublication(domain) {
  if (!domain) return "";
  const map = {
    "arxiv.org": "arXiv",
    "aclanthology.org": "ACL Anthology",
    "en.wikipedia.org": "Wikipedia",
    "anthropic.com": "Anthropic",
    "openai.github.io": "OpenAI",
    "jalammar.github.io": "Jay Alammar",
    "redblobgames.com": "Red Blob Games",
    "systems-thinking.org": "Systems Thinking",
    "kellblog.com": "Kellblog",
    "danwang.co": "Dan Wang",
    "devonzuegel.com": "Devon Zuegel",
    "andymatuschak.org": "Andy Matuschak",
    "ribbonfarm.com": "Ribbonfarm",
    "lesswrong.com": "LessWrong",
    "ocw.mit.edu": "MIT OpenCourseWare",
    "mro-network.com": "MRO Network",
  };
  if (map[domain]) return map[domain];
  return domain
    .replace(/^www\./i, "")
    .replace(/\.(com|org|net|edu|io|co|ai|gov)$/i, "")
    .split(/[.-]+/)
    .map((piece) => piece.charAt(0).toUpperCase() + piece.slice(1))
    .join(" ");
}

function classifySourceType(entry) {
  if (entry.noteType) return entry.noteType;
  const haystack = `${entry.title} ${entry.url || ""}`;
  if (/wikipedia/i.test(haystack)) return "Reference";
  if (/arxiv|aclanthology|nber|paper|pdf|proceedings|tacl|findings-emnlp|neurips/i.test(haystack)) return "Paper";
  if (/manual|guide|roadmap|whitepaper|report|docs|documentation/i.test(haystack)) return "Manual";
  if (/book|kindle|memoir|review/i.test(haystack)) return "Book";
  if (/essay|letter|notes|manifesto|reflections|philosophy/i.test(haystack)) return "Essay";
  if (/notebook/i.test(haystack)) return "Notebook";
  return "Article";
}

function classifyCategory(entry) {
  if (entry.kind === "notebook" || /book|kindle|manual|notebook|review/i.test(entry.noteType || "")) {
    return "Books, Manuals & Notebooks";
  }

  const haystack = `${entry.title} ${entry.url || ""} ${entry.domain || ""}`;
  const scores = CATEGORY_RULES.map((rule) => ({
    category: rule.category,
    score: rule.patterns.reduce((count, pattern) => count + (pattern.test(haystack) ? 1 : 0), 0),
  })).sort((a, b) => b.score - a.score);

  if (scores[0].score === 0) return "";
  return scores[0].category;
}

function looksGenericHomepage(entry) {
  if (!entry.url) return false;
  try {
    const url = new URL(entry.url);
    const barePath = url.pathname === "/" || url.pathname === "";
    const title = normalize(entry.title);
    const domainName = normalize(prettyPublication(rootDomain(url.hostname)));
    return barePath && (title === domainName || /website$/.test(title));
  } catch (_error) {
    return false;
  }
}

function shouldExclude(entry) {
  const domain = entry.domain || "";
  const title = entry.title || "";
  const url = entry.url || "";

  if (EXCLUDED_DOMAINS.some((item) => domain === item || domain.endsWith(`.${item}`))) return true;
  if (EXCLUDED_TITLE_PATTERNS.some((pattern) => pattern.test(title))) return true;
  if (EXCLUDED_URL_PATTERNS.some((pattern) => pattern.test(url))) return true;
  if (looksGenericHomepage(entry)) return true;
  if (!classifyCategory(entry)) return true;
  return false;
}

function parseLinkedLine(line) {
  const match = line.match(/^- (\d{4}(?:-\d{2}-\d{2}|-W\d{2})): \[(.+?)\]\((https?:\/\/.+?)\)(?: .*)?$/);
  if (!match) return null;
  const [, firstSeen, title, url] = match;
  const domain = rootDomain(new URL(url).hostname);
  return {
    kind: "web",
    first_seen: firstSeen,
    title: title.trim(),
    url: url.trim(),
    domain,
  };
}

function parseUrllessLine(line) {
  const match = line.match(/^- (\d{4}-\d{2}-\d{2}): (.+?) \((kindle|book|manual|paper|review)\)$/i);
  if (!match) return null;
  const [, firstSeen, title, noteType] = match;
  return {
    kind: "urlless",
    first_seen: firstSeen,
    title: title.trim(),
    url: "",
    noteType: noteType.charAt(0).toUpperCase() + noteType.slice(1).toLowerCase(),
  };
}

function parseNotebookLine(line) {
  const match = line.match(/^- (.+?) \((\d+) files; categories: (.+)\)$/);
  if (!match) return null;
  const [, title] = match;
  return {
    kind: "notebook",
    first_seen: "",
    title: title.trim(),
    url: "",
    noteType: "Notebook",
  };
}

function parseAuthorFromTitle(title) {
  const byMatch = title.match(/\s+by\s+(.+)$/i);
  if (byMatch) return byMatch[1].trim();
  return "";
}

function makeEntry(parsed) {
  const source_type = classifySourceType(parsed);
  const category = classifyCategory(parsed);
  const publication = prettyPublication(parsed.domain || "");
  const creator = parsed.kind === "web" ? "" : parseAuthorFromTitle(parsed.title);
  const slug = slugify(
    parsed.kind === "web" ? `${parsed.first_seen}-${parsed.title}` : `${parsed.title}-${parsed.first_seen || source_type}`
  );

  return {
    slug,
    title: parsed.title,
    source_url: parsed.url || "",
    domain: parsed.domain || "",
    publication,
    creator,
    category,
    source_type,
    first_seen: parsed.first_seen || "",
    theme_slug: slugify(category),
    featured: FEATURED_TITLES.has(parsed.title),
    reflection_status: "Draft",
  };
}

function dedupe(entries) {
  const seen = new Map();
  entries.forEach((entry) => {
    const key = entry.source_url ? `url:${entry.source_url}` : `title:${normalize(entry.title)}`;
    if (!seen.has(key)) {
      seen.set(key, entry);
      return;
    }

    const existing = seen.get(key);
    const existingScore = Number(Boolean(existing.source_url)) + Number(Boolean(existing.first_seen));
    const nextScore = Number(Boolean(entry.source_url)) + Number(Boolean(entry.first_seen));
    if (nextScore > existingScore) {
      seen.set(key, entry);
    }
  });

  return Array.from(seen.values());
}

let currentSection = SECTION.NONE;
const parsedEntries = [];

raw.split(/\r?\n/).forEach((line) => {
  if (line.startsWith("## Explicit Web Sources")) {
    currentSection = SECTION.EXPLICIT;
    return;
  }
  if (line.startsWith("## Books, Manuals, and Papers Without Stable URLs")) {
    currentSection = SECTION.URLLESS;
    return;
  }
  if (line.startsWith("## Book Notebooks")) {
    currentSection = SECTION.NOTEBOOKS;
    return;
  }
  if (line.startsWith("## Weekly Summary-Only Citations")) {
    currentSection = SECTION.WEEKLY;
    return;
  }
  if (!line.startsWith("- ")) return;

  if (currentSection === SECTION.EXPLICIT || currentSection === SECTION.WEEKLY) {
    const linked = parseLinkedLine(line);
    if (linked) parsedEntries.push(linked);
    return;
  }

  if (currentSection === SECTION.URLLESS) {
    const urlless = parseUrllessLine(line);
    if (urlless) parsedEntries.push(urlless);
    return;
  }

  if (currentSection === SECTION.NOTEBOOKS) {
    const notebook = parseNotebookLine(line);
    if (notebook) parsedEntries.push(notebook);
  }
});

const curated = dedupe(parsedEntries)
  .filter((entry) => !shouldExclude(entry))
  .map(makeEntry)
  .sort((a, b) => {
    if (a.category === b.category) {
      return a.title.localeCompare(b.title);
    }
    return a.category.localeCompare(b.category);
  });

process.stdout.write(`${JSON.stringify(curated, null, 2)}\n`);
