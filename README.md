# The Starship Whisperer's Chart

A star chart of SoulFireMage's projects. Each project is a star, grouped into six
constellations, with **threads** that link the same idea across years or fields
(PySpinor in 2015 → Quantumpizza → spinor-lib in 2026, for example).

- **Two lenses:** ⚡ *Kat*, pattern first and compressed, or 🧱 *Richard*, step by step. The idea comes from `threads/` (Microlearning).
- **Follow a thread:** a short random walk along the links, with a reason given for each hop.
- **Transmissions:** true facts, each tied to a project (spinors, Hamilton's bridge, the Bitter Lesson, Codd...).
- **Starlog** (guestbook) and **sparks** (a small "I liked this" per project), stored in [Skapi](https://www.skapi.com).

Plain static HTML, with no build step. Open `index.html` directly or host it anywhere.

## Turning the backend on

1. In Skapi, open your project's **Settings** page and copy the **Project ID** from the Information card.
2. Paste it into `js/config.js`: `var SKAPI_PROJECT_ID = 'your-id';`
3. Turn **Require Login** off in the project's settings. It is on by default, and while it is on, signed-out visitors cannot read the Starlog or spark counts. Writing still works.
4. Keep anonymous writes allowed (the default). Visitors post as anonymous users into the `public` access group.

Without an ID the site still works; only the Starlog and sparks are switched off.

Data lives in two tables, `starlog` and `sparks`. Anonymous visitors can't edit or delete what they post, so you moderate from the Skapi dashboard's database view.

## Hosting

- **GitHub Pages:** go to Settings → Pages and deploy from the branch.
- **Skapi hosting:** Settings → Web Hosting → Register a subdomain, then upload these files on the Web Hosting page.

## Editing the chart

All content is in `js/projects.js`: `CLUSTERS`, `PROJECTS` (with `kat` and `rich` summaries), `THREADS` and `TRIVIA`.
Star positions are computed, so to add a project you append an entry to the list.
