# Personal site retro log

This repository now powers a monochrome, retro-inspired personal site. The previous Tailwind-heavy treatment has been replaced with something simpler: single-pixel rules, typewriter typography, and zero gradients. Below is a quick reference for what changed and how to extend it.

## What's new

- **Black & white interface.** The global layout, page templates, and homepage all run on a custom stylesheet that favors single-pixel borders, uppercase kickers, and Courier-esque pacing.【F:_layouts/default.html†L1-L44】【F:style.scss†L1-L274】
- **Retro homepage.** The landing page now uses a minimalist hero, plain-text experiment cards, and a latest-writing list that matches the new aesthetic.【F:index.html†L1-L120】
- **README notebook.** Dropping markdown files into `_readmes/` automatically lists them at the bottom of the homepage with simple pagination that reveals five entries at a time.【F:index.html†L122-L219】【F:_config.yml†L21-L35】

## Adding README entries

1. Create a markdown file inside `_readmes/` with front matter specifying at least a `title` and `date`. Optional fields like `summary` will be displayed beneath the title.【F:_readmes/data-playbook.md†L1-L11】
2. Commit the file. Jekyll builds it as part of the `readmes` collection and the homepage table updates automatically.【F:_config.yml†L21-L35】【F:index.html†L122-L219】
3. If more than five README files exist, pagination controls appear so visitors can browse batches without leaving the page.【F:index.html†L160-L219】

The `README notebook` section also ships with six sample entries you can edit or remove as needed.【F:_readmes/retro-interface-primer.md†L1-L18】【F:_readmes/operating-manual.md†L1-L16】【F:_readmes/data-playbook.md†L1-L11】【F:_readmes/collaboration-guide.md†L1-L12】【F:_readmes/reading-habits.md†L1-L10】【F:_readmes/lab-notes.md†L1-L15】

## Future tweaks to consider

- Wire the pagination script into a standalone asset if the notebook grows into its own page.
- Layer in optional accent colors via CSS custom properties that can be toggled per page.
- Add permalinks from the homepage table to the GitHub source for each README to encourage collaboration.

## Running the site locally

1. Install dependencies with `bundle install`, which pulls in GitHub Pages, Jekyll, and supporting plugins from the new `Gemfile`.【F:Gemfile†L1-L9】
2. Build the site with `bundle exec jekyll build` to ensure templates and collections compile without errors.【9f4ea1†L1-L3】
3. Optionally, run `bundle exec jekyll serve --livereload` to preview changes at `http://localhost:4000`.【F:Gemfile†L1-L9】
