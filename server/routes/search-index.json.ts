import { queryCollection } from '@nuxt/content/server'

/**
 * The search index: every entry's names, pinyin and related names, built from
 * the base locale's collections. Prerendered to a static /search-index.json,
 * which the search palette downloads once and then searches in the browser.
 */
export default defineEventHandler(async (event): Promise<SearchRecord[]> => {
	const entries = (await Promise.all(ENTRY_TYPES.map(async type => {
		const rows = await queryCollection(event, entryCollection(type, BASE_CONTENT_LOCALE)).order('order', 'ASC').all()
		return rows.map(row => ({ type, row: row as unknown as IndexedEntry }))
	}))).flat()

	const nameByRef = new Map(entries.map(({ type, row }) => [`${type}/${row.path.split('/').pop()}`, row.nameEn || row.nameZh]))

	return entries.map(({ type, row }) => {
		const lethal = row.tags?.includes('lethal') ? 'lethal' : row.tags?.includes('possibly-lethal') ? 'possibly-lethal' : undefined
		const keywords = new Set<string>()
		for (const item of row.causes ?? []) {
			for (const ref of item.refs ?? []) {
				const name = nameByRef.get(ref)
				if (name) keywords.add(name)
			}
		}
		return {
			path: row.path,
			type,
			nameZh: row.nameZh,
			...(row.nameEn ? { nameEn: row.nameEn } : {}),
			aliases: row.aliases ?? [],
			...(row.pinyin ? { pinyin: row.pinyin } : {}),
			...(row.pinyinInitials ? { pinyinInitials: row.pinyinInitials } : {}),
			...(lethal ? { lethal } : {}),
			keywords: [...keywords],
		} satisfies SearchRecord
	})
})

interface IndexedEntry {
	path: string
	nameZh: string
	nameEn?: string
	aliases?: string[]
	pinyin?: string
	pinyinInitials?: string
	tags?: string[]
	causes?: SectionItem[]
}
