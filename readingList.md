---
layout: page
title: Bookshelf
permalink: /readinglist/
body_class: reading-page
tagline: The books I keep nearby, organized as a shelf of titles that open into longer reflections.
kicker: Reading shelf
---

<p class="journal-lede">This page holds the working reading archive: the books and source material that keep reshaping how I think, grouped by the kinds of questions they sharpen. Grey cards stay visible on the shelf until the generic notes have been replaced with a real reflection.</p>

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

  <div id="inspiration-library" class="reading-archive-divider">
    <div>
      <p class="section-kicker">Inspiration library</p>
      <h2 class="section-title plain">Essays, papers, manuals, and source trails</h2>
    </div>
    <p class="section-intro">The bookshelf holds books. The wider library holds the source material behind the way I think: systems essays, technical papers, tools-for-thought notes, manuals, and longer research trails. Grey cards stay on the shelf until I have replaced the generic notes with a real reflection.</p>
  </div>

  {% assign systems_sources = site.sources | where: "category", "Systems & Sensemaking" %}
  {% assign ai_sources = site.sources | where: "category", "AI & Language" %}
  {% assign forecasting_sources = site.sources | where: "category", "Forecasting & Operations" %}
  {% assign tools_sources = site.sources | where: "category", "Tools for Thought" %}
  {% assign design_sources = site.sources | where: "category", "Design & Interfaces" %}
  {% assign notebooks_sources = site.sources | where: "category", "Books, Manuals & Notebooks" %}
  {% assign strategy_sources = site.sources | where: "category", "Organizations & Strategy" %}

  <div class="book-list inspiration-list">
    {% include source-grid-section.html
      title="Systems"
      heading="Systems, legibility, and sensemaking"
      subtitle="The material that shaped how I think about emergence, coordination, structure, and the hidden behavior of organizations."
      sources=systems_sources
    %}

    {% include source-grid-section.html
      title="AI & language"
      heading="Language models, agent systems, and machine reasoning"
      subtitle="Papers, essays, and references that changed how I think about intelligence, interaction, and model behavior."
      sources=ai_sources
    %}

    {% include source-grid-section.html
      title="Forecasting"
      heading="Forecasting, logistics, and operational signal design"
      subtitle="The supply-chain, demand-planning, and decision-support material that keeps showing up in practical systems work."
      sources=forecasting_sources
    %}

    {% include source-grid-section.html
      title="Tools"
      heading="Tools for thought, notes, and knowledge systems"
      subtitle="Reading on notebooks, shared context, memory systems, and the craft of keeping useful ideas alive."
      sources=tools_sources
    %}

    {% include source-grid-section.html
      title="Design"
      heading="Design, interfaces, and interaction structures"
      subtitle="Sources that helped me think more clearly about interfaces, explanation, navigation, and the shape of participation."
      sources=design_sources
    %}

    {% include source-grid-section.html
      title="Books & notebooks"
      heading="Books, manuals, and notebook trails"
      subtitle="Longer-form source material that sits outside the main bookshelf but still belongs in the wider reading archive."
      sources=notebooks_sources
    %}

    {% include source-grid-section.html
      title="Strategy"
      heading="Organizations, strategy, and operating design"
      subtitle="Sources I keep around for thinking about institutions, go-to-market motion, community, and decision structures."
      sources=strategy_sources
    %}
  </div>
</section>
