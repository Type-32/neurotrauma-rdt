/**
 * Checks search quality against the built index, for the Phase 4 criterion:
 * "typing three characters in English, Chinese or pinyin and pressing Enter
 * lands on the right entry".
 *
 * Usage: bun scripts/test-search.ts [path to search-index.json]
 *        (default: .output/public/search-index.json, so run `bun run generate` first)
 *
 * For every entry it searches the first three letters of the English name,
 * the Chinese name, the full pinyin and the pinyin initials, and reports how
 * often the entry comes first (Enter lands on it) or in the top three.
 *
 * Three letters can't always pick one entry ("car" is the start of Cardiac
 * Arrest and Cardiac Tamponade), so first place isn't expected everywhere.
 * The script fails only when an entry isn't in the top three for its own
 * Chinese name, full pinyin or initials, which should always be distinctive,
 * or when a curated case fails.
 */
import { readFileSync } from 'node:fs'
import { createSearch, type SearchRecord } from '../shared/utils/search'

const file = process.argv[2] ?? '.output/public/search-index.json'
const records = JSON.parse(readFileSync(file, 'utf8')) as SearchRecord[]
const search = createSearch(records)

function rank(query: string, path: string): number {
	const index = search(query).findIndex(result => result.record.path === path)
	return index === -1 ? Infinity : index + 1
}

type Kind = 'english (3 letters)' | 'chinese name' | 'full pinyin' | 'pinyin initials'
const stats = new Map<Kind, { total: number, first: number, top3: number, misses: string[] }>()
const strictKinds: Kind[] = ['chinese name', 'full pinyin']

function check(kind: Kind, query: string, record: SearchRecord) {
	const stat = stats.get(kind) ?? { total: 0, first: 0, top3: 0, misses: [] }
	stats.set(kind, stat)
	const position = rank(query, record.path)
	stat.total++
	if (position === 1) stat.first++
	if (position <= 3) stat.top3++
	else stat.misses.push(`"${query}" → ${record.path} (rank ${position === Infinity ? 'not found' : position})`)
}

for (const record of records) {
	if (record.nameEn && /^[a-z]/i.test(record.nameEn)) check('english (3 letters)', record.nameEn.slice(0, 3), record)
	if (record.nameZh) check('chinese name', record.nameZh, record)
	if (record.pinyin) check('full pinyin', record.pinyin, record)
	if (record.pinyinInitials && record.pinyinInitials.length >= 2) check('pinyin initials', record.pinyinInitials, record)
}

/**
 * Queries a medic would actually type, with the entry Enter should open.
 * An optional third value allows a lower rank where the query is a genuine tie.
 */
const CURATED: Array<[string, string, number?]> = [
	['pne', '/afflictions/pneumothorax'],
	['气胸', '/afflictions/pneumothorax'],
	['qx', '/afflictions/pneumothorax'],
	['qixiong', '/afflictions/pneumothorax'],
	['adr', '/items/adrenaline'],
	['肾上腺', '/items/adrenaline'],
	['fib', '/afflictions/fibrillation'],
	['心颤', '/afflictions/fibrillation'],
	['aed', '/items/aed'],
	['naus', '/symptoms/nausea'],
	['恶心', '/symptoms/nausea'],
	// "Bandaged" (the affliction) and "Bandages" (the item) are equally good matches.
	['band', '/items/bandages', 2],
	['bandages', '/items/bandages'],
	['sho', '/symptoms/shortness-of-breath'],
	['shortness', '/symptoms/shortness-of-breath'],
	['blood pack', '/items/blood-packs'],
	['cardiac arr', '/afflictions/cardiac-arrest'],
	['drunk', '/afflictions/drunk'],
	['jjzd', '/afflictions/drunk'],
	['sepsis', '/afflictions/sepsis'],
	['pneumo', '/afflictions/pneumothorax'],
]

let failed = false
console.log(`Index: ${records.length} entries\n`)
for (const [kind, stat] of stats) {
	const pct = (n: number) => `${Math.round(n / stat.total * 100)}%`
	console.log(`${kind.padEnd(20)} first ${pct(stat.first).padStart(4)}   top 3 ${pct(stat.top3).padStart(4)}   (${stat.total} queries)`)
	if (strictKinds.includes(kind) && stat.misses.length) failed = true
}

console.log('\nCurated queries:')
for (const [query, path, allowed = 1] of CURATED) {
	const position = rank(query, path)
	const ok = position <= allowed
	if (!ok) failed = true
	console.log(`  ${ok ? 'ok  ' : 'FAIL'} "${query}" → ${path}${ok ? '' : ` (rank ${position})`}`)
}

for (const [kind, stat] of stats) {
	if (!stat.misses.length) continue
	console.log(`\nNot in top 3 for ${kind} (${stat.misses.length}):`)
	for (const miss of stat.misses.slice(0, 15)) console.log(`  ${miss}`)
	if (stat.misses.length > 15) console.log(`  … and ${stat.misses.length - 15} more`)
}

process.exit(failed ? 1 : 0)
