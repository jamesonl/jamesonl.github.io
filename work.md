---
layout: page
title: Work
tagline: "A hybrid view of how I work: selected case studies up top, then the through-line across roles and disciplines."
permalink: /work/
body_class: work-page
kicker: Selected work and experience
---

<p class="lede">I like working on problems where strategy, operations, data, and interface design all meet. The common thread is helping people make better decisions under uncertainty without burying them in process.</p>

<div class="callout">
  <p>These case studies are representative and intentionally anonymized. They describe the kinds of systems I have worked on and the shape of the outcomes I aim for. Replace them with company names, concrete metrics, and role-specific detail as you publish fuller public versions.</p>
</div>

## Featured case studies

<div class="case-grid">
  {% assign studies = site.case_studies | where: "featured", true %}
  {% for item in studies %}
  <article class="case-card">
    <p class="card-kicker">{{ item.role }}</p>
    <h3><a href="{{ site.baseurl }}{{ item.url }}">{{ item.title }}</a></h3>
    <p>{{ item.summary }}</p>
    <div class="meta-cluster">
      {% for theme in item.themes %}
      <span class="meta-pill">{{ theme }}</span>
      {% endfor %}
    </div>
    <a class="text-link" href="{{ site.baseurl }}{{ item.url }}">Read the case study</a>
  </article>
  {% endfor %}
</div>

## Experience timeline

<div class="timeline">
  {% for entry in site.data.experience %}
  <details class="timeline-entry"{% if forloop.first %} open{% endif %}>
    <summary>
      <div class="timeline-heading">
        <p class="timeline-period">{{ entry.period }}</p>
        <h3>{{ entry.role }}</h3>
        <p class="timeline-company">{{ entry.company }}</p>
      </div>
      <p class="timeline-scope">{{ entry.scope }}</p>
    </summary>
    <div class="timeline-panel">
      <ul class="list-dashed compact">
        {% for bullet in entry.bullets %}
        <li>{{ bullet }}</li>
        {% endfor %}
      </ul>
      <div class="meta-cluster">
        {% for theme in entry.themes %}
        <span class="meta-pill">{{ theme }}</span>
        {% endfor %}
      </div>
    </div>
  </details>
  {% endfor %}
</div>

<section class="cta-panel">
  <p class="card-kicker">If you're evaluating a fit</p>
  <h2 class="section-title plain">I can also prepare tailored private pages</h2>
  <p>For specific applications or conversations, I can send a signed link to a private brief that connects the role to relevant work, selected writing, and a tailored resume.</p>
  <a class="link-button" href="{{ site.baseurl }}/contact">Request a tailored brief</a>
</section>
