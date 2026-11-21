import Fuse, { type IFuseOptions } from 'fuse.js'

/**
 * One searchable entry. The index (`/search-index.json`) is a list of these,
 * built at build time by server/routes/search-index.json.ts.
 */
export interface SearchRecord {
	path: string
	type: EntryType
	category: string
	/** Board order within the category, for the code stamp ("LNG-04"). */
	order: number
	nameZh: string
	nameEn?: string
	aliases: string[]
	/** Full pinyin without spaces, e.g. "qixiong" for 气胸. */
	pinyin?: string
	/** Pinyin initials, e.g. "qx" for 气胸. */
	pinyinInitials?: string
	lethal?: 'lethal' | 'possibly-lethal'
	/** Names of the symptoms and afflictions this entry leads to, so "nausea" also finds what causes it. */
	keywords: string[]
}

/** Weights from the plan: names first, then aliases and pinyin, then related names. */
const FUSE_OPTIONS: IFuseOptions<SearchRecord> = {
	keys: [
		{ name: 'nameEn', weight: 3 },
		{ name: 'nameZh', weight: 3 },
		{ name: 'aliases', weight: 2 },
		{ name: 'pinyin', weight: 2 },
		{ name: 'pinyinInitials', weight: 2 },
		{ name: 'keywords', weight: 1 },
	],
	threshold: 0.3,
	ignoreLocation: true,
	includeScore: true,
}

function normalize(text: string | undefined): string {
	return (text ?? '').toLowerCase().replace(/[\s'’-]+/g, '')
}

/**
 * How directly a record matches, before fuzzy scoring:
 * 0 = exact name, alias, pinyin or initials;
 * 1 = a name or alias starts with the query ("pne" → Pneumothorax);
 * 2 = the pinyin or initials start with it ("qixi" → 气胸);
 * 3 = a word inside an English name starts with it ("arr" → Cardiac Arrest);
 * 4 = fuzzy only.
 * Names outrank pinyin, so "sho" finds Shortness of Breath before 手术 (shoushu).
 */
function directness(record: SearchRecord, query: string): number {
	const q = normalize(query)
	if (!q) return 4
	const names = [record.nameEn, record.nameZh, ...record.aliases].map(normalize).filter(Boolean)
	const pinyin = [record.pinyin, record.pinyinInitials].map(normalize).filter(Boolean)
	if (names.includes(q) || pinyin.includes(q)) return 0
	if (names.some(name => name.startsWith(q))) return 1
	if (pinyin.some(name => name.startsWith(q))) return 2
	const words = [record.nameEn, ...record.aliases].flatMap(name => (name ?? '').toLowerCase().split(/[^a-z0-9]+/))
	if (words.some(word => word.startsWith(q))) return 3
	return 4
}

export interface SearchResult {
	record: SearchRecord
	score: number
}

/** Builds a search function over the index. Results are best first. */
export function createSearch(records: SearchRecord[]) {
	const fuse = new Fuse(records, FUSE_OPTIONS)
	return (query: string, limit = 20): SearchResult[] => {
		const trimmed = query.trim()
		if (!trimmed) return []
		return fuse.search(trimmed)
			.map(result => ({ record: result.item, score: result.score ?? 1, tier: directness(result.item, trimmed) }))
			.sort((a, b) => a.tier - b.tier || a.score - b.score || a.record.path.localeCompare(b.record.path))
			.slice(0, limit)
			.map(({ record, score }) => ({ record, score }))
	}
}
