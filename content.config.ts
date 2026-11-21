import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { CONTENT_LOCALES, entryCollection, ENTRY_TYPES } from './shared/utils/content'

/**
 * One collection per entry type and locale, following the Nuxt Content i18n
 * integration (https://content.nuxt.com/docs/integrations/i18n).
 *
 * `content/en/` holds the full guide as imported from Trello. Its bodies are
 * bilingual, so it is also what Chinese readers see by default. `content/zh/`
 * holds optional Chinese-only overrides at the same relative path; any entry
 * missing there falls back to `en` (see app/pages/[...slug].vue).
 *
 * Paths have no locale in them: content/en/afflictions/pneumothorax.md and
 * content/zh/afflictions/pneumothorax.md are both /afflictions/pneumothorax.
 * The i18n module adds the /zh prefix to the route.
 *
 * The schema is deliberately loose for now; Phase 3 tightens it per type.
 */

const sectionItem = z.object({
	text: z.string(),
	refs: z.array(z.string()).optional(),
	threshold: z.number().optional(),
	amount: z.number().optional(),
})
const section = z.array(sectionItem).optional()

const entrySchema = z.object({
	nameZh: z.string().optional(),
	nameEn: z.string().optional(),
	category: z.string(),
	alsoIn: z.array(z.string()).optional(),
	source: z.string(),
	order: z.number(),
	tags: z.array(z.string()).default([]),
	lethal: z.boolean().optional(),
	pinyin: z.string().optional(),
	pinyinInitials: z.string().optional(),
	aliases: z.array(z.string()).default([]),
	skill: z.object({
		medical: z.number().optional(),
		mechanical: z.number().optional(),
	}).optional(),
	causedBy: section,
	causes: section,
	treatment: section,
	firstAid: section,
	treats: section,
	onSuccess: section,
	onFailure: section,
	effects: section,
	steps: section,
	trello: z.object({
		shortLink: z.string(),
		url: z.string(),
	}).optional(),
})

const collections = Object.fromEntries(
	ENTRY_TYPES.flatMap(type => CONTENT_LOCALES.map(locale => [
		entryCollection(type, locale),
		defineCollection({
			type: 'page',
			source: {
				include: `${locale}/${type}/**`,
				prefix: `/${type}`,
			},
			schema: entrySchema,
		}),
	])),
)

export default defineContentConfig({ collections })
