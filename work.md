---
layout: page
title: Work
tagline: "Public pieces, notable projects, and the through-line across roles and disciplines."
permalink: /work/
body_class: work-page
kicker: Public work and experience
---

<p class="lede">I like working on problems where strategy, operations, data, and interface design all meet. The thread across these roles is learning how to make complex systems legible enough for people to trust, adopt, and use well.</p>

## Selected public work

<div class="public-work-grid">
  {% for item in site.data.public_work %}
  <article class="public-work-card">
    <div class="public-work-topline">
      <p class="card-kicker">{{ item.kind }}</p>
      <p class="public-work-period">{{ item.period }}</p>
    </div>
    <div class="company-mark">
      {% if item.logo %}
      <img class="company-logo" src="{{ site.baseurl }}{{ item.logo }}" alt="{{ item.company }} logo" loading="lazy">
      {% endif %}
      <p class="public-work-company">{{ item.company }}</p>
    </div>
    <h3>{{ item.title }}</h3>
    <p>{{ item.summary }}</p>
    {% if item.tags and item.tags.size > 0 %}
    <div class="meta-cluster public-work-tags" aria-label="Core themes">
      {% for tag in item.tags %}
      <span class="meta-pill">{{ tag }}</span>
      {% endfor %}
    </div>
    {% endif %}
    {% if item.fallback_note %}
    <p class="public-work-note">{{ item.fallback_note }}</p>
    {% endif %}
    <a class="text-link" href="{{ item.href }}"{% if item.external %} target="_blank" rel="noopener"{% endif %}>{{ item.link_label }}</a>
  </article>
  {% endfor %}
</div>

## Experience timeline

<div class="timeline" aria-label="Experience timeline in reverse chronological order">
  {% for entry in site.data.experience %}
  <article class="timeline-entry">
    <div class="timeline-topline">
      <p class="timeline-period">{{ entry.period }}</p>
      <p class="timeline-location">{{ entry.location }}</p>
    </div>
    <div class="timeline-main">
      <div class="timeline-heading">
        <h3>{{ entry.role }}</h3>
        <div class="timeline-company-row">
          {% if entry.logo %}
          <img class="company-logo" src="{{ site.baseurl }}{{ entry.logo }}" alt="{{ entry.company }} logo" loading="lazy">
          {% endif %}
          <p class="timeline-company">{{ entry.company }}</p>
        </div>
      </div>
      {% if entry.signals and entry.signals.size > 0 %}
      <div class="timeline-signal-row" aria-label="Core capabilities">
        {% for signal in entry.signals %}
        <span class="timeline-signal">
          <span class="timeline-signal-icon" aria-hidden="true">{% include experience-icon.html icon=signal.icon %}</span>
          <span>{{ signal.label }}</span>
        </span>
        {% endfor %}
      </div>
      {% endif %}
    </div>
    <p class="timeline-scope">{{ entry.scope }}</p>
    {% if entry.bullets and entry.bullets.size > 0 %}
    <ul class="list-dashed compact">
      {% for bullet in entry.bullets %}
      <li>{{ bullet }}</li>
      {% endfor %}
    </ul>
    {% endif %}
  </article>
  {% endfor %}
</div>
