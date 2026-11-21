/**
 * Content access with locale fallback, as in the Nuxt Content i18n docs:
 * read the current locale's collection, and fall back to the base locale for
 * anything it doesn't override.
 */

/** Fields every entry has, as used by pages and lists. Type-specific sections are optional. */
export interface Entry {
	path: string
	title: string
	nameZh: string
	nameEn?: string
	category: string
	alsoIn?: string[]
	source: Source
	order: number
	tags: Tag[]
	lethal?: boolean
	skill?: { medical?: number, mechanical?: number }
	body?: unknown
	[section: string]: unknown
}

/** The fields an index list needs, so lists don't load every entry's body. */
const LIST_FIELDS = ['path', 'title', 'nameZh', 'nameEn', 'category', 'order', 'tags', 'source'] as const
export type EntrySummary = Pick<Entry, typeof LIST_FIELDS[number]>

/**
 * Nuxt Content's SQLite store can hand `order` back as a string ("2"), which
 * breaks arithmetic ("2" + 1 = "21") and sorts as text ("10" before "2").
 * Every read goes through this so `order` is always a number.
 */
function withNumericOrder<T extends { order: unknown }>(entry: T): T & { order: number } {
	return { ...entry, order: Number(entry.order) }
}

/** One entry by path, from the locale's collection or the base locale's. */
export async function queryEntry(type: EntryType, path: string, locale: ContentLocale): Promise<Entry | null> {
	const localized = await queryCollection(entryCollection(type, locale)).path(path).first() as Entry | null
	const entry = localized || locale === BASE_CONTENT_LOCALE
		? localized
		: await queryCollection(entryCollection(type, BASE_CONTENT_LOCALE)).path(path).first() as Entry | null
	return entry ? withNumericOrder(entry) : null
}

/** Every entry of a type in board order: the base set, with the locale's overrides swapped in. */
export async function queryEntries(type: EntryType, locale: ContentLocale): Promise<EntrySummary[]> {
	// Sorted here rather than in SQL, where a text-typed `order` would sort "10" before "2".
	const base = (await queryCollection(entryCollection(type, BASE_CONTENT_LOCALE))
		.select(...LIST_FIELDS)
		.all() as EntrySummary[])
		.map(withNumericOrder)
		.sort((a, b) => a.order - b.order)
	if (locale === BASE_CONTENT_LOCALE) return base

	const overrides = (await queryCollection(entryCollection(type, locale)).select(...LIST_FIELDS).all() as EntrySummary[]).map(withNumericOrder)
	const byPath = new Map(overrides.map(entry => [entry.path, entry]))
	return base.map(entry => byPath.get(entry.path) ?? entry)
}

/**
 * The name to lead with and the one to show under it. Chinese readers see the
 * Chinese name first; English readers see the English one, when there is one.
 */
export function entryNames(entry: Pick<Entry, 'title' | 'nameZh' | 'nameEn'>, locale: string): { primary: string, secondary?: string } {
	const zh = entry.nameZh || entry.title
	const en = entry.nameEn
	if (!en) return { primary: zh }
	return locale === 'zh' ? { primary: zh, secondary: en } : { primary: en, secondary: zh }
}

/** Whether an entry should be flagged as dangerous. */
export function lethality(entry: Pick<Entry, 'tags'>): 'lethal' | 'possibly-lethal' | null {
	if (entry.tags.includes('lethal')) return 'lethal'
	if (entry.tags.includes('possibly-lethal')) return 'possibly-lethal'
	return null
}
