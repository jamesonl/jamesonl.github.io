# Jameson Lee portfolio site

This repository powers a public-facing portfolio and writing site built with Jekyll. The current version is organized around three things:

- a public homepage and work page for mixed audiences,
- a writing and reading surface for essays and lab notes,
- private `/vault/*` pages for company-specific application packets served through Cloudflare Pages Functions.

## Content model

- `_case_studies/` contains older public work examples that still build to `/work/:slug/`, but they are no longer the primary surface on `/work/`.
- `_company_pages/` contains private company-specific pages. These build to `/vault/:slug/` and should only be shared via signed links.
- `_readmes/` contains lighter-weight notes and templates.
- `_data/public_work.yml` powers the public work grid on `/work/`.
- `_data/experience.yml` powers the compact experience timeline on `/work/`.

## Running locally

1. Use the Homebrew Ruby in this repo so Bundler matches the lockfile:

```bash
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
```

2. Start the local dev server with `sh start.sh`.

That script will:

- prefer the Homebrew Ruby when it is available,
- run `bundle install` when gems are missing,
- start `bundle exec jekyll serve --livereload`.

If you want to run the commands manually instead:

1. Install the gem dependencies with `bundle install`.
2. Build the site with `bundle exec jekyll build`.
3. Preview locally with `bundle exec jekyll serve --livereload`.

If Bundler is missing, install it with the active Ruby:

```bash
gem install bundler
```

If `bundle install` fails while compiling `eventmachine` with an `iostream` error, the machine is missing the working C++ toolchain headers expected by the active Ruby. In that case, repair the Xcode Command Line Tools environment or rely on the Cloudflare Pages build instead of local serving.

## Private company pages

Private pages are meant for signed links, not shared passwords.

### Cloudflare setup

1. Deploy the repo to Cloudflare Pages.
2. Set the build output directory to `_site`.
3. Add the secret `VAULT_SIGNING_KEY` in your Pages project settings.
4. Create an Analytics Engine dataset bound as `VAULT_LOGS`.
5. Optionally set `cloudflare_web_analytics_token` in `_config.yml` if you want to inject the public analytics beacon from the site template.

The access gate lives in `functions/vault/[[path]].js`. It validates signed query parameters, serves `/vault/*` when the signature is valid, and logs access events at the edge.

### Generating a signed link

Set the same signing secret locally, then run:

```bash
VAULT_SIGNING_KEY="replace-me" ruby scripts/generate_vault_link.rb _company_pages/example-company.md
```

That script reads the page front matter and prints a signed URL using:

- the page slug,
- the `token_id`,
- the `expires_on` date if present.

## Notes

- The default public layout is no longer gated.
- The old Universal Analytics integration has been removed.
- `requests.md` is kept only as a legacy pointer to `/contact/`.

<!-- readme-generator:appendix:start -->
## Appendix: README Reality Audit

_Generated 2026-03-25T13:13:59Z for `jamesonl.github.io` (`README.md`)._

- Claims checked: 32
- Findings generated: 1

### Current-vs-Code Drift

- Current drift findings: 1

- **Align README claim for bundle install**: `Install the gem dependencies with `bundle install`.`. Evidence: no supporting code evidence found.

### Future-vs-Code Gaps

- Future gap findings: 0

- No future-vs-code gaps detected.

### Proposed Roadmap

- No roadmap proposals generated.

### Proposed Tech Debt

- **Align README claim for bundle install** (`low`): README presents this as current behavior, but the codebase does not show supporting evidence. Features: documentation.

### Proposed Design Tasks

- No design proposals generated.

### Recommended Next Proposal

- `tech_debt`: **Align README claim for bundle install**. Features: documentation.

<!-- readme-generator:appendix:end -->
