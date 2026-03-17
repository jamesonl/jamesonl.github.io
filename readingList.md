---
layout: page
title: Bookshelf
permalink: /readinglist/
body_class: reading-page
tagline: The books I keep nearby, organized as a shelf of titles that open into longer reflections.
kicker: Reading shelf
---

<p class="journal-lede">This page is only the shelf now: the books that keep reshaping how I think, grouped by the kinds of questions they sharpen. Click any cover to open the fuller reflection.</p>

<section class="archive-section">
  <header class="section-header">
    <div>
      <p class="section-kicker">Shelves</p>
      <h2 class="section-title plain">A working library of books worth returning to</h2>
    </div>
    <p class="section-intro">Each title opens into its own reflection page, where the longer notes can grow over time.</p>
  </header>

  {% assign science_books = site.books | where: "category", "Science Fiction" %}
  {% assign technical_books = site.books | where: "category", "Technical" %}
  {% assign nonfiction_books = site.books | where: "category", "Nonfiction" %}
  {% assign fantasy_books = site.books | where: "category", "Fantasy" %}

  <div class="book-list">
    {% include book-shelf-section.html
      title="Science Fiction"
      heading="Speculation, scale, and future systems"
      subtitle="The books here shape how I think about emergence, simulation, language, and the social consequences of intelligence."
      books=science_books
    %}

    {% include book-shelf-section.html
      title="Technical"
      heading="Methods, systems, and practice"
      subtitle="Forecasting, state legibility, writing craft, and the books that stay useful after the first read."
      books=technical_books
    %}

    {% include book-shelf-section.html
      title="Nonfiction"
      heading="Histories of tools and thought"
      subtitle="Books that frame computing and augmentation as cultural systems, not just technical artifacts."
      books=nonfiction_books
    %}

    {% include book-shelf-section.html
      title="Fantasy"
      heading="Worlds, alliances, and long arcs"
      subtitle="The fantasy shelf leans toward political systems, loyalty, and the consequences of decisions that unfold over years."
      books=fantasy_books
    %}
  </div>

  <aside class="callout shelf-callout">
    <p class="card-kicker">Ongoing shelves</p>
    <ul class="list-dashed compact">
      <li>Stripe Press books on technical leadership</li>
      <li>O'Reilly books on AI, machine learning, and software development</li>
    </ul>
  </aside>
</section>

<section class="archive-section">
  <header class="section-header">
    <div>
      <p class="section-kicker">Inspiration library</p>
      <h2 class="section-title plain">Essays, papers, manuals, and source trails</h2>
    </div>
    <p class="section-intro">The bookshelf holds books. The wider library holds the source material behind the way I think: systems essays, technical papers, tools-for-thought notes, manuals, and longer research trails.</p>
  </header>

  {% assign featured_sources = site.sources | where: "featured", true %}

  <div class="source-grid source-preview-grid">
    {% for source in featured_sources limit: 8 %}
    <article class="source-card">
      <a class="source-link" href="{{ site.baseurl }}{{ source.url }}">
        <span class="source-cover">
          <img src="{{ site.baseurl }}{{ source.cover_image }}" alt="{{ source.cover_alt | default: source.title }}" loading="lazy" decoding="async" />
        </span>
        <span class="source-copy">
          <span class="source-title">{{ source.title }}</span>
          <span class="source-meta">
            {% if source.creator and source.creator != "" %}
            {{ source.creator }}
            {% elsif source.publication and source.publication != "" %}
            {{ source.publication }}
            {% elsif source.domain and source.domain != "" %}
            {{ source.domain }}
            {% endif %}
          </span>
        </span>
      </a>
    </article>
    {% endfor %}
  </div>

  <div class="hero-actions">
    <a class="link-button secondary" href="{{ site.baseurl }}/inspiration">Open the inspiration library</a>
  </div>
</section>
