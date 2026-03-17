---
layout: page
title: Writing
tagline: Essays and reflections on systems, prediction, design, and the ideas that keep resurfacing.
permalink: /writing/
body_class: writing-page
kicker: Notes in public
---

<p class="lede">The writing here is meant for mixed audiences. Some pieces lean technical, some do not, but the concepts are carried inside the essays themselves rather than split into a separate developer track.</p>

<div class="section-header writing-section-header">
  <div>
    <p class="section-kicker">Essays and reflections</p>
    <h2 class="section-title plain">Recent pieces</h2>
  </div>
  <p class="section-intro">Patterns, observations, and longer thoughts on systems, interfaces, transformation, and design.</p>
</div>

<div class="notes-grid writings-grid">
  {% assign posts = site.posts | sort: "date" | reverse %}
  {% for post in posts %}
  {% assign title_size = post.title | size %}
  {% assign url_size = post.url | size %}
  {% assign art_variant = post.date | date: "%s" | plus: title_size | plus: url_size | modulo: 100 %}
  {% assign art_alt = "Abstract geometric illustration for " | append: post.title %}
  <article class="note-card note-card-with-art">
    {% include post-illustration.html variant=art_variant compact=true alt=art_alt %}
    <div class="note-card-copy">
      <p class="note-meta">{{ post.date | date: "%b %d, %Y" }}</p>
      <h3><a href="{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></h3>
      <p>{{ post.excerpt | strip_html | truncate: 180 }}</p>
      <a class="text-link" href="{{ site.baseurl }}{{ post.url }}">Read piece</a>
    </div>
  </article>
  {% endfor %}
</div>
