/** Entry types; each is a content folder, a route prefix, and one collection per locale. */
export const ENTRY_TYPES = ['afflictions', 'symptoms', 'items', 'procedures', 'info'] as const
export type EntryType = typeof ENTRY_TYPES[number]

export const CONTENT_LOCALES = ['en', 'zh'] as const
export type ContentLocale = typeof CONTENT_LOCALES[number]

/** The locale whose content is complete; other locales fall back to it. */
export const BASE_CONTENT_LOCALE: ContentLocale = 'en'

export function isEntryType(value: unknown): value is EntryType {
	return typeof value === 'string' && (ENTRY_TYPES as readonly string[]).includes(value)
}

/** Collection name for an entry type in a locale, e.g. `afflictions_zh`. */
export function entryCollection(type: EntryType, locale: ContentLocale) {
	return `${type}_${locale}` as const
}

/** Categories per type, in display order (the Trello board's list order). */
export const CATEGORIES = {
	afflictions: ['head', 'lungs', 'heart', 'torso', 'extremities', 'bones', 'any', 'blood', 'surgery', 'cybernetics', 'surgery-plus', 'eyes'],
	symptoms: ['symptom'],
	items: ['item', 'cybernetics', 'surgery-plus', 'eyes'],
	procedures: ['procedure'],
	info: ['general', 'expansions', 'expansion-guides'],
} as const satisfies Record<EntryType, readonly string[]>

/** Every category across types (afflictions also list categories as `alsoIn`). */
export const ALL_CATEGORIES = [...new Set(Object.values(CATEGORIES).flat())] as const

/** Where an entry comes from: the base mod, or an expansion mod. */
export const SOURCES = ['base', 'cybernetics', 'surgery-plus', 'eyes', 'expansions'] as const
export type Source = typeof SOURCES[number]

/** Tags from Trello labels, in the order badges are shown. */
export const TAGS = [
	'lethal', 'possibly-lethal', 'non-lethal',
	'essential', 'very-important', 'important', 'first-aid',
	'interface-visible', 'scanner-visible', 'analyzer-visible', 'not-visible',
	'mental-symptom', 'mechanic', 'surgery', 'niche',
	'cybernetics', 'surgery-plus',
	'known-issue', 'translator-note',
	'affliction', 'item', 'procedure', 'info', 'symptom', 'unfinished',
] as const
export type Tag = typeof TAGS[number]

/** Tags that only repeat the entry type or source, so they aren't shown as badges. */
export const HIDDEN_TAGS: readonly Tag[] = ['affliction', 'item', 'procedure', 'info', 'symptom', 'cybernetics', 'surgery-plus']

/** Structured sections, in the order a detail page shows them. Treatment comes first: it's what a medic needs. */
export const SECTION_KEYS = ['firstAid', 'treatment', 'steps', 'treats', 'onSuccess', 'onFailure', 'causes', 'causedBy', 'effects'] as const
export type SectionKey = typeof SECTION_KEYS[number]

export interface SectionItem {
	/** Markdown-ish text: plain text with `[label](/type/slug)` links and `**bold**`. */
	text: string
	/** Entries this item links to, as `type/slug`. */
	refs?: string[]
	/** "达到40%及以上" → 40: the strength at which this effect starts. */
	threshold?: number
	/** "-60% 伤口感染" → -60: how much an item adds or removes. */
	amount?: number
}
