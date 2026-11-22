# Neurotrauma RDT: site plan

A rapid diagnosis and treatment reference for the Neurotrauma mod for Barotrauma. It replaces the Trello board [Neurotrama Guide CN](https://trello.com/b/9lRwWGNP/neurotrama-guide-cn) for in-game use, where the board is too slow to consult during an emergency.

## Goals

- Find any affliction, item or procedure in a few keystrokes.
- Go from observed symptoms to a ranked list of likely afflictions.
- Show first aid and full treatment on one screen, without clicking through linked cards.
- Keep the content bilingual (Chinese and English) exactly as it is on the board. No translation work is required, but entries can get separate Chinese versions later.

## Decisions made

| Decision | Choice |
|---|---|
| Users and login | None. The site is public and read-only. |
| Rendering | Static first: every route prerendered, built with `nuxt generate`. A server is added later only if a feature needs one (see Phase 8). |
| Content storage | Nuxt Content v3: markdown files with typed frontmatter, tracked in git. |
| Search | Fuse.js through Nuxt UI's `UCommandPalette`. Fuse is already installed as a dependency of `@nuxt/ui`. |
| Source of truth | The site, after a one-time Trello import. Re-importing would overwrite hand fixes. |
| Editing | Markdown edited in git (GitHub web editor or pull requests). Each push rebuilds the site. |
| Locales | English (`en`, default) and Chinese (`zh`), with `@nuxtjs/i18n`. See "Localization". |
| Locale in URLs | None (`no_prefix`). One URL per entry in every language, so links shared mid-round open as sent. The chosen locale is kept in a cookie. |
| Localized content | Separate folders and collections per locale (`content/en/`, `content/zh/`), following the [Nuxt Content i18n integration](https://content.nuxt.com/docs/integrations/i18n). `zh` holds overrides; anything missing falls back to `en`. |

## Localization

**Routes.** `strategy: 'no_prefix'`. `/afflictions/pneumothorax` is the same page whichever language the reader uses. The locale is detected from the browser on the first visit and remembered in the `i18n_locale` cookie. The header has a 中文 / English toggle.

**Content.** Each entry type has one collection per locale, named `<type>_<locale>`:

| Folder | Collection | Route |
|---|---|---|
| `content/en/afflictions/pneumothorax.md` | `afflictions_en` | `/afflictions/pneumothorax` |
| `content/zh/afflictions/pneumothorax.md` (optional) | `afflictions_zh` | the same route |

- `content/en/` is the complete set as imported from Trello. Its bodies are bilingual, because the board mixes Chinese and English too inconsistently to split automatically. The importer writes here.
- `content/zh/` starts empty (only a README). Add a file at the same relative path to give an entry a Chinese-only version.
- The catch-all page `app/pages/[...slug].vue` queries the current locale's collection and falls back to `en`, as in the Nuxt Content i18n docs. The first path segment picks the entry type.
- Every entry is prerendered once, from the list of files in `content/en/`.

**Interface text.** Messages live in `i18n/locales/en.json` and `i18n/locales/zh.json`. Nuxt UI 4.13 follows the i18n locale on its own, so its components' built-in text (search placeholder, buttons) switches too. `@nuxt/content` is registered after `@nuxt/ui` so Nuxt UI's prose components render the markdown.

**Known limitation.** Static pages can only be prerendered in the default locale when URLs carry no locale. A reader whose cookie says `zh` gets the English HTML first, and the page switches to Chinese while it loads: a brief flash, plus a hydration-mismatch warning in the console. The content shown afterwards is correct. Fixing this needs either locale prefixes in URLs or server rendering (Phase 8).

**Later, if wanted:** split entries into Chinese and English versions one at a time, moving the English half to `content/en/` and the Chinese half to `content/zh/`. No route changes are needed for that.

## Open questions

- **Shared crew triage board.** This is the one feature that needs a server (Phase 8). If it is wanted from day one, keep `@nuxthub/core` in Phase 1 instead of removing it.
- **Hosting.** Any static host works (GitHub Pages, Cloudflare Pages, Netlify, Vercel). Not chosen yet.
- **Meaning of "RDT".** This plan assumes "rapid diagnostic tool", which is the symptom checker in Phase 5.

## What the Trello board contains

- 18 lists and 229 cards, per the JSON export.
- The board is a copy of the original guide. Links inside cards point at the original board's card IDs, so they have to be matched by name. The original board is public; this one is not.
- Lists group cards by body part (Head/Brain, Lungs, Heart, Torso, Extremities, Bones, Any bodypart, Blood), by type (Information, Symptoms, Item, Surgery, Procedures) and by expansion (Cybernetics, Surgery Plus, Eyes, expansion guides).
- Each card is a markdown article, Chinese first and English second, usually split by a `---` line.
- Affliction cards follow a template with the headings 由以下原因造成 (caused by), 导致 (leads to, with percentage thresholds), 治疗措施 (treatment) and 急救 (first aid).
- Cards link to each other with `trello.com/c/<shortLink>` URLs. Some English halves link to the old English board.
- Labels mark type and properties: 苦痛 Affliction, 物品 (item), 信息 (info), 非致命 (non-lethal), 健康扫描仪可见 (visible on the health scanner), 小众 (niche).
- Known gaps: the Eyes Expansion list is empty, and the Cybernetics list is flagged "Needs images".

## Phase 1: Strip the template

The repo is a Nuxt 4 starter with Logto login, user management, a Postgres database and blob storage. None of that is needed.

**Remove:**

- Modules and packages: `nuxt-auth-utils`, `nuxt-authorization`, `@nuxthub/core`, `drizzle-orm`, `drizzle-kit`, `postgres`, `@electric-sql/pglite`, `@vercel/blob`, `nuxt-security`.
- Server: `server/api/v1/auth/*`, `server/api/v1/users/*`, `server/db/*`, `server/plugins/authorization-resolver.ts`, `server/utils/core/*`.
- Shared: `shared/abilities/*`, `shared/utils/roles.ts`, `shared/types/auth.d.ts`, `shared/types/db.d.ts`.
- App: `app/composables/core/*`, `app/middleware/*`, `app/plugins/authorization-resolver.ts`, `app/plugins/session-prefetch.*`, `app/pages/signin.vue`.
- Config: the `hub`, `security` and `runtimeConfig.oauth` blocks in `nuxt.config.ts`, and the database, Logto and blob entries in `.env.example`.

**Keep:** `@nuxt/ui`, `@nuxtjs/i18n`, `@nuxt/image`, `@nuxt/fonts`, `@vueuse/nuxt`, `motion-v`, `zod`.

**Add:** `@nuxt/content`, and `pinyin-pro` as a dev dependency.

**Done when:** `nuxt generate` builds a site with a working home page and no auth code left.

## Phase 2: Import Trello

**Status:** importer written and run. 224 entries are in `content/en/`. The report's remaining items still need working through by hand.

1. Export the full board as JSON to `data/trello/board.json` (gitignored, since it contains member data).
2. Run `bun run import:trello` (`scripts/import-trello.ts`). For each card it:
   - maps the list to an entry type and `category`, and the labels to tags;
   - keeps the description whole, because Chinese and English aren't separated consistently; only the names are split into `nameZh` and `nameEn`;
   - parses headings into `causedBy`, `causes`, `treatment`, `firstAid`, `treats`, `onSuccess`, `onFailure`, `effects` and `steps`, plus `threshold`, `amount` and `skill` values;
   - rewrites Trello card links to internal paths, matched by the name in the URL or the link text. Remaining IDs are looked up on the public original board, and the results are cached in `data/trello/original-cards.json`;
   - merges cards that Trello shows on two lists into one entry with `alsoIn`.
3. The output goes to `content/en/<type>/<slug>.md`. The importer refuses to overwrite existing content unless given `--force`.
4. The report at `data/trello/import-report.md` lists unresolved and broken links, unrecognised headings, unparsed thresholds, merged duplicates and the images still hosted on Trello.

**Not done:** images are still linked to Trello, because downloading them from a private board needs an API key.

**Done when:** every card on the board has a file, and the report has been worked through by hand.

## Phase 3: Content collections and detail pages

**Status:** done. Detail pages, type index pages and the home page are built; schemas are per type and enforced by `bun run check:content`.

`content.config.ts` defines one collection per type and locale (see "Localization"). The schemas live in `content.schemas.ts`, one per type, matching what the importer writes:

```ts
// every type
{ title, nameZh?, nameEn?, category, alsoIn?, source, order, tags[], pinyin?, pinyinInitials?, aliases[], trello? }

// section items: { text, refs?: ['afflictions/hypoxemia'], threshold?, amount? }
affliction: { lethal?, causedBy[], causes[], treatment[], firstAid[] }
symptom:    { causedBy[], treatment[] }
item:       { skill?: { medical?, mechanical? }, onSuccess[], onFailure[], treats[] }
procedure:  { steps[] }
info:       {}
```

- `source` is the base mod or an expansion (Cybernetics, Surgery Plus, Eyes, Pharmacy, Infections), so expansion content can be filtered out.
- The symptom-to-affliction index is computed at build time from `causes`. It is not stored.
- `category`, `source` and `tags` are fixed lists (in `shared/utils/content.ts`), so a typo fails the check instead of creating a new category.
- **Nuxt Content does not reject files that break the schema**; it only uses schemas for types. `scripts/check-content.ts` (`bun run check:content`, run in CI before the build) validates every file. It also checks that every internal link and `refs` target exists, and that every `zh` override has an `en` entry.
- **Detail page** (`app/pages/[...slug].vue`): names (the locale's language first), badges for lethality, skill checks, in-game visibility and expansion, then the structured sections as cards. First aid and treatment come first and are highlighted. Thresholds and amounts show as badges. The original card text is in a collapsible "Full guide text" section, open by default when an entry has no structured sections.
- **Type index pages** (`app/pages/[type]/index.vue`, e.g. `/afflictions`): entries grouped by category in board order, with lethal entries marked.
- **Home page:** links to the five types. The header navigation lists them too.

**Done when:** every imported entry renders at its own URL and internal links resolve.

## Phase 4: Search

**Status:** done. `bun run test:search` (run in CI after the build) measures the criterion below.

| Query kind (one per entry) | Enter lands on it | In top 3 |
|---|---|---|
| Chinese name | 100% | 100% |
| Full pinyin | 100% | 100% |
| Pinyin initials | 99% | 100% |
| First 3 letters of the English name | 66% | 92% |

The English misses are names that share a prefix ("Hyp", "Sur", "Cyb"), where 3 letters can't pick one entry. 22 curated queries a medic would type ("pne", "qx", "肾上腺", "cardiac arr", "naus"…) all land first, except "band", which ties between Bandaged and Bandages.

As built:

- **Index:** `server/routes/search-index.json.ts` is prerendered to a static `/search-index.json` (224 records, about 43 KB). Each record has the names, aliases, pinyin and initials, a lethal flag, and the names of what the entry leads to (so "nausea" also finds its causes, ranked below Nausea itself).
- **Ranking:** `shared/utils/search.ts`. Fuse with the weights below, plus a directness tier applied first. The tiers, best first: an exact name, pinyin or initials; then a name that starts with the query; then pinyin that starts with it; then a word inside an English name; then fuzzy matches. Names outrank pinyin, so "sho" finds Shortness of Breath before 手术 (*shoushu*).
- **Palette:** `app/components/SearchPalette.vue`, a `UCommandPalette` in a modal, opened by `/`, Ctrl/⌘+K or the header button. It runs Fuse itself and passes pre-ranked results with `ignoreFilter`. The palette's own Fuse options would merge its default keys into ours, and it groups results by type rather than best first. The index downloads on first open; after that, search makes no network requests.

Original plan:

- Build one search index at build time from the collections, including pinyin and pinyin initials generated with `pinyin-pro`, so `qx` finds 气胸 without switching input method.
- Feed it to `UCommandPalette` as `groups`, opened with `/` or `Ctrl+K`, and weight the Fuse keys through its `fuse` prop:

  | Key | Weight |
  |---|---|
  | English and Chinese names | 3 |
  | Aliases | 2 |
  | Pinyin and initials | 2 |
  | Symptoms and short summary | 1 |

- The index loads once, then search works offline with no network round trip.

**Done when:** typing three characters in English, Chinese or pinyin and pressing Enter lands on the right entry.

## Phase 5: Symptom checker (built as the triage page)

**Status:** done, as `/triage`, which is broader than the original plan below. Only 29 of 76 afflictions are reachable from symptoms, but 67 are shown directly by the health interface, scanner or analyzer. So the page takes both: you tap what you see, symptoms and visible afflictions alike, and it handles diagnosis and treatment together.

- **Findings:** every symptom and visible affliction as a large chip, grouped by where the game shows it (symptoms, health interface, scanner, analyzer). Common symptoms come first, and there's a filter box for rare ones. No typing needed.
- **Likely causes:** conditions that would explain the selected findings that nothing marked present already explains. They're ranked by how many findings they explain, then lethal first, then by how telling the findings are (rare ones weigh more). Each shows what it explains and what else to look for. "Present" adds it.
- **Check next:** the findings that best split the leading candidates (about half lead to each). With one candidate left, these are its other findings, to confirm it.
- **Treatment plan:** for everything present, one list. First aid comes first, then treatment, in the order of the guide's 治疗顺序 card (`TREATMENT_ORDER` in `shared/utils/triage.ts`). Conditions the card doesn't mention are placed by lethality. Then one merged list of items to bring.
- **Shareable:** the selection is in the URL (`/triage?f=s:headache,a:pneumothorax`), so a link shares the patient and the back button undoes a tap.
- **Data:** `/triage-index.json`, prerendered (102 afflictions and symptoms, 242 "leads to" links from both `causes` and `causedBy`, 59 KB). Logic in `shared/utils/triage.ts`.
- **Tests:** `bun run test:triage` (in CI). For all 46 afflictions with two or more observable findings, selecting them ranks the affliction first. With only the two rarest of 3+ findings, all are in the top 3, and "check next" points at one of their other findings 83% of the time. The plan order matches the card.
- **Data gaps:** `check:content` warns (without failing) about "leads to" lines that name a symptom or affliction without linking it, since triage can't see those. 8 at the moment.

Original plan:

- Select symptoms and Health Scanner readings as chips.
- Rank afflictions by how many selected symptoms they cause, weighting rare symptoms more than common ones.
- Pin lethal afflictions to the top and show which selected symptoms each match explains.
- This is a plain filter and score over the computed index, not fuzzy search.

**Done when:** selecting the symptoms listed on an affliction's card puts that affliction at or near the top.

## Phase 6: Treatment and procedure views

**Status:** done.

- **Treatment card:** the entry detail page (Phase 3).
- **Patient scratchpad:** the triage page's shareable selection (Phase 5); no `localStorage` needed.
- **Procedure checklists** (`app/components/Entry/Checklist.vue`): procedure steps are tickable, with progress ("2 of 5 done") and Reset. Ticks are kept in session storage per page, so following a link to an item and coming back keeps your place; a new tab starts fresh. They're read after hydration, so a reload doesn't cause hydration mismatches. Procedures other than Open & Close Surgery show a callout that surgeries open and close the same way, linking to it.
- **Quick reference** (`/reference`): the guide's 如何诊断 (3 H's), 五条戒律 (five commandments), 治疗顺序 (treatment order) and 医疗箱建议 (medkit loadouts) cards on one page, with a sticky jump bar. The text comes from those info entries (with locale fallback), so editing them updates the page. The list is `REFERENCE_SECTIONS` in `shared/utils/content.ts`; `check:content` fails if an entry it names (or one in triage's `TREATMENT_ORDER`) goes missing.
- **Report a problem / Edit on GitHub:** at the bottom of every entry. Report opens a new GitHub issue pre-filled with the entry, page and file; Edit opens the markdown file in GitHub's editor. Repository and branch are `runtimeConfig.public.repository` (default `Type-32/neurotrauma-rdt`, branch `dev`).
- **Dropped:** "Medical Misconduct warnings inline". That entry turned out to be a Surgery Plus item that raises medical skill, not a list of surgical mistakes.

- **Treatment card:** first aid, then full treatment, then required items as chips, then a link to the procedure. Large text, dark mode, Chinese and English side by side or toggled.
- **Procedure checklists:** surgery steps as a tickable list, with a reminder to close the surgery, and Medical Misconduct warnings inline.
- **Patient scratchpad:** a list of patients, their afflictions and what has been done, stored in the browser's `localStorage`.
- **Quick reference pages:** treatment order (治疗顺序), medkit loadout (医疗箱建议), the five commandments, and the "Three H's" of diagnosis.
- **Report an error:** a link per entry that opens a pre-filled GitHub issue.

## Phase 7: Offline use

**Status:** done, with `@vite-pwa/nuxt` 2 (config in `nuxt.config.ts` under `pwa`).

- **What's precached on first visit (about 5 MB, 416 files):** the app code and fonts, the content database dumps (`__nuxt_content/*/sql_dump.txt`) and the SQLite WASM engine, the search and triage indexes, the i18n message files, per-page payloads, the SPA shell (`200.html`) and the main pages (home, triage, reference, type indexes). The 20 MB of prerendered entry HTML is not precached.
- **Entry pages:** network first, so online readers get the prerendered HTML, cached as they go. Offline, the cached copy is used; if there is none, the SPA shell, which renders the entry from the cached content database. Tested offline with never-visited entries in both languages.
- **Updates:** `registerType: 'autoUpdate'`: a new build's service worker takes over and the page reloads.
- **Install:** web manifest with generated icons (`public/icon.svg` → PNGs via `pwa-assets-generator --preset minimal-2023`). An Install button appears in the header when the browser offers installation, and a one-time "Ready to work offline" notice shows when caching finishes.
- **Gotchas found while building it, now handled in the config:**
  - The module's default `navigateFallback` answered every navigation with the shell, even online. It's set to `null`; the page rule falls back only when the network fails.
  - The module stores `200.html` under its clean URL `/200`, so the fallback looks up both names.
  - A broad `_nuxt/**/*.json` pattern duplicated the module's own build-manifest entries with different revisions, which stops the service worker installing.
  - The i18n message files (`_i18n/…/messages.json`) load lazily and must be precached, or labels show as raw keys offline.
- **Building on Windows:** stop the preview server before `bun run generate`; it locks `.output/public`.

## Deployment (Vercel)

`vercel.json` makes Vercel deploy the static site: it runs `NITRO_PRESET=static bun run generate` and serves `.output/public`, with no framework preset and no serverless functions. This is the exact output tested offline in Phase 7.

- **Why not Vercel's defaults:** Vercel's default `nuxt build` deploys a serverless function, so in-browser content queries would hit it instead of the static database dumps. Nitro's `vercel-static` preset doesn't write the per-page `_payload.json` files its own pages request, or the i18n message files. Both failed the service-worker build.
- `/200.html` is prerendered explicitly and `i18n.experimental.prerenderMessages` is on, so `bun run build` also succeeds (it was the original Vercel failure: "glob pattern doesn't match 200.html").
- CI runs lint, typecheck, `check:content`, the build, and both search and triage tests.

## Art direction: medic terminal

**Status:** every page is in the new look (Phase 9). Phase 10 adds the body schematic.

- **Palettes:** dark is "graphite HUD", light is "orbital ops" (sage paper). Both are defined as `--ui-*` variables in `app/assets/css/main.css`.
- **Colour carries meaning:** signal orange is first aid and actions, red is lethal, amber is possibly lethal, mint is treated or done. Everything else is ink on paper.
- **Building blocks:** the `micro` utility, `.micro-frame`, `.micro-grid`, `.micro-rule`, and the `Micro*` components (`Panel`, `Rule`, `Bar`, `Scramble`, `Graphic`). SVGs come from the Micrographics Vol.1 pack through `scripts/import-micrographics.ts`.
- **Motion rule:** content never starts hidden. Only decoration animates, and reduced motion turns it off.

## Phase 9: Finish the reskin

**Status:** done. Home, the type indexes, the quick reference and the search palette now use the terminal look; triage uses the shared page header too. No behaviour changes. Built pieces: `Micro/PageHead.vue`, `Entry/Row.vue`, `TYPE_ICONS` in `app/utils/entries.ts`, and `TYPE_CODES`, `categoryCode` and `entryShortCode` in `shared/utils/content.ts`. The search index now carries `category` and `order`.

**9.0 Shared pieces (do first)**

- `Micro/PageHead.vue`: the page header used by entry pages, as a component: code band, large `font-brand` title with `MicroScramble`, description, and a right-hand slot for a count or action. Replaces `UPageHeader` on the three pages below.
- `Entry/Row.vue`: one entry as a dense row: code stamp (`entryCode`), primary and secondary name, and a lethal marker (red or amber bar, not a skull icon). Used by the type indexes and the search palette.
- Move `TYPE_ICONS` out of `pages/index.vue` and `SearchPalette.vue` into `app/utils/entries.ts`; it is duplicated today.

**9.1 Home (`app/pages/index.vue`)**

- Lay it out as a console, not a card grid.
- Triage is the one primary panel: orange frame, `orbit` graphic, short description. Quick reference sits beside it as a default-tone panel.
- A search prompt line (`> search_` with `.micro-cursor`) that opens the palette, with the `/` shortcut shown.
- The five types as a numbered index table: `01 // AFFLICTIONS … [076]`, each row a link. Counts come from `queryCollection(...).count()` in one `useAsyncData`.
- A small readout strip: total entries, lethal count, content locale.

**9.2 Type indexes (`app/pages/[type]/index.vue`)**

- `MicroPageHead` with the type code (`AFF`, `SYM`…) and entry count.
- Category headers become micro-labels with a count and a `MicroRule`: `03 // HEART [08]`.
- Entries become `EntryRow`s in the existing 1, 2 or 3 column grid.
- Afflictions have 12 categories, so add a sticky jump bar of category codes, the same pattern as the reference page.

**9.3 Quick reference (`app/pages/reference.vue`)**

- Each section becomes a `MicroPanel` numbered 01 to 04, with the entry title as meta.
- The jump bar becomes micro-label tabs. The current section is marked using `useIntersectionObserver` (VueUse is installed).
- Prose stays as `ContentRenderer` output. Check tables and lists inside a panel in both themes.

**9.4 Search palette (`app/components/SearchPalette.vue`)**

- Restyle through `UCommandPalette`'s `ui` prop and item slots; keep the ranking and shortcuts untouched.
- Result rows: name, secondary name, then the mono code stamp on the right; lethal marker on the left edge.
- Prompt glyph `>` in the input, micro-label group headings, and a `[n]` result count.
- The search index has `type` but neither `category` nor `order`. Add both to `search-index.json` (with `Number(order)`) so the palette can show the code stamp.

**Done when**

- All four surfaces match the entry and triage pages in both themes and both locales, at 375 px and desktop widths.
- Reduced motion shows everything with no animation.
- `lint`, `typecheck`, `check:content`, `generate`, `test:search` and `test:triage` pass, and the home page still works offline.

## Phase 10: Triage body schematic

**Status:** done (2026-11-22). A body diagram on the triage page, as a faster way to narrow findings by where they are. It filters the finding words; it does not replace them.

**As built:**
- `createTriage().regionsOf(id)` in `shared/utils/triage.ts` (computed in the browser from the index, not stored in it). Afflictions by category (no affliction uses `alsoIn`); "any" and "blood" are the whole body; surgery and expansion categories have none. Symptoms take their causes' regions. Of 95 observable findings: head 19, lungs 8, heart 12, torso 19, limbs 7, bones 7, whole body 37, none 10; no finding is in more than four regions, so the weighting fallback below wasn't needed. `test:triage` checks known cases and that no region is empty.
- `app/components/Triage/Body.vue`: a geometric front-view figure (head, torso, lungs and heart inside it, limbs, bones as a dashed line overlay, the whole body as a dashed outline), with a list of the regions and counts beside it. The figure is for pointing and hidden from screen readers; the list buttons (`aria-pressed`) carry the labels and keyboard access; hovering either highlights both. Filled = findings picked there; outlined red / amber / grey = where the five likely causes are; accent = the active filter.
- Pick step: a 19rem column beside the words at desktop sizes; on phones a collapsed "Filter by body part" panel above them. While filtered, the picker shows "Only Lungs ×", the tab counts follow, and picked words stay visible. The region isn't in the URL.
- Changed from the plan: the whole body is the dashed outline rather than a ring, and bones are a line overlay that is always drawn (no separate toggle).

**Data**

- Regions are the body categories: head, lungs, heart, torso, extremities, bones. `any` and `blood` are whole-body and shown as a ring around the figure.
- Afflictions already carry `category` and `alsoIn`.
- Symptoms all have the category `symptom`, so a symptom's regions are derived: the regions of the afflictions that lead to it. `triage-index.json` already holds those links; add a `regions` array per entry there.
- Extend `scripts/test-triage.ts` to check the derivation on a few known cases.

**Drawing**

- One hand-authored inline SVG in HUD style: a geometric front-view figure, with lungs and heart as shapes inside the torso and bones as a toggled overlay. Nothing in the micrographics pack is a body, so it is drawn for this.
- Strokes use `currentColor` and the `--micro-*` variables, so both themes work without separate art.

**Interaction**

- Each region is a real button with `aria-pressed`. Tapping it filters the findings list to that region; tapping again clears it.
- Regions with selected findings are filled. Regions of the current candidates are outlined, red or amber when a candidate there is lethal.
- A count per region (`HRT 03`) shows how many findings are available there.
- The region filter is not part of the shareable URL; the selected findings still are.

**Layout**

- Desktop: at the top of the `IN //` column, above the filter box.
- Mobile: a collapsed panel that opens on tap, so the chips stay reachable with one thumb.

**Risks**

- A symptom caused by afflictions in many regions appears under several. That is correct but may make the filter feel weak; if so, weight by how many causing afflictions sit in each region.
- The 8 unlinked "leads to" warnings (Phase 11) are missing links that this depends on. Fix those first.

## Phase 11: Content cleanup

**Status:** done (2026-11-22). From the Phase 2 import report.

**Done (2026-11-22):**
- Of the 8 unlinked "leads to" warnings, 2 were real and are now linked: infected wounds → [immunity](/afflictions/immunity), sufforin poisoning → [confusion](/symptoms/confusion) (both reach triage). The other 6 name an entry without being a cause of it (a fracture as the condition for amputation, "出血" inside "内出血", a healing-rate note…). They're listed with reasons in `NOT_CAUSES` in `scripts/check-content.ts`, so the check is at 0 warnings.
- **Hand edits survive re-imports.** Decided: keep the importer, with a `manual: true` frontmatter flag (in the schema). `import:trello --force` regenerates everything else and keeps flagged files as they are. Flagged so far: hypertension, hypotension, infected-wounds, sufforin-poisoning. Any future hand edit should add the flag.
- **Links to the original board: 0 left** (99 raw Trello card links across 35 entries, of which the report counted 42). The archived "伤口 Wounds" card was later split on the current board, so wound links go to [开放性伤口 Open Wounds](/afflictions/open-wounds) (lacerations, gunshot, bite, generic "wounds") or [内伤 Internal Damage](/afflictions/internal-damage) (blunt force, "internal wounds"); "创伤" lines follow what they list. Links into the English board's copies of existing entries go to those entries; organ procurement scalpels go to organ transplant surgery; Morbusine (base game) to the official wiki. Bare URLs became labelled links, and frontmatter items gained the matching `refs`, so triage sees them. Each `trello.url` provenance field is kept. The rewritten entries are flagged `manual: true`.
- **New entry: [制药拓展药丸 NT Pharmacy Pills](/info/nt-pharmacy-pills)**, from the six NT Pharmacy pill cards the medkit loadouts and cardiac arrest / heart attack linked to: what each treats and its recipe, both languages, linked to our item entries.
- **Images:** the content used only 5 Trello-hosted images (the other ~210 in the report are card attachments the importer never put into entries). They're downloaded to `public/img/entries/` (about 260 KB) and linked locally. `bun run localize:images` (`scripts/localize-images.ts`) does this and can be re-run after any import; Trello serves public attachments without signing in.

- ~~**8 unlinked "leads to" mentions**~~: done (see above).
- ~~**42 links to cards that only exist on the original board**~~: done (see above).
- ~~**217 images still hosted on Trello**~~: done (see above).
- **Still to confirm by hand:** the Vercel deploy (once Vercel Authentication is off for the project). The Install button went with the PWA in Phase 12.

**Decided:** the importer stays and skips hand-edited files marked `manual: true` (see Done above).

**Suggested order:** Phase 9, then the "leads to" fixes from Phase 11, then Phase 10, then the rest of Phase 11.

## Phase 12: Rebuild the interface

**Status:** done (12.1–12.6). Phase 11 is done too; Phase 10 (body schematic) is next. Replaces the look built in the art-direction work and Phase 9, and removes Phase 7 (PWA). Phase 10 (body schematic) is on hold until this is done.

**Built so far, and where it differs from the plan below:**
- PWA removed; `public/sw.js` is the kill switch (checked: an old installed worker unregistered itself and its caches were cleared).
- Dock (`app/components/App/Dock.vue`) and corner controls (`App/Corner.vue`) replace the header and status bar. Search results grow the dock upward in place; the modal palette is gone. Database points at `/afflictions` until 12.5.
- Triage is the home page (`app/pages/index.vue`); `/triage` forwards there with its query. Components: `Triage/Picker`, `Strip`, `Answer`, `Question`, `Orbit`, `Treatment`. Motion presets: `app/utils/motion.ts`.
- `evaluate(selected, ruledOut)`: ruled-out findings count against causes (score and ranking), are excluded from suggestions, and are in the URL as `&x=`. `test:triage` checks that ruling out a telling finding demotes the leader (19/19).
- Layout: on desktop the answer takes the wide left column and the question and picker sit in a right column; on a phone they stack with the answer first. No bottom sheet: stacking read better with the dock at the bottom.
- A symptom's own relief (e.g. for nausea) does not lead as "Treat now"; only conditions do. It still runs in the step-through.
- Swaps (leading cause, question, treatment step) use short timed transitions, not springs: a spring's settle made `mode="wait"` feel stuck.
- 12.4 entry pages (`app/pages/[...slug].vue`): one reading column. Name, lethality word, second-language name, then one quiet line of details (where it shows, skill checks, expansion, flags, code). The sections a medic came for lead, per type (`LEAD` in the page): first aid and treatment everywhere, plus what causes a symptom, what an item treats and its effects, and a procedure's steps. Lead lists over four items drop a size. Everything else folds below (`UCollapsible`, kept in the DOM for find). Info entries with no sections show their guide text as the page.
- Procedure steps: a numbered list plus "Step through", which opens the same full-screen step-through as triage (`app/components/StepThrough.vue`; triage's `Treatment.vue` now wraps it). The session-storage checklist and the status panel are gone.
- Page entrances use a CSS animation (`.rise` in `main.css`), not motion-v, so the prerendered page is visible even before or without JavaScript. motion-v is for interaction.
- Triage picker opens on an "All" tab (every finding, symptoms first); the source tabs narrow it. "+ N more" is full-size, not a micro-label.
- 12.5 database (`app/pages/[type]/index.vue`): the type routes stay (`/afflictions`, `/symptoms`…, all prerendered) but share one page key, so the type switch slides its marker instead of reloading and the filter carries over. Names only in a 1–4 column grid by category, lethal dot, second-language name as tooltip. The filter matches English, 中文, pinyin and initials, the tab counts follow it, and an empty result points at the types that do match.
- 12.5 reference (`app/pages/reference.vue`): one card at a time; large numbered tabs or ← → switch, the card slides in the direction of travel, and the hash (`/reference#order`) selects the card. Prose at 18 px.
- The dock search replaced the modal palette in 12.2.
- **Triage flow, revised after friends tested it (2026-11-21).** Tapping one symptom used to jump straight to an answer, so testers took it as final; the narrowing question and "add more" sat in a side column and read as unrelated suggestions. Now two clear steps: (1) pick, multi-select, words mark in place, and a bar above the dock shows the count, a live "Most likely …" preview and **Get answer** (Enter); (2) answer, one column read top to bottom: Edit findings / Copy link / Clear, the patient strip, the most likely cause, **Narrow it down** directly under it (inside `TriageAnswer`'s `narrow` slot), what to do, other causes, then "Add what else you see". The step is in the URL (`&a=1`). Picking replaces the history entry; changing step and answering questions push one.
- The selection is local state synced to the URL, not read from it: reading from the URL lost quick taps (the second tap read the query before the first navigation landed).
- Hypertension and hypotension had no visibility tag in the guide, so triage never offered them. Tagged `scanner-visible` in `content/en` (the health scanner reports blood pressure). A re-run of `import:trello` would drop this; see the Phase 11 decision about hand edits.
- 12.6 clean-up: removed `MicroPanel`, `MicroRule`, `MicroPageHead`, `MicroScramble`, `MicroGraphic`, `EntryRow`, the 12 pack SVGs and `scripts/import-micrographics.ts` (and `svgo`), the `.micro-frame` / `.micro-rule` / `.micro-grid` / `.micro-cursor` styles and their colour variables, the search modal's leftover state, and 27 unused interface messages. Kept: the palettes, Saans, the `micro` label style, `MicroBar` (threshold gauges), `--micro-mark` (dotted link underlines).
- Final pass on the static build: every page in dark and light, English and Chinese, at 1600×900 and 375 wide. Long display names (e.g. Hemotransfusion Shock) overflowed a phone; they now hyphenate and wrap, one size smaller on phones.
- **Fixed after the pass:** Chinese readers got "Hydration completed but contains mismatches" on every load: pages are prerendered in English, and the i18n module switched to Chinese before hydration. Browser-language detection is now off in the module; `app/plugins/locale.client.ts` hydrates in English, then switches to the reader's language (the `i18n_locale` cookie, else Chinese when the browser prefers it) once the page is live, and remembers every switch in the same cookie. Checked on the static build: no mismatches in either language, and the choice survives a reload.
- **Not checked in a browser:** reduced motion. motion-v follows it through `MotionConfig reduced-motion="user"`, and the CSS animations (`.rise`, page transitions, orbit spin) have `prefers-reduced-motion` blocks.

**Why:** the current pages give everything the same weight. Every panel has brackets, a number, a label and a dashed rule; triage shows 100+ boxed two-line chips at once; the answer (what to do for the patient) is the smallest thing on screen. Nothing responds when touched beyond a colour change. The palettes and fonts stay. The layout, the density and the motion are rebuilt.

### Rules for the rebuild

1. **One focus per screen.** At any moment one thing is clearly the largest and brightest: the question being asked, or the action to take.
2. **Read first.** Body text at 18 px or more, answers much larger. A medic reads the next action from arm's length.
3. **Space, not lines.** Groups are separated by whitespace and type size. No boxes around list items, no dashed rules, no corner brackets on panels.
4. **A micrographics budget.** Per screen: at most one graphic, one mono label style, one accent colour in use. A micrographic must show real state (a count, progress, a ranking) or it is cut.
5. **Motion explains change.** Whatever the user touches moves, and whatever changes as a result visibly travels to its new place. Under 300 ms, never blocks input, off with reduced motion.
6. **No stock chrome.** No top navigation bar, no footer status bar, no card grids.

The old rule "content never starts hidden" is dropped. It was mine, not a limit of static generation, and it is the reason motion-v was barely used.

### 12.1 Remove the PWA

- Remove `@vite-pwa/nuxt`, the `pwa` config, `PwaInstall.vue`, `<NuxtPwaManifest>`, the offline notice and the precache-only prerender entries.
- Ship a small kill-switch `public/sw.js` that unregisters itself and clears its caches. Without it, browsers that already installed the service worker keep serving old pages; this is what made stale builds appear during testing.
- **Static generation stays** unless you say otherwise. It does not restrict motion-v: animations run in the browser after the page loads either way. The unstyled Vercel page was deployment protection, not the build. Switching to server rendering later is a one-line change in `vercel.json`.

### 12.2 Shell: a dock instead of a header

- Remove the header and the status bar. A small wordmark sits top-left; language and colour mode sit top-right as two quiet icons.
- Navigation is one floating dock at the bottom centre: a search field ("What are you looking for?") with three destinations beside it: Triage, Reference, Database.
- Focusing the dock grows it into the search results in place (a shared-element `layoutId` transition), not a separate modal. Search is the main way around the site.
- Page changes cross-fade with a short slide; the dock stays put.

### 12.3 Triage, rebuilt as a guided flow (build this first, then stop for review)

The page becomes a conversation with one question on screen, not a wall of options.

- **Start:** a large prompt, "What do you see?", with one input. Typing filters findings instantly (English, 中文, pinyin). Under it, plain-text suggestions, largest first by how often they matter, one source at a time (Symptoms / Health interface / Scanner / Analyzer) behind a segmented switch. No boxes, one name per finding in the reader's language; the other language appears on hover or long-press.
- **Picking a finding:** the word lifts, shrinks and flies to a patient strip at the top (shared element). The strip is the only place selections live; tap one there to remove it and it flies back.
- **The answer leads:** as soon as one finding is picked, the top half of the screen is the answer:
  - the most likely cause in display type, with a bar that grows or shrinks as its share of the evidence changes;
  - the first-aid action under it in the accent colour, the single hottest thing on the page;
  - other candidates as a short ranked list that physically reorders (layout springs) as evidence arrives.
- **Ask next, one at a time:** a single card, "Vomiting?", with Yes / No / Can't tell. The answer slides the card away and the ranking reacts. Keyboard: Y, N, space.
  - This needs "No" to count. Today triage only knows what is present; `shared/utils/triage.ts` gains ruled-out findings that lower or remove candidates, and the share link gains them too. `test:triage` is extended.
- **Treatment as a step-through:** when the medic commits to a cause, the plan takes over the screen: one step at a time in large type, with items to bring listed once at the start. Completing a step collapses it to a struck-through line and the next rises. A thin progress line is the only decoration.
- **The one graphic:** the orbit. Each ring is a remaining candidate; rings drop away as questions are answered, and it settles to a single point when one cause is left. It is the confidence display, not ornament.
- **Layout:** a single centred column that splits into question and answer only when there is an answer. On a phone the answer is a sheet that rises from the bottom.

### 12.4 Entry pages

- Name, then first aid and treatment in large type, with nothing beside them.
- Lethality is one word next to the name. Skill checks, source and visibility become a single line of quiet metadata, not a framed side panel.
- Leads to, caused by, effects and the full guide text sit below a fold, opened in place with a height animation. Thresholds keep the gauge; it is real data.
- Procedure steps reuse the step-through from triage.

### 12.5 Home, database, reference, search

- **Home is triage.** The site opens on "What do you see?". The current home page is removed.
- **Database:** one page with a type switch, a typographic list in columns (name only, a red dot for lethal), and a filter that narrows it as you type with items sliding into place.
- **Reference:** one section on screen at a time, moved between with large tabs or arrow keys, not one long page of panels.
- **Search:** lives in the dock (12.2). The modal palette is removed.

### 12.6 Clean-up

- Delete what the rules cut: `.micro-frame`, `.micro-rule`, `MicroPanel`, `MicroRule`, `MicroPageHead`, the numbered `01 //` labels, the page grid background, unused pack SVGs.
- Keep: palettes, Saans, the `micro` label style (used sparingly), `MicroBar`, `MicroScramble` for codes only.
- Shared motion pieces in one place: press feedback, reveal, shared-element groups, number roll, all honouring reduced motion.

### Order and checkpoints

1. 12.1 PWA removal and kill switch.
2. 12.2 shell and the motion pieces.
3. 12.3 triage. **Stop here and review it together before anything else is restyled.**
4. 12.4 entry pages.
5. 12.5 home, database, reference, search.
6. 12.6 clean-up, then lint, typecheck, `check:content`, build, `test:search`, `test:triage`, and a browser pass in both themes, both languages, phone and desktop, with and without reduced motion.

### Decisions taken in this plan (say if any is wrong)

- Home becomes triage.
- Triage asks yes/no questions and "No" rules causes out.
- Static generation stays; only the PWA goes.
- The body schematic waits.

## Phase 13 (later): AI assist

**Status:** idea, not scheduled. Nothing here should change how the site works without it: the deterministic triage and search stay the source of truth, and AI only fills their inputs or explains their outputs.

**What it would do**
1. **Describe the patient in words.** "He's pale, throwing up, can barely breathe" → Claude maps it to finding ids from the triage index (seen and ruled out), and they land on the patient strip exactly as if tapped. The ranking, questions and treatment still come from `shared/utils/triage.ts`, so the answer is always the guide's, never invented. Works in English or Chinese.
2. **Ask the guide.** A question in the dock ("what do I do about a heart attack without a defibrillator?") → an answer grounded in the guide's entries, citing and linking the entries it used. Retrieval reuses the search index to pick the relevant entries; their text goes into the prompt.

**How**
- **Needs a server.** The site is static today. Add one server route per feature (`server/api/ai/*.post.ts`) and deploy on Vercel with Nitro's `vercel` preset for those routes, keeping every page prerendered (hybrid: route rules prerender pages, the AI routes run as functions). The API key lives only in Vercel's environment (`ANTHROPIC_API_KEY`), never in the client.
- **SDK.** Server-side, the official Anthropic TypeScript SDK (`@anthropic-ai/sdk`). It supports the features below directly. The Vercel AI SDK (`ai` + `@ai-sdk/anthropic`, with `@ai-sdk/vue` for streaming UI) is the alternative you suggested; decide when building, mainly on whether its streaming helpers are worth an extra layer.
- **Model.** `claude-opus-5-5` for both, with `output_config.effort` set per route: `low` for mapping (a short, structured task), `medium` for answering. A cheaper model (`claude-haiku-5-5`) is an option for mapping if cost matters; that's your call after seeing real usage.
- **Mapping uses structured outputs, not forced tool calls.** Forced `tool_choice` returns a 400 on current models. Instead, `output_config.format` with a JSON schema whose ids are an enum of the triage index's observable finding ids, split into `seen` and `ruledOut`. The response then can't contain an id that doesn't exist. Validate it again server-side anyway.
- **Answers stream** (`client.messages.stream`), so text appears as it's written, and cite entries as links.
- **Refusals.** Check `stop_reason` before reading output. Enable server-side refusal fallbacks (`fallbacks: "default"`, beta `server-side-fallback-2026-07-01`) so a declined request is retried on another model in the same call.
- **Caching.** The system prompt and the finding list are the same on every request; mark them with `cache_control` so repeat requests are cheaper.

**Risks and limits**
- **Cost and abuse with no accounts.** Anyone can hit an anonymous endpoint. Rate-limit per IP (Vercel KV or Upstash), cap input length and `max_tokens`, and add a daily spend ceiling that switches the feature off.
- **Not offline.** The rest of the site works from the CDN; AI needs a connection. Hide the AI entry points when offline or when the route errors.
- **Wrong mappings.** The medic sees every mapped finding on the strip before anything else happens and can remove it, so a bad mapping is visible, not silent.
- **Evaluation.** Before shipping, a small eval: ~50 written patient descriptions (both languages) with expected findings, scored for precision and recall of the mapped ids.

## Phase 8 (optional): Server features

Add these only if wanted. Content pages stay prerendered and search stays in the browser. None of them needs user accounts.

| Feature | What it gives | Needs |
|---|---|---|
| Shared crew triage board | Everyone on the sub opens the same room link and sees a live patient list. | WebSockets and a small key-value store (`@nuxthub/core`) |
| In-browser editing | Nuxt Studio's self-hosted editor, committing to GitHub. | A server route for GitHub OAuth |
| Trello sync | Scheduled re-import when the upstream guide changes. | A server task and a Trello API key |
| Error reports without GitHub | The report button files the issue for the reader. | One server route |

Moving from `nuxt generate` to a hybrid deployment is a config change, not a rewrite.

## Risks

- **Inconsistent card text.** The cards are only semi-structured. The unparsed report in Phase 2 is how the exceptions get caught.
- **Thresholds.** Values such as "达到40%及以上" sit in free text and are read by pattern matching, so they need a manual check.
- **Links to the original board.** Matched by name; 42 still point at cards that only exist there (mainly 伤口 Wounds and several pill cards).
- **Missing content.** The Eyes Expansion list is empty, and Cybernetics has no images.
- **Locale flash.** With no locale in URLs, `zh` readers briefly see English UI on a full page load (see "Localization"). By design since the hydration fix: the page hydrates in English, then switches (`app/plugins/locale.client.ts`). Removing the flash would need a prerendered Chinese copy of each page served by language at the edge.
