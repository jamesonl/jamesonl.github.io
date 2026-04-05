---
layout: page
title: Writing
tagline: Essays and reflections on systems, prediction, design, and the ideas that keep resurfacing.
permalink: /writing/
body_class: writing-page
kicker: Notes in public
---

<div class="writings-shell is-locked" data-writings-shell>
  <div class="vault-banner writings-gate" data-writings-gate>
    <p class="card-kicker">Protected archive</p>
    <h2 class="section-title plain">Enter the password to view the writings</h2>
    <p>The writing archive on this page is temporarily gated.</p>

    <form class="writings-gate-form" data-writings-gate-form>
      <label class="writings-gate-label" for="writings-password">Password</label>
      <div class="writings-gate-row">
        <input
          id="writings-password"
          class="writings-gate-input"
          type="password"
          name="password"
          autocomplete="off"
          autocapitalize="none"
          spellcheck="false"
          required
          data-writings-password-input
        />
        <button class="link-button secondary writings-gate-button" type="submit">Unlock writings</button>
      </div>
      <p class="writings-gate-feedback" data-writings-gate-feedback aria-live="polite" hidden></p>
    </form>
  </div>

  <div class="writings-content" data-writings-content hidden>
<p class="lede">The writing here is meant for mixed audiences. Some pieces lean technical, some do not, but the concepts are carried inside the essays themselves rather than split into a separate developer track.</p>

<section class="scroll-diagram-story" data-scroll-diagram-story aria-labelledby="scroll-diagram-story-title">
  <div class="scroll-diagram-story-intro">
    <p class="section-kicker">Experimental article</p>
    <h2 id="scroll-diagram-story-title" class="section-title plain">A Diagram That Changes With the Essay</h2>
    <p class="scroll-diagram-story-summary">This prototype keeps the system map fixed on the left while the article continues on the right. As each heading crosses the reading threshold, the Mermaid diagram advances to the next state.</p>
  </div>

  <div class="scroll-diagram-story-grid">
    <aside class="scroll-diagram-rail">
      <div class="scroll-diagram-pane">
        <div class="scroll-diagram-pane-heading">
          <div class="scroll-diagram-pane-topline">
            <div>
              <p class="card-kicker">Scroll-linked diagram</p>
              <p class="scroll-diagram-step-count" data-diagram-current-step>01</p>
            </div>
            <button
              class="scroll-diagram-expand-button"
              type="button"
              data-diagram-expand
              aria-pressed="false"
              aria-label="Expand diagram pane to fullscreen"
              title="Expand diagram pane to fullscreen"
            >Expand visual</button>
          </div>
          <h3 class="scroll-diagram-current-title" data-diagram-current-title>Signals condense into a shared intake surface.</h3>
        </div>
        <div class="scroll-diagram-stage" data-diagram-stage aria-live="polite" aria-atomic="true"></div>
        <ol class="scroll-diagram-nav" data-diagram-nav></ol>
      </div>
    </aside>

    <article class="scroll-diagram-prose" tabindex="0" aria-label="Scroll-linked article text">
      <section
        class="scroll-diagram-step is-active"
        id="scroll-diagram-step-1"
        data-diagram-step
        data-diagram-label="01"
        data-diagram-nav="Intake"
      >
        <p class="eyebrow">Stage 01</p>
        <h3 data-diagram-heading>Signals condense into a shared intake surface.</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer a cursus mauris. Curabitur hendrerit, metus vel placerat malesuada, odio nibh vulputate augue, vitae sagittis enim libero sed nisl. Donec viverra malesuada lacus, a molestie augue fermentum et.</p>
        <p>Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Mauris faucibus eros non massa porta, non tempus mauris gravida. Maecenas at luctus purus. Etiam vulputate varius risus, eget fermentum lorem congue in.</p>
        <p>Nam consequat, velit et malesuada porttitor, nibh augue consequat purus, nec pulvinar nibh odio non lectus. Sed posuere sapien ac augue eleifend, in vestibulum lorem luctus. Donec a nibh vitae metus interdum facilisis.</p>
        <template data-diagram-definition>
flowchart LR
  Signals[Signals] --> Intake[(Shared Intake)]
  Telemetry[Telemetry] --> Intake
  Requests[Requests] --> Intake
  Intake --> Model[Technical Model]
  Model --> Narrative[Written Narrative]
  Narrative --> Reader[Reader]
        </template>
      </section>

      <section
        class="scroll-diagram-step"
        id="scroll-diagram-step-2"
        data-diagram-step
        data-diagram-label="02"
        data-diagram-nav="Feedback"
      >
        <p class="eyebrow">Stage 02</p>
        <h3 data-diagram-heading>Feedback loops start to alter the shape of the system.</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vitae erat nibh. Morbi volutpat justo vel nulla interdum, sed lacinia quam vulputate. Proin rhoncus dolor sit amet ligula tincidunt, vel tristique neque cursus.</p>
        <p>Aliquam feugiat leo ut sem cursus, quis suscipit augue tincidunt. Duis imperdiet orci sed felis aliquet, sed dapibus enim posuere. Cras ullamcorper eros non lorem tincidunt, sed luctus neque accumsan. Integer bibendum molestie turpis, vitae placerat ex feugiat sit amet.</p>
        <p>Ut in dapibus lacus. Donec ut libero mattis, ullamcorper lectus vitae, aliquet leo. Aenean gravida gravida augue, sed congue est gravida nec. Mauris non tempor magna. Integer venenatis eu velit vitae cursus.</p>
        <template data-diagram-definition>
flowchart LR
  Signals[Signals] --> Intake[(Shared Intake)]
  Telemetry[Telemetry] --> Intake
  Requests[Requests] --> Intake
  Intake --> Model[Technical Model]
  Model --> Draft[Draft Article]
  Draft --> Review{Review}
  Review -- Revise --> Feedback[Feedback Loop]
  Feedback --> Intake
  Review -- Publish --> Reader[Reader]
        </template>
      </section>

      <section
        class="scroll-diagram-step"
        id="scroll-diagram-step-3"
        data-diagram-step
        data-diagram-label="03"
        data-diagram-nav="Orchestration"
      >
        <p class="eyebrow">Stage 03</p>
        <h3 data-diagram-heading>Planning separates from execution once the article becomes technical.</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce posuere, orci sed feugiat venenatis, libero eros maximus justo, eu posuere leo mauris sit amet augue. Integer accumsan justo vel sem dictum, ac sodales nisi tempor.</p>
        <p>Praesent luctus erat ac eros mollis, at consequat odio cursus. Sed sit amet arcu hendrerit, tristique magna et, varius velit. Sed facilisis finibus lectus, vitae congue elit dignissim et. Quisque mollis tincidunt ex, non laoreet urna aliquam sed.</p>
        <p>Suspendisse potenti. Pellentesque a feugiat nibh. Integer rhoncus augue eget velit malesuada, vel consectetur enim rhoncus. Nam sit amet magna sit amet lorem viverra luctus nec ut arcu.</p>
        <template data-diagram-definition>
flowchart LR
  subgraph Inputs
    Signals[Signals]
    Context[Context]
  end
  subgraph Orchestration
    Planner[Planner]
    Retriever[Retriever]
    Synthesizer[Synthesizer]
  end
  subgraph Outputs
    Diagram[Mermaid Diagram]
    Copy[Essay Section]
    Checks[Checks]
  end
  Signals --> Planner
  Context --> Planner
  Planner --> Retriever
  Planner --> Synthesizer
  Retriever --> Diagram
  Synthesizer --> Copy
  Diagram --> Checks
  Copy --> Checks
        </template>
      </section>

      <section
        class="scroll-diagram-step"
        id="scroll-diagram-step-4"
        data-diagram-step
        data-diagram-label="04"
        data-diagram-nav="Runtime"
      >
        <p class="eyebrow">Stage 04</p>
        <h3 data-diagram-heading>Runtime observability and human override close the loop.</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras eleifend lacus nec erat molestie, vel tempor magna aliquet. Nam tempor, nunc in ultrices lobortis, lectus justo vulputate nibh, sed luctus orci leo vitae nibh.</p>
        <p>Donec fermentum, nisl vel feugiat posuere, massa lacus feugiat enim, nec varius ligula magna vitae est. Mauris sodales luctus augue, vitae dictum tortor vehicula eu. Aenean ornare elit ut enim interdum condimentum.</p>
        <p>Vivamus sed massa ipsum. Etiam in dictum ligula. Praesent congue velit sed ante tempor, vitae commodo mauris condimentum. Morbi sagittis ultrices turpis, non sollicitudin erat feugiat et. Integer id ex ut mauris sagittis finibus.</p>
        <template data-diagram-definition>
flowchart LR
  subgraph Runtime
    Scroll[Scroll Trigger]
    Heading[Active Heading]
    Renderer[Mermaid Renderer]
    Pane[Fixed Diagram Pane]
  end
  subgraph Oversight
    Metrics[Observability]
    Notes[Revision Notes]
    Editor[Human Override]
  end
  subgraph Publishing
    Essay[Article Body]
    Publish[Published Piece]
  end
  Scroll --> Heading --> Renderer --> Pane
  Heading --> Essay
  Renderer --> Metrics
  Metrics --> Notes --> Editor --> Renderer
  Pane --> Publish
  Essay --> Publish
        </template>
      </section>
    </article>
  </div>
</section>

<div class="section-header writing-section-header">
  <div>
    <p class="section-kicker">Essays and reflections</p>
    <h2 class="section-title plain">Recent pieces</h2>
  </div>
  <p class="section-intro">Patterns, observations, and longer thoughts on systems, interfaces, transformation, and design.</p>
</div>

{% assign posts = site.posts | sort: "date" | reverse %}
{% if posts.size > 0 %}
<div class="notes-grid writings-grid">
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
{% else %}
<div class="empty-state-panel">
  <p class="card-kicker">Writing archive</p>
  <h2 class="section-title plain">New essays are on the way</h2>
  <p>I am rebuilding this section so the writing that shows up here is more representative of the work and questions I care about now.</p>
</div>
{% endif %}
  </div>
</div>
