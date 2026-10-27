# The Starship Whisperer's Chart

A star chart of SoulFireMage's projects. **Live at <https://starship-whisperer.skapi.com>.**

Each project is a star, grouped into six
constellations, with **threads** that link the same idea across years or fields
(PySpinor in 2015 → Quantumpizza → spinor-lib in 2026, for example).

- **Two lenses:** ⚡ *Kat*, pattern first and compressed, or 🧱 *Richard*, step by step. The idea comes from `threads/` (Microlearning).
- **Two groupings:** *by topic* (what a project is about) or *by how it was made* (just to see, AI-built, daily-use rigs, learning out loud, worldbuilding, data). The "AI-built" group only lists projects whose README says an AI wrote the code.
- **Follow a thread:** a short random walk along the links, with a reason given for each hop.
- **Transmissions:** true facts, each tied to a project (spinors, Hamilton's bridge, the Bitter Lesson, Codd...).
- **Starlog** (guestbook) and **sparks** (a small "I liked this" per project), stored in [Skapi](https://www.skapi.com).

Plain static HTML, with no build step. Open `index.html` directly or host it anywhere.

## Turning the backend on

The Project ID is already in `js/config.js`. It's meant to be public, because every visitor's browser needs it.

1. Get **Require Login** turned off. A project that has never set it counts as on, and while it is on, signed-out visitors cannot read the Starlog or spark counts. Writing still works. The dashboard has no toggle for it yet (its Advanced settings stop at Prevent Inquiry and Project Enabled), so ask Skapi support to set `require_login` to false for the project.
2. Keep **Prevent Anonymous** off (the default). Visitors post as anonymous users into the `public` access group.

Without an ID the site still works; only the Starlog and sparks are switched off.

Data lives in two tables, `starlog` and `sparks`. Anonymous visitors can't edit or delete what they post, so you moderate from the Skapi dashboard's database view.

## Hosting

- **GitHub Pages (automatic):** `.github/workflows/pages.yml` publishes the site on every push to `main`, at <https://soulfiremage.github.io/skapitest/>. One-time setup: Settings → Pages → Source: **GitHub Actions**, and make `main` the default branch. Until Pages is on, the workflow skips the deploy instead of failing.
- **Skapi hosting:** live at <https://starship-whisperer.skapi.com>. Updates are uploaded through the Skapi connector (or the dashboard's Web Hosting page); Skapi has no deploy token, so it can't be automated from GitHub.

## Editing the chart

All content is in `js/projects.js`: `CLUSTERS`, `PROJECTS` (with `kat` and `rich` summaries), `THREADS` and `TRIVIA`.
Star positions are computed, so to add a project you append an entry to the list.

For a Claude session, the `add-star` skill (`.claude/skills/add-star/SKILL.md`) covers the whole job: the fields, the voice for the two lenses, checks, screenshots, merging, and uploading to Skapi with a size check.
