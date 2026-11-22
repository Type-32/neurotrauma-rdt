import { defineCollection, defineContentConfig } from '@nuxt/content'
import { schemas } from './content.schemas'
import { CONTENT_LOCALES, entryCollection, ENTRY_TYPES } from './shared/utils/content'

/**
 * One collection per entry type and locale, following the Nuxt Content i18n
 * integration (https://content.nuxt.com/docs/integrations/i18n).
 *
 * `content/en/` holds the full guide as imported from Trello. Its bodies are
 * bilingual, so it is also what Chinese readers see by default. `content/zh/`
 * holds optional Chinese-only overrides at the same relative path; any entry
 * missing there falls back to `en` (see app/utils/entries.ts).
 *
 * Paths have no locale in them: content/en/afflictions/pneumothorax.md and
 * content/zh/afflictions/pneumothorax.md are both /afflictions/pneumothorax.
 *
 * Schemas are in content.schemas.ts. Nuxt Content doesn't enforce them, so
 * `bun run check:content` validates every file.
 */
const collections = Object.fromEntries(
	ENTRY_TYPES.flatMap(type => CONTENT_LOCALES.map(locale => [
		entryCollection(type, locale),
		defineCollection({
			type: 'page',
			source: {
				include: `${locale}/${type}/**`,
				prefix: `/${type}`,
			},
			schema: schemas[type],
		}),
	])),
)

export default defineContentConfig({ collections })
