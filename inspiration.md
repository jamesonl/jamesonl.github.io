---
layout: page
title: Inspiration Library
permalink: /inspiration/
body_class: inspiration-page
tagline: Essays, papers, manuals, notes, and source material that keep feeding the way I think and build.
kicker: Reading sources
---

<p class="lede">This is the wider source library behind the bookshelf: the essays, manuals, papers, field notes, and technical references that keep resurfacing in my own work. Each card opens into a reflection page with room for a more personal read on why it mattered.</p>

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
