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
