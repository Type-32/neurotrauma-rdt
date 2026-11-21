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
- **Links to the original board.** Matched by name; 42 still point at cards that only exist there (mainly 伤口 Wounds and several pill cards).
- **Missing content.** The Eyes Expansion list is empty, and Cybernetics has no images.
- **Locale flash.** With no locale in URLs, `zh` readers briefly see English UI on a full page load (see "Localization").
