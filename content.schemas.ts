import { z } from '@nuxt/content'
import { CATEGORIES, type EntryType, SOURCES, TAGS } from './shared/utils/content'

/**
 * Frontmatter schema per entry type, used by content.config.ts for the
 * collections and by scripts/check-content.ts for validation. Nuxt Content
 * uses them for types only and does not reject invalid files, so
 * `bun run check:content` is what enforces them.
 */

const sectionItem = z.object({
	text: z.string(),
	refs: z.array(z.string().regex(/^[a-z]+\/[a-z0-9-]+$/)).optional(),
	threshold: z.number().optional(),
	amount: z.number().optional(),
})
const section = z.array(sectionItem).optional()

/** Fields every entry has, whatever its type. */
function baseSchema<T extends EntryType>(type: T) {
	return z.object({
		nameZh: z.string(),
		nameEn: z.string().optional(),
		category: z.enum(CATEGORIES[type] as unknown as [string, ...string[]]),
		alsoIn: z.array(z.string()).optional(),
		source: z.enum(SOURCES),
		order: z.number().int(),
		tags: z.array(z.enum(TAGS)).default([]),
		pinyin: z.string().optional(),
		pinyinInitials: z.string().optional(),
		aliases: z.array(z.string()).default([]),
		trello: z.object({
			shortLink: z.string(),
			url: z.string().url(),
		}).optional(),
	})
}

/** Structured sections per type: the ones the board's cards actually use. */
export const schemas = {
	afflictions: baseSchema('afflictions').extend({
		lethal: z.boolean().optional(),
		firstAid: section,
		treatment: section,
		causes: section,
		causedBy: section,
		onFailure: section,
	}),
	symptoms: baseSchema('symptoms').extend({
		treatment: section,
		causes: section,
		causedBy: section,
	}),
	items: baseSchema('items').extend({
		skill: z.object({
			medical: z.number().int().min(0).optional(),
			mechanical: z.number().int().min(0).optional(),
		}).optional(),
		firstAid: section,
		treatment: section,
		treats: section,
		onSuccess: section,
		onFailure: section,
	}),
	procedures: baseSchema('procedures').extend({
		steps: section,
	}),
	info: baseSchema('info').extend({
		treatment: section,
	}),
} satisfies Record<EntryType, z.ZodTypeAny>
