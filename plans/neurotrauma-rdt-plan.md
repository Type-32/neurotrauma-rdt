# Neurotrauma RDT: site plan

A rapid diagnosis and treatment reference for the Neurotrauma mod for Barotrauma. It replaces the Trello board [Neurotrama Guide CN](https://trello.com/b/9lRwWGNP/neurotrama-guide-cn) for in-game use, where the board is too slow to consult during an emergency.

## Goals

- Find any affliction, item or procedure in a few keystrokes.
- Go from observed symptoms to a ranked list of likely afflictions.
- Show first aid and full treatment on one screen, without clicking through linked cards.
- Keep the content bilingual (Chinese and English) exactly as it is on the board. No translation work.

## Decisions made

| Decision | Choice |
|---|---|
| Users and login | None. The site is public and read-only. |
| Rendering | Static first: every route prerendered, built with `nuxt generate`. A server is added later only if a feature needs one (see Phase 8). |
| Content storage | Nuxt Content v3: markdown files with typed frontmatter, tracked in git. |
| Search | Fuse.js through Nuxt UI's `UCommandPalette`. Fuse is already installed as a dependency of `@nuxt/ui`. |
| Source of truth | The site, after a one-time Trello import. Re-importing would overwrite hand fixes. |
| Editing | Markdown edited in git (GitHub web editor or pull requests). Each push rebuilds the site. |

## Open questions

- **Shared crew triage board.** This is the one feature that needs a server (Phase 8). If it is wanted from day one, keep `@nuxthub/core` in Phase 1 instead of removing it.
- **Hosting.** Any static host works (GitHub Pages, Cloudflare Pages, Netlify, Vercel). Not chosen yet.
- **Meaning of "RDT".** This plan assumes "rapid diagnostic tool", which is the symptom checker in Phase 5.

## What the Trello board contains

- 18 lists, roughly 150 to 200 cards. The Symptoms and Item lists were cut off at 25 cards by the reading tool, so the real count is higher.
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

1. Export the full board as JSON (Trello's own export, or the API). The MCP reading tool caps lists at 25 cards, so it cannot be the source.
2. Write `scripts/import-trello.ts`. For each card it:
   - maps the list to a `category` and the labels to tags;
   - splits the description into Chinese and English halves;
   - parses the template headings into `causedBy`, `causes` (with thresholds), `treatment` and `firstAid`;
   - rewrites Trello card links to internal slugs, using a shortLink-to-slug map;
   - downloads attachments and images into `public/`.
3. Write the output to `content/{afflictions,symptoms,items,procedures,info}/*.md`: structured fields in the frontmatter, bilingual prose in the body.
4. Produce an "unparsed" report that lists every card that did not fit the template, every link that could not be resolved, and every threshold that could not be read.

**Done when:** every card on the board has a file, and the unparsed report has been worked through by hand.

## Phase 3: Content collections and detail pages

Define the collections in `content.config.ts` with zod schemas:

```ts
affliction: { id, nameZh, nameEn, aliases[], pinyin, category, source, lethal, scannerVisible,
              causedBy[], causes[{ id, threshold }], treatment[], firstAid[], items[] }
symptom:    { id, nameZh, nameEn, aliases[], pinyin }
item:       { id, nameZh, nameEn, aliases[], pinyin, source, effects[], duration, skill, treats[] }
procedure:  { id, nameZh, nameEn, source, steps[{ action, item, note }] }
info:       { id, title }
```

- `source` is the base mod or an expansion (Cybernetics, Surgery Plus, Eyes, Pharmacy, Infections), so expansion content can be filtered out.
- The symptom-to-affliction index is computed at build time from `causes`. It is not stored.
- One detail page per type, plus a category index page.

**Done when:** every imported entry renders at its own URL and internal links resolve.

## Phase 4: Search

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

## Phase 5: Symptom checker

- Select symptoms and Health Scanner readings as chips.
- Rank afflictions by how many selected symptoms they cause, weighting rare symptoms more than common ones.
- Pin lethal afflictions to the top and show which selected symptoms each match explains.
- This is a plain filter and score over the computed index, not fuzzy search.

**Done when:** selecting the symptoms listed on an affliction's card puts that affliction at or near the top.

## Phase 6: Treatment and procedure views

- **Treatment card:** first aid, then full treatment, then required items as chips, then a link to the procedure. Large text, dark mode, Chinese and English side by side or toggled.
- **Procedure checklists:** surgery steps as a tickable list, with a reminder to close the surgery, and Medical Misconduct warnings inline.
- **Patient scratchpad:** a list of patients, their afflictions and what has been done, stored in the browser's `localStorage`.
- **Quick reference pages:** treatment order (治疗顺序), medkit loadout (医疗箱建议), the five commandments, and the "Three H's" of diagnosis.
- **Report an error:** a link per entry that opens a pre-filled GitHub issue.

## Phase 7: Offline use

- Make the site a PWA so it can be installed and used offline on a second monitor or a phone.

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
- **Links to the old English board.** These cannot be mapped by shortLink and need matching by card name.
- **Missing content.** The Eyes Expansion list is empty, and Cybernetics has no images.
