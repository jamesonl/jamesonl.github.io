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
  {% assign currently_reading_books = site.books | where: "currently_reading", true %}
  {% assign science_books = site.books | where: "category", "Science Fiction" %}
  {% assign technical_books = site.books | where: "category", "Technical" %}
  {% assign nonfiction_books = site.books | where: "category", "Nonfiction" %}

  {% include book-shelf-section.html
    title="Currently reading"
    heading="Currently reading"
    subtitle="The book that is open right now, not just nearby on the shelf."
    books=currently_reading_books
  %}

  <header class="section-header">
    <div>
      <p class="section-kicker">Shelves</p>
      <h2 class="section-title plain">A working library of books worth returning to</h2>
    </div>
    <p class="section-intro">Each title opens into its own reflection page, where the longer notes can grow over time.</p>
  </header>

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

    {% assign fantasy_books = site.books | where: "category", "Fantasy" | sort: "order" %}
    {% if fantasy_books.size > 0 %}
    <section class="bookshelf-section">
      <header class="section-header compact">
        <div>
          <p class="section-kicker">Fantasy</p>
          <h3 class="section-title plain">Worlds, alliances, and long arcs</h3>
        </div>
        <p class="section-intro">This stretch is mostly Raymond E. Feist: political systems, loyalty, and the consequences of decisions that unfold over years.</p>
      </header>

      <div class="bookshelf-grid">
        {% for book in fantasy_books %}
        {% unless book.title == "Mossflower" or book.title == "Krondor: Tear of the Gods" or book.title == "Krondor: The Assassins" or book.title == "Krondor: The Betrayal" or book.title == "The King's Buccaneer" or book.title == "Prince of the Blood" %}
        {% capture book_state %}{% include reading-item-state.html kind="book" reflection_status=book.reflection_status content_text=book.content %}{% endcapture %}
        {% assign book_state = book_state | strip %}
        {% assign book_slug = book.slug | default: book.title | slugify %}
        {% assign cover_backdrop = site.data.book_cover_backdrops[book_slug] %}
        <article id="book-{{ book_slug }}" class="book-card{% if book_state == 'draft' %} is-draft{% endif %}">
          {% if book_state == "published" %}
          <a class="book-shelf-link" href="{{ site.baseurl }}{{ book.url }}">
            <span class="book-cover{% if cover_backdrop %} has-generated-backdrop backdrop-{{ cover_backdrop }}{% endif %}">
              <img src="{{ site.baseurl }}{{ book.cover_image }}" alt="Cover of {{ book.title }} by {{ book.author }}" loading="lazy" decoding="async" />
            </span>
            <span class="book-copy">
              <span class="book-title">{{ book.title }}</span>
              <span class="book-author">{{ book.author }}</span>
            </span>
          </a>
          {% else %}
          <div class="book-shelf-link is-draft" aria-disabled="true">
            <span class="book-cover{% if cover_backdrop %} has-generated-backdrop backdrop-{{ cover_backdrop }}{% endif %}">
              <img src="{{ site.baseurl }}{{ book.cover_image }}" alt="Cover of {{ book.title }} by {{ book.author }}" loading="lazy" decoding="async" />
            </span>
            <span class="book-copy">
              <span class="book-title">{{ book.title }}</span>
              <span class="book-author">{{ book.author }}</span>
            </span>
          </div>
          {% endif %}
        </article>
        {% endunless %}
        {% endfor %}
      </div>
    </section>
    {% endif %}
  </div>

  <div id="inspiration-library" class="reading-archive-divider">
    <div>
      <p class="section-kicker">Inspiration library</p>
      <h2 class="section-title plain">Essays, papers, manuals, and source trails</h2>
    </div>
    <p class="section-intro">The bookshelf holds books. The wider library holds the source material behind the way I think: systems essays, technical papers, tools-for-thought notes, manuals, and longer research trails. A meaningful share of my favorite readings begin as papers on arXiv, where early arguments, interface ideas, and research intuitions often show up before they have been compressed into summaries. Grey cards stay on the shelf until I have replaced the generic notes with a real reflection.</p>
  </div>

  <aside class="callout shelf-callout">
    <p class="card-kicker">Archive arXiv</p>
    <p>Many of my favorite readings in AI, evaluation, interfaces, and agent design enter this library through arXiv. I like it as a source of inspiration because it exposes working ideas in their rougher, more generative form, before they have been rounded into consensus takes.</p>
  </aside>

  {% assign systems_sources = site.sources | where: "category", "Systems & Sensemaking" %}
  {% assign ai_sources = site.sources | where: "category", "AI & Language" %}
  {% assign forecasting_sources = site.sources | where: "category", "Forecasting & Operations" %}
  {% assign tools_sources = site.sources | where: "category", "Tools for Thought" %}
  {% assign design_sources = site.sources | where: "category", "Design & Interfaces" %}
  {% assign notebooks_sources = site.sources | where: "category", "Books, Manuals & Notebooks" %}
  {% assign strategy_sources = site.sources | where: "category", "Organizations & Strategy" %}
  {% assign sales_sources = site.sources | where: "category", "Sales" %}
  {% assign leadership_sources = site.sources | where: "category", "Leadership" %}
  {% assign hobbies_sources = site.sources | where: "category", "Hobbies" %}
  {% assign oreilly_sources = site.sources | where: "category", "O'Reilly" %}
  {% assign stripe_sources = site.sources | where: "category", "Stripe Press" %}

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
      subtitle="Papers, essays, and references that changed how I think about intelligence, interaction, and model behavior. A large share of this shelf traces back to arXiv."
      sources=ai_sources
    %}

    {% include source-grid-section.html
      title="Forecasting"
      heading="Forecasting, logistics, and operational signal design"
      subtitle="The supply-chain, demand-planning, and decision-support material that keeps showing up in practical systems work."
      sources=forecasting_sources
    %}

    {% include source-grid-section.html
      title="O'Reilly"
      heading="O'Reilly titles and inspired technical reading"
      subtitle="Architecture, machine learning, and software craft references in the wider archive."
      sources=oreilly_sources
    %}

    {% include source-grid-section.html
      title="Sales"
      heading="Sales and growth craft"
      subtitle="Books focused on practical sales leadership and execution discipline."
      sources=sales_sources
    %}

    {% include source-grid-section.html
      title="Leadership"
      heading="Leadership lenses and perspective"
      subtitle="Frames and models for how people, teams, and institutions make decisions."
      sources=leadership_sources
    %}

    {% include source-grid-section.html
      title="Hobbies"
      heading="Sailing, food, and card-play detours"
      subtitle="Reading that keeps you connected to craft, play, and hands-on curiosity."
      sources=hobbies_sources
    %}

    {% include source-grid-section.html
      title="Tools"
      heading="Tools for thought, notes, and knowledge systems"
      subtitle="Reading on notebooks, shared context, memory systems, and the craft of keeping useful ideas alive."
      sources=tools_sources
    %}

    {% include source-grid-section.html
      title="Stripe Press"
      heading="Stripe Press writing"
      subtitle="Stories, essays, and books from Stripe's publishing collection."
      sources=stripe_sources
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
