import { queryCollection } from '@nuxt/content/server'

/**
 * The triage index: afflictions and symptoms with what they lead to, where the
 * game shows them, and their first aid and treatment. Prerendered to a static
 * /triage-index.json for the triage page.
 *
 * "Leads to" links come from both directions of the guide: an affliction's
 * `causes` (A leads to X), a symptom's or affliction's `causedBy` (X is caused
 * by A, so A leads to X).
 */
export default defineEventHandler(async (event): Promise<TriageIndex> => {
	const load = async (type: EntryType) =>
		(await queryCollection(event, entryCollection(type, BASE_CONTENT_LOCALE)).order('order', 'ASC').all())
			.map(row => ({ type, row: row as unknown as Row }))

	const all = (await Promise.all(ENTRY_TYPES.map(load))).flat()
	const idOf = (type: EntryType, row: Row) => `${type}/${row.path.split('/').pop()}`

	const names: TriageIndex['names'] = {}
	for (const { type, row } of all) {
		names[idOf(type, row)] = { nameZh: row.nameZh, ...(row.nameEn ? { nameEn: row.nameEn } : {}) }
	}

	const clinical = all.filter(({ type }) => type === 'afflictions' || type === 'symptoms') as Array<{ type: 'afflictions' | 'symptoms', row: Row }>
	const isClinical = (ref: string) => ref.startsWith('afflictions/') || ref.startsWith('symptoms/')

	const causes = new Map<string, Set<string>>(clinical.map(({ type, row }) => [idOf(type, row), new Set()]))
	for (const { type, row } of clinical) {
		const id = idOf(type, row)
		for (const item of row.causes ?? []) {
			for (const ref of item.refs ?? []) if (isClinical(ref) && ref !== id) causes.get(id)!.add(ref)
		}
		for (const item of row.causedBy ?? []) {
			for (const ref of item.refs ?? []) {
				if (ref.startsWith('afflictions/') && ref !== id) causes.get(ref)?.add(id)
			}
		}
	}

	const entries: TriageEntry[] = clinical.map(({ type, row }) => {
		const id = idOf(type, row)
		const tags = row.tags ?? []
		const visibleIn: Visibility[] = []
		if (tags.includes('interface-visible')) visibleIn.push('interface')
		if (tags.includes('scanner-visible')) visibleIn.push('scanner')
		if (tags.includes('analyzer-visible')) visibleIn.push('analyzer')
		const lethal = tags.includes('lethal') ? 'lethal' : tags.includes('possibly-lethal') ? 'possibly-lethal' : undefined
		return {
			id,
			type,
			nameZh: row.nameZh,
			...(row.nameEn ? { nameEn: row.nameEn } : {}),
			...(row.pinyin ? { pinyin: row.pinyin } : {}),
			...(row.pinyinInitials ? { pinyinInitials: row.pinyinInitials } : {}),
			category: row.category,
			// The content store can return `order` as a string; triage sorts by it.
			order: Number(row.order),
			...(lethal ? { lethal } : {}),
			visibleIn,
			causes: [...causes.get(id)!],
			firstAid: row.firstAid ?? [],
			treatment: row.treatment ?? [],
		}
	})

	return { entries, names }
})

interface Row {
	path: string
	nameZh: string
	nameEn?: string
	pinyin?: string
	pinyinInitials?: string
	category: string
	order: number
	tags?: string[]
	causes?: SectionItem[]
	causedBy?: SectionItem[]
	firstAid?: SectionItem[]
	treatment?: SectionItem[]
}
