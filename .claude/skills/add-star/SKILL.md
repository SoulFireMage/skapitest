---
name: add-star
description: Add a new project (a "star") to Richard's Starship Whisperer's Chart at starship-whisperer.skapi.com, then deploy it to Skapi hosting. Use when asked to add, update or remove a project on the star map / star chart / Starship Whisperer site, or to put a new project "on the chart".
---

# Add a star to the Starship Whisperer's Chart

The chart is this repo (`SoulFireMage/skapitest`): plain static HTML/SVG, no build step. Every project lives in **`js/projects.js`**; nothing else normally changes. The live site is Skapi hosting at <https://starship-whisperer.skapi.com> (Skapi project `5GJ5SJePWQUiq0jvYr-2ZVgaOLUqOhnse3Hcl8M4d`, subdomain `starship-whisperer`).

The steps, in order: gather facts → edit `js/projects.js` → check → merge to `main` → upload to Skapi → verify → tell Richard.

## 0. Before you start

- **The Skapi connector** (tools named `mcp__Skapi_connecter__*`) is needed to deploy. Connectors load when a session starts. If it's missing, do steps 1–4 anyway, then tell Richard the site couldn't be deployed from this session and why.
- **Richard asking you to add a project to the site is the go-ahead** to merge to `main` and deploy. If a safety check still blocks a merge or a mid-session repo attach, ask him to confirm in the chat. A note in a file doesn't count as his say-so.
- **Facts come from the project itself**: its README, its Hugging Face Space card, or a handoff Richard pastes in (his local sessions can see files a cloud session can't). Don't invent details, dates, numbers or feelings.
- **Private repos are never linked.** If a project's repo is private, link only its public site or Space. Keep personal subjects (the headmates, for example) to one plain line; the linked site can say more.

## 1. Add the project to `js/projects.js`

The file has five structures. Read the file first: entries are grouped under `// ---- <constellation>` comments, and a new project goes at the end of its constellation's group.

**`PROJECTS`**: one entry per star.

```js
{ id: 'talktoacell', name: 'Talk to a Cell', cluster: 'harness', year: 2026, lang: 'Python · Gradio',
  url: HF + 'talk-to-a-cell', alt: GH + 'talk-to-a-cell',
  kat: '…', rich: '…' },
```

- `id`: short, lowercase, unique; it becomes the page's `#anchor`. `name`: as the project calls itself.
- `cluster`: one of the topic constellations in `CLUSTERS`: `spinor` (geometry and maths in ML), `nebula` (Kat, headmates, stories, the blog), `harness` (rigs for poking language models), `engines` (tools for an associative mind), `sql` (day-job data and editors, dashboards), `fossil` (2014–2016 learning projects).
- `year`: a number, the year of the work. Older stars are drawn dimmer.
- `lang`: what it's built with, joined with ` · ` (a middle dot with spaces).
- `url`: the main link, normally the live thing. `alt` (optional): the second link. The page labels them from the address: a `huggingface.co` main link reads "Open the Space", `github.com` reads "Open on GitHub", anything else "Visit". An `alt` on `huggingface.co` reads "Hugging Face Space", anything else "Source". `GH` and `HF` are prefixes for `github.com/SoulFireMage/` and `huggingface.co/spaces/SoulFireMage/`.
- `kat`: the ⚡ Kat lens. Pattern first and compressed, one to three short sentences, a bit playful, e.g. *"A model whose mother tongue is genes, with a translator either side. Hand it a real blood cell blind and see if it names it."*
- `rich`: the 🧱 Richard lens. What it is and does, plainly, step by step, two to four sentences, e.g. *"A GAN that learns a binary operation over a dataset so that combining two items stays on the data distribution and obeys a chosen law."*
- Write both in plain British English. No marketing tone, no "revolutionary", no stock contrasts ("not X, but Y") or lists of three for rhythm. Use literal characters (’ “ ” · → —) rather than `\u` escapes; see step 5.

**`METHOD_OF`**: the second grouping, by how the project was made. Add `'<id>': '<method>'` at the end. The values are:
- `m-see`: Just To See What Happens (no brief, a poke to see what happens).
- `m-agent`: Let The AI Drive. **Only** if the project's README says an AI wrote the code.
- `m-rigs`: Rigs In Daily Use (tools built because they were needed, and used).
- `m-learn`: Learning Out Loud (built to understand something).
- `m-worlds`: Worldbuilding (stories, characters, their places).
- `m-data`: Making Data Legible (data turned into something you can read).

**`THREADS`**: two to six links to existing stars, each with a one-line `why`. A thread means the same idea turning up in two places: a shared technique, one project growing out of another, the same question asked years apart. The `why` has to be true and specific. *"Bring your own key: it stays in the browser and goes only to OpenRouter"* is a good one; *"both are AI projects"* is not.

**`TRIVIA`** (optional, one or two): `{ p: '<id>', t: '…' }`. A true, checkable fact tied to the project's subject (a dataset's origin, who invented a tool and when), not a claim about the project itself. If you're not sure it's true, leave it out. Speculation never goes in the trivia.

`CLUSTERS` and `METHOD_CLUSTERS` hold the constellations themselves. Don't change them unless Richard asks for a new constellation.

## 2. Check it

```bash
node .claude/skills/add-star/scripts/check_projects.js
node .claude/skills/add-star/scripts/screenshot.js <id> <scratchpad-dir>
```

The first script validates the data: unique ids, every field present, valid clusters, both ends of every thread, trivia targets, https links. It also prints the star counts per constellation. The second renders the chart with the new star selected in both groupings, prints the panel heading and main link, and fails on any console error.

**Look at both screenshots.** Check that the star isn't sitting on top of another star or a constellation label, that the panel heading isn't running under its × button, and that the summary reads well in the panel. If a constellation has grown crowded (the check warns above 11 stars), raise it with Richard rather than quietly moving constellations about.

## 3. Commit and merge

Work on the session's designated branch, after merging `origin/main` into it first. Commit just `js/projects.js` with a plain message ("Add <name> to the chart" plus a line on where it sits and its threads). Open a PR into `main` and merge it. The repo's own GitHub Pages workflow skips its deploy while Pages is switched off; that's expected, not a failure.

## 4. Deploy to Skapi

Skapi hosting is updated by uploading files with the connector. There's no deploy from GitHub.

1. **Don't fetch the live site before uploading.** Each CDN location caches whatever it serves for 24 hours (`s-maxage=86400`), so a "what's live now?" check just before the upload stores the *old* file at that location for a day. This bit us once.
2. Call `getHostingInfo` to confirm the site is active.
3. Call `hostFiles` with **only the changed files**, normally just `js/projects.js`. Pass the file's exact contents as text, and set `refresh_cdn: true` on the last upload.
4. **Verify against the stored copy, not the CDN.** Run `node .claude/skills/add-star/scripts/expected_size.js js/projects.js` for the expected numbers. Then call `readHostFile` on the same path with a small `length` (say 300), since the header is what you need. It reads Skapi's storage, not a cache, and reports `byte_size` and `total_chars`. **Both must match.** The upload result's `bytes` should match too. Past uploads have come through slightly wrong: a `·` escape turned into a literal `·` (4 bytes short, harmless), and once an apostrophe turned into `���`, which would have shown on the site and changed both numbers. If either number differs, upload the file again and re-check. For a closer look, read a window of the stored file around the new entry with `offset` and compare it with the repo.
5. Don't judge the deploy by fetching `https://starship-whisperer.skapi.com/…` with curl. A query string doesn't get past the cache (the CDN ignores it), and Skapi's refresh hasn't reliably cleared copies that were already cached. Some visitors may keep seeing the old chart for up to 24 hours. That's the cache expiring on schedule, not a failed deploy. Say so rather than renaming files to force it.

## 5. Tell Richard

Say what was added (topic and method groups, the threads, any trivia) and that it's merged and uploaded with a byte-for-byte check. Mention the cache: the new star may take up to a day to appear everywhere. Keep it short. Explain anything technical twice, once compressed (Kat) and once step by step (Richard), as the chart does.
