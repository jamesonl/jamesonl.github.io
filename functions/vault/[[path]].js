const encoder = new TextEncoder();

function normalizePath(pathname) {
  if (!pathname.endsWith("/")) {
    return `${pathname}/`;
  }
  return pathname;
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return toHex(signature);
}

function timingSafeEqual(left, right) {
  if (!left || !right || left.length !== right.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

function extractCompanySlug(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  return parts[1] || "unknown";
}

function renderState({ title, body, status, contactEmail }) {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>${title}</title>
    <link rel="icon" type="image/svg+xml" href="/images/favicon.svg" />
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body class="site-body">
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="site-wrapper">
      <main id="main-content" class="site-main">
        <div class="site-inner">
          <article class="page vault-page">
            <header class="page-header">
              <p class="page-kicker">Private company brief</p>
              <h1 class="page-title">${title}</h1>
              <p class="page-tagline">${body}</p>
            </header>
            <div class="page-body">
              <p>If you expected access to this page, email <a href="mailto:${contactEmail}">${contactEmail}</a> and I can send a fresh signed link.</p>
              <p><a class="link-button" href="/contact/">Go to contact page</a></p>
            </div>
          </article>
        </div>
      </main>
    </div>
  </body>
</html>`,
    {
      status,
      headers: {
        "content-type": "text/html; charset=UTF-8",
        "cache-control": "no-store",
        "x-robots-tag": "noindex, nofollow",
      },
    },
  );
}

async function logAccess(env, event) {
  if (!env.VAULT_LOGS || typeof env.VAULT_LOGS.writeDataPoint !== "function") {
    return;
  }

  await env.VAULT_LOGS.writeDataPoint({
    indexes: [event.pageSlug, event.companySlug, event.status],
    blobs: [event.tokenId, event.referrer, event.userAgent],
    doubles: [event.timestamp, event.expiresAt],
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  if (!["GET", "HEAD"].includes(request.method)) {
    return new Response("Method not allowed", { status: 405 });
  }

  const url = new URL(request.url);
  const normalizedPath = normalizePath(url.pathname);
  const companySlug = extractCompanySlug(normalizedPath);
  const tokenId = url.searchParams.get("tid") || "";
  const expiresAtRaw = url.searchParams.get("exp") || "";
  const signature = url.searchParams.get("sig") || "";
  const timestamp = Math.floor(Date.now() / 1000);
  const userAgent = request.headers.get("user-agent") || "";
  const referrer = request.headers.get("referer") || "";
  const expiresAt = Number.parseInt(expiresAtRaw, 10);
  const pageSlug = normalizedPath.replace(/^\/+|\/+$/g, "") || "vault";
  const baseEvent = {
    companySlug,
    pageSlug,
    referrer,
    status: "denied",
    timestamp,
    tokenId,
    userAgent,
    expiresAt: Number.isFinite(expiresAt) ? expiresAt : 0,
  };

  if (!env.VAULT_SIGNING_KEY) {
    return renderState({
      title: "Vault configuration missing",
      body: "This private page cannot be served because the signing key has not been configured in Cloudflare.",
      status: 500,
      contactEmail: "jameson.lee@emergence.studio",
    });
  }

  if (!tokenId || !signature || !Number.isFinite(expiresAt)) {
    await logAccess(env, baseEvent);
    return renderState({
      title: "Signed link required",
      body: "This private page is only available through a signed link.",
      status: 403,
      contactEmail: "jameson.lee@emergence.studio",
    });
  }

  if (expiresAt < timestamp) {
    await logAccess(env, { ...baseEvent, status: "expired" });
    return renderState({
      title: "Signed link expired",
      body: "The link for this private page has expired.",
      status: 410,
      contactEmail: "jameson.lee@emergence.studio",
    });
  }

  const expectedSignature = await sign(env.VAULT_SIGNING_KEY, `${normalizedPath}|${tokenId}|${expiresAt}`);
  if (!timingSafeEqual(expectedSignature, signature)) {
    await logAccess(env, baseEvent);
    return renderState({
      title: "Private page unavailable",
      body: "The link for this page could not be verified.",
      status: 403,
      contactEmail: "jameson.lee@emergence.studio",
    });
  }

  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set("cache-control", "private, no-store");
  headers.set("x-robots-tag", "noindex, nofollow");
  if (response.ok) {
    headers.append(
      "set-cookie",
      `vault_access=${tokenId}; Max-Age=900; Path=${normalizedPath}; SameSite=Lax; Secure`,
    );
  }
  await logAccess(env, { ...baseEvent, status: response.ok ? "granted" : "missing" });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
