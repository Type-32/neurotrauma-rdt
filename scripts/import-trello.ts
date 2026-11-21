/**
 * Imports the Trello board export into Nuxt Content markdown files.
 *
 * Usage:
 *   bun scripts/import-trello.ts [--in data/trello/board.json] [--out content]
 *                                [--report data/trello/import-report.md] [--force]
 *
 * Get the input from the board menu: Print, export and share → Export as JSON.
 *
 * The board is a copy of the original guide, so links inside card descriptions
 * point at the original board's card IDs. Links are therefore resolved by the
 * card name in the URL slug, not by ID. Anything that cannot be resolved,
 * parsed or classified is listed in the report for fixing by hand.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { parseArgs } from 'node:util'
import { pinyin } from 'pinyin-pro'
import { stringify } from 'yaml'

// ---------------------------------------------------------------------------
// Trello export shape (only the fields used here)

interface TrelloLabel { id: string, name: string, color: string | null }
interface TrelloList { id: string, name: string, closed: boolean, pos: number }
interface TrelloAttachment { id: string, name: string, url: string, mimeType?: string | null, isUpload?: boolean }
interface TrelloCard {
	id: string
	name: string
	desc: string
	idList: string
	idLabels: string[]
	closed: boolean
	pos: number
	shortLink: string
	url: string
	attachments?: TrelloAttachment[]
}
interface TrelloBoard { name: string, lists: TrelloList[], labels: TrelloLabel[], cards: TrelloCard[] }

// ---------------------------------------------------------------------------
// Mapping rules

type EntryType = 'afflictions' | 'symptoms' | 'items' | 'procedures' | 'info'

interface ListRule {
	/** Substring of the list name. Rules are tried in order, so specific ones come first. */
	match: string
	/** `byLabel` means the list mixes types, and the card's labels decide. */
	type: EntryType | 'byLabel'
	category: string
	source: string
}

const LIST_RULES: ListRule[] = [
	{ match: 'Information', type: 'info', category: 'general', source: 'base' },
	{ match: 'Symptoms', type: 'symptoms', category: 'symptom', source: 'base' },
	{ match: 'Head/Brain', type: 'afflictions', category: 'head', source: 'base' },
	{ match: 'Lungs', type: 'afflictions', category: 'lungs', source: 'base' },
	{ match: 'Heart', type: 'afflictions', category: 'heart', source: 'base' },
	{ match: 'Torso', type: 'afflictions', category: 'torso', source: 'base' },
	{ match: 'Extremities', type: 'afflictions', category: 'extremities', source: 'base' },
	{ match: 'Bones', type: 'afflictions', category: 'bones', source: 'base' },
	{ match: 'Any bodypart', type: 'afflictions', category: 'any', source: 'base' },
	{ match: 'Blood', type: 'afflictions', category: 'blood', source: 'base' },
	{ match: 'Item', type: 'items', category: 'item', source: 'base' },
	{ match: 'Surgery Plus', type: 'byLabel', category: 'surgery-plus', source: 'surgery-plus' },
	{ match: 'Surgery', type: 'afflictions', category: 'surgery', source: 'base' },
	{ match: 'Procedures', type: 'procedures', category: 'procedure', source: 'base' },
	{ match: 'Cybernetics', type: 'byLabel', category: 'cybernetics', source: 'cybernetics' },
	{ match: 'Eyes Expansion', type: 'byLabel', category: 'eyes', source: 'eyes' },
	{ match: '各拓展的指南', type: 'info', category: 'expansion-guides', source: 'expansions' },
	{ match: 'Expansions', type: 'info', category: 'expansions', source: 'expansions' },
]

/** Label name substring → tag. */
const LABEL_TAGS: Array<[string, string]> = [
	['非致命', 'non-lethal'], // before 致命, which it contains
	['致命', 'lethal'],
	['健康扫描仪可见', 'scanner-visible'],
	['健康界面可见', 'interface-visible'],
	['血液分析仪可见', 'analyzer-visible'],
	['苦痛', 'affliction'],
	['症状', 'symptom'],
	['物品', 'item'],
	['流程', 'procedure'],
	['信息', 'info'],
	['小众', 'niche'],
	['机制', 'mechanic'],
]

/** Tag → entry type, for lists that mix types. */
const TAG_TYPES: Array<[string, EntryType]> = [
	['item', 'items'],
	['procedure', 'procedures'],
	['symptom', 'symptoms'],
	['affliction', 'afflictions'],
	['info', 'info'],
]

type SectionKey = 'firstAid' | 'treatment' | 'causedBy' | 'causes'

/** Heading text → structured field. firstAid is tested before treatment. */
const SECTION_RULES: Array<[RegExp, SectionKey]> = [
	[/急救|first aid/i, 'firstAid'],
	[/治疗|treatment/i, 'treatment'],
	[/由.*造成|原因|caused by/i, 'causedBy'],
	[/^导致|^causes|leads to/i, 'causes'],
]

/** In a section, which entry type a link most likely means when a name exists in several types. */
const SECTION_LINK_PREFERENCE: Record<SectionKey | 'body', EntryType[]> = {
	causes: ['symptoms', 'afflictions', 'items', 'procedures', 'info'],
	causedBy: ['afflictions', 'symptoms', 'items', 'procedures', 'info'],
	treatment: ['items', 'procedures', 'afflictions', 'symptoms', 'info'],
	firstAid: ['items', 'procedures', 'afflictions', 'symptoms', 'info'],
	body: ['afflictions', 'items', 'procedures', 'symptoms', 'info'],
}

// ---------------------------------------------------------------------------
// Text helpers

const CJK_CHAR = /[　-〿㐀-鿿豈-﫿＀-￯]/
const HAN_CHARS = /\p{Script=Han}/gu

/** "气胸 Pneumothorax" → { zh: "气胸", en: "Pneumothorax" }. Splits after the last CJK character. */
function splitName(name: string): { zh: string, en: string } {
	let last = -1
	for (let i = 0; i < name.length; i++) {
		if (CJK_CHAR.test(name[i]!)) last = i
	}
	if (last === -1) return { zh: '', en: name.trim() }
	return { zh: name.slice(0, last + 1).trim(), en: name.slice(last + 1).trim() }
}

function slugifyLatin(text: string): string {
	return text.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function toPinyin(zh: string): { full: string, initials: string } {
	if (!zh) return { full: '', initials: '' }
	const full = pinyin(zh, { toneType: 'none', nonZh: 'consecutive' }).replace(/\s+/g, '').toLowerCase()
	const initials = pinyin(zh, { pattern: 'first', toneType: 'none', nonZh: 'removed' }).replace(/\s+/g, '').toLowerCase()
	return { full, initials }
}

/** Approximates Trello's URL slug for a card name. */
function trelloSlug(text: string): string {
	return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '')
}

function latinKey(text: string): string {
	return (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).join('-')
}

function hanKey(text: string): string {
	return (text.match(HAN_CHARS) ?? []).join('')
}

function safeDecode(text: string): string {
	try {
		return decodeURIComponent(text)
	}
	catch {
		return text
	}
}

// ---------------------------------------------------------------------------
// Entries and link resolution

interface Entry {
	card: TrelloCard
	type: EntryType
	typeGuessed: boolean
	category: string
	source: string
	slug: string
	zh: string
	en: string
	tags: string[]
	order: number
}

interface SectionItem {
	text: string
	refs?: string[]
	threshold?: number
}

const report = {
	unknownLists: new Set<string>(),
	unknownLabels: new Set<string>(),
	typeGuessed: [] as string[],
	slugCollisions: [] as string[],
	unresolvedLinks: [] as Array<{ from: string, url: string }>,
	ambiguousLinks: [] as Array<{ from: string, url: string, chosen: string, candidates: string[] }>,
	headings: new Map<string, { count: number, mapped: SectionKey | null, example: string }>(),
	unparsedThresholds: [] as Array<{ from: string, line: string }>,
	noSections: [] as string[],
	images: [] as Array<{ from: string, url: string }>,
}

function entryRef(entry: Entry): string {
	return `${entry.type}/${entry.slug}`
}

function entryLabel(entry: Entry): string {
	return entry.card.name
}

class LinkIndex {
	private byShortLink = new Map<string, Entry>()
	private byFull = new Map<string, Entry[]>()
	private byLatin = new Map<string, Entry[]>()
	private byHan = new Map<string, Entry[]>()

	constructor(entries: Entry[]) {
		for (const entry of entries) {
			this.byShortLink.set(entry.card.shortLink, entry)
			push(this.byFull, trelloSlug(entry.card.name), entry)
			if (entry.en) push(this.byLatin, latinKey(entry.en), entry)
			if (entry.zh) push(this.byHan, hanKey(entry.zh), entry)
		}
	}

	resolve(url: string, from: string, context: SectionKey | 'body'): Entry | null {
		const match = url.match(/trello\.com\/c\/([A-Za-z0-9]+)(?:\/([^\s)"?#]+))?/)
		if (!match) return null
		const [, shortLink, rawSlug] = match

		const direct = this.byShortLink.get(shortLink!)
		if (direct) return direct

		if (!rawSlug) {
			report.unresolvedLinks.push({ from, url })
			return null
		}

		const decoded = safeDecode(rawSlug).replace(/^\d+-/, '')
		const latin = latinKey(decoded.replace(HAN_CHARS, ' '))
		const han = hanKey(decoded)

		let candidates = this.byFull.get(trelloSlug(decoded)) ?? []
		if (!candidates.length && latin && han) {
			const hanSet = new Set(this.byHan.get(han) ?? [])
			candidates = (this.byLatin.get(latin) ?? []).filter(e => hanSet.has(e))
		}
		if (!candidates.length && latin) candidates = this.byLatin.get(latin) ?? []
		if (!candidates.length && han) candidates = this.byHan.get(han) ?? []

		if (!candidates.length) {
			report.unresolvedLinks.push({ from, url })
			return null
		}
		if (candidates.length === 1) return candidates[0]!

		const preference = SECTION_LINK_PREFERENCE[context]
		const chosen = [...candidates].sort((a, b) => preference.indexOf(a.type) - preference.indexOf(b.type))[0]!
		report.ambiguousLinks.push({ from, url, chosen: entryRef(chosen), candidates: candidates.map(entryRef) })
		return chosen
	}
}

function push<K, V>(map: Map<K, V[]>, key: K, value: V) {
	if (!key) return
	const list = map.get(key)
	if (list) list.push(value)
	else map.set(key, [value])
}

// ---------------------------------------------------------------------------
// Description processing

const MD_LINK = /\[([^\]]*)\]\((https?:\/\/[^\s)]+)(?:\s+"[^"]*")?\)/g

/** Rewrites Trello card links to internal paths and tidies smart-card links. Returns refs found. */
function rewriteLinks(text: string, from: string, context: SectionKey | 'body', index: LinkIndex): { text: string, refs: string[] } {
	const refs: string[] = []
	const out = text.replace(MD_LINK, (_whole, label: string, url: string) => {
		const labelIsUrl = /^https?:\/\//.test(label.trim())
		if (/trello\.com\/c\//.test(url)) {
			const target = index.resolve(url, from, context)
			if (target) {
				refs.push(entryRef(target))
				return `[${labelIsUrl ? entryLabel(target) : label}](/${entryRef(target)})`
			}
			return `[${labelIsUrl ? url : label}](${url})`
		}
		// Other smart-card links (e.g. the Barotrauma wiki): show the page name instead of the URL.
		const pretty = labelIsUrl
			? safeDecode(url.replace(/[?#].*$/, '').split('/').filter(Boolean).pop() ?? url).replace(/_/g, ' ')
			: label
		return `[${pretty}](${url})`
	})
	return { text: out, refs }
}

const THRESHOLD = /达到\s*(\d+(?:\.\d+)?)\s*%|(\d+(?:\.\d+)?)\s*%\s*(?:及以上|以上|\+|or more|and above)/i

/**
 * One pass over the description: rewrites links in every line (using the
 * enclosing section to break ties between same-named cards), and collects the
 * list items under recognised headings as structured fields.
 */
function processDescription(desc: string, entry: Entry, index: LinkIndex): { body: string, sections: Partial<Record<SectionKey, SectionItem[]>> } {
	const sections: Partial<Record<SectionKey, SectionItem[]>> = {}
	const out: string[] = []
	let current: SectionKey | null = null

	for (const rawLine of desc.split(/\r?\n/)) {
		const heading = rawLine.match(/^#{1,6}\s*(.+?)\s*[:：]?\s*$/)
		if (heading) {
			const title = heading[1]!.replace(/\*+/g, '').trim()
			current = SECTION_RULES.find(([pattern]) => pattern.test(title))?.[1] ?? null
			const seen = report.headings.get(title)
			if (seen) seen.count++
			else report.headings.set(title, { count: 1, mapped: current, example: entry.card.name })
		}

		const { text: line, refs } = rewriteLinks(rawLine, entry.card.name, current ?? 'body', index)
		out.push(line)
		if (heading || !current) continue

		const item = line.match(/^\s*[-*+]\s+(.*\S)\s*$/)
		if (!item) continue

		const text = item[1]!.replace(/‌/g, '')
		const parsed: SectionItem = { text }
		if (refs.length) parsed.refs = [...new Set(refs)]

		const threshold = text.match(THRESHOLD)
		if (threshold) parsed.threshold = Number(threshold[1] ?? threshold[2])
		else if (current === 'causes' && /%/.test(text)) report.unparsedThresholds.push({ from: entry.card.name, line: text })

		;(sections[current] ??= []).push(parsed)
	}
	return { body: out.join('\n').replace(/‌/g, '').trim(), sections }
}

// ---------------------------------------------------------------------------
// Classification

function classify(board: TrelloBoard): Entry[] {
	const lists = new Map(board.lists.filter(l => !l.closed).map(l => [l.id, l]))
	const labels = new Map(board.labels.map(l => [l.id, l]))
	const entries: Entry[] = []
	const listOrder = new Map<string, number>()

	const cards = board.cards
		.filter(c => !c.closed && lists.has(c.idList))
		.sort((a, b) => lists.get(a.idList)!.pos - lists.get(b.idList)!.pos || a.pos - b.pos)

	for (const card of cards) {
		const list = lists.get(card.idList)!
		let rule = LIST_RULES.find(r => list.name.includes(r.match))
		if (!rule) {
			report.unknownLists.add(list.name)
			rule = { match: list.name, type: 'info', category: slugifyLatin(list.name) || 'other', source: 'base' }
		}

		const tags: string[] = []
		for (const labelId of card.idLabels) {
			const label = labels.get(labelId)
			if (!label?.name) continue
			const tag = LABEL_TAGS.find(([key]) => label.name.includes(key))?.[1]
			if (tag) tags.push(tag)
			else {
				report.unknownLabels.add(label.name)
				tags.push(slugifyLatin(label.name) || toPinyin(label.name).full)
			}
		}

		let type: EntryType
		let typeGuessed = false
		if (rule.type === 'byLabel') {
			const fromTag = TAG_TYPES.find(([tag]) => tags.includes(tag))?.[1]
			type = fromTag ?? 'afflictions'
			typeGuessed = !fromTag
			if (typeGuessed) report.typeGuessed.push(`${card.name} (list "${list.name}") → afflictions`)
		}
		else {
			type = rule.type
		}

		const order = listOrder.get(list.id) ?? 0
		listOrder.set(list.id, order + 1)

		const { zh, en } = splitName(card.name)
		entries.push({
			card,
			type,
			typeGuessed,
			category: rule.category,
			source: rule.source,
			slug: '',
			zh,
			en,
			tags: [...new Set(tags)],
			order,
		})
	}

	// Slugs: English name, else pinyin, else the Trello short link. Unique per type directory.
	const used = new Map<EntryType, Set<string>>()
	for (const entry of entries) {
		const base = slugifyLatin(entry.en) || slugifyLatin(toPinyin(entry.zh).full) || `card-${entry.card.shortLink.toLowerCase()}`
		const taken = used.get(entry.type) ?? new Set<string>()
		used.set(entry.type, taken)
		let slug = base
		for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`
		if (slug !== base) report.slugCollisions.push(`${entry.card.name} → ${entry.type}/${slug} (${base} was taken)`)
		taken.add(slug)
		entry.slug = slug
	}

	return entries
}

// ---------------------------------------------------------------------------
// Output

function renderEntry(entry: Entry, index: LinkIndex): string {
	const desc = entry.card.desc ?? ''
	const { body, sections } = processDescription(desc, entry, index)

	if (entry.type === 'afflictions' && !Object.keys(sections).length) report.noSections.push(entry.card.name)

	for (const image of desc.matchAll(/!\[[^\]]*\]\(([^\s)]+)/g)) report.images.push({ from: entry.card.name, url: image[1]! })
	for (const attachment of entry.card.attachments ?? []) {
		if (attachment.isUpload) report.images.push({ from: entry.card.name, url: attachment.url })
	}

	const { full, initials } = toPinyin(entry.zh)
	const frontmatter: Record<string, unknown> = {
		title: entry.card.name,
		nameZh: entry.zh || undefined,
		nameEn: entry.en || undefined,
		category: entry.category,
		source: entry.source,
		order: entry.order,
		tags: entry.tags,
		lethal: entry.tags.includes('lethal') || undefined,
		pinyin: full || undefined,
		pinyinInitials: initials || undefined,
		aliases: [],
		...sections,
		trello: { shortLink: entry.card.shortLink, url: entry.card.url },
	}
	for (const key of Object.keys(frontmatter)) {
		if (frontmatter[key] === undefined) delete frontmatter[key]
	}

	return `---\n${stringify(frontmatter, { lineWidth: 0 })}---\n\n${body}\n`
}

function renderReport(board: TrelloBoard, entries: Entry[]): string {
	const lines: string[] = []
	const section = (title: string, items: string[], empty = 'None.') => {
		lines.push(`## ${title} (${items.length})`, '')
		lines.push(...(items.length ? items.map(i => `- ${i}`) : [empty]), '')
	}

	lines.push(`# Trello import report`, '', `Board: ${board.name}. Generated ${new Date().toISOString()}.`, '')

	const counts = new Map<EntryType, number>()
	for (const e of entries) counts.set(e.type, (counts.get(e.type) ?? 0) + 1)
	lines.push('## Entries written', '', '| Type | Count |', '|---|---|')
	for (const [type, count] of counts) lines.push(`| ${type} | ${count} |`)
	lines.push(`| **total** | **${entries.length}** |`, '')

	section('Unknown lists (imported as info)', [...report.unknownLists])
	section('Unknown labels (tag guessed)', [...report.unknownLabels])
	section('Type guessed in mixed lists', report.typeGuessed)
	section('Slug collisions', report.slugCollisions)
	section('Unresolved links', report.unresolvedLinks.map(l => `**${l.from}**: ${l.url}`))
	section('Ambiguous links (first candidate chosen)', report.ambiguousLinks.map(l => `**${l.from}**: ${l.url} → \`${l.chosen}\` (candidates: ${l.candidates.join(', ')})`))
	section('Afflictions with no recognised sections', report.noSections)
	section('Thresholds not parsed in "causes"', report.unparsedThresholds.map(t => `**${t.from}**: ${t.line}`))
	section('Images and uploads (still hosted on Trello)', report.images.map(i => `**${i.from}**: ${i.url}`))

	lines.push('## Headings seen', '', '| Heading | Count | Mapped to | Example card |', '|---|---|---|---|')
	for (const [title, h] of [...report.headings].sort((a, b) => b[1].count - a[1].count)) {
		lines.push(`| ${title} | ${h.count} | ${h.mapped ?? '—'} | ${h.example} |`)
	}
	lines.push('')
	return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Main

function main() {
	const { values } = parseArgs({
		options: {
			in: { type: 'string', default: 'data/trello/board.json' },
			out: { type: 'string', default: 'content' },
			report: { type: 'string', default: 'data/trello/import-report.md' },
			force: { type: 'boolean', default: false },
		},
	})

	if (!existsSync(values.in)) {
		console.error(`Input not found: ${values.in}\nExport the board as JSON (Menu → Print, export and share → Export as JSON) and save it there.`)
		process.exit(1)
	}

	const types: EntryType[] = ['afflictions', 'symptoms', 'items', 'procedures', 'info']
	const nonEmpty = types.filter(t => existsSync(join(values.out, t)) && readdirSync(join(values.out, t)).length)
	if (nonEmpty.length && !values.force) {
		console.error(`Refusing to overwrite existing content in ${nonEmpty.map(t => join(values.out, t)).join(', ')}.\nHand edits would be lost. Re-run with --force to overwrite.`)
		process.exit(1)
	}

	const board = JSON.parse(readFileSync(values.in, 'utf8')) as TrelloBoard
	const entries = classify(board)
	const index = new LinkIndex(entries)

	for (const entry of entries) {
		const file = join(values.out, entry.type, `${entry.slug}.md`)
		mkdirSync(dirname(file), { recursive: true })
		writeFileSync(file, renderEntry(entry, index))
	}

	mkdirSync(dirname(values.report), { recursive: true })
	writeFileSync(values.report, renderReport(board, entries))

	console.log(`Wrote ${entries.length} entries to ${values.out}/ and the report to ${values.report}.`)
	console.log(`Unresolved links: ${report.unresolvedLinks.length}, ambiguous: ${report.ambiguousLinks.length}, afflictions without sections: ${report.noSections.length}.`)
}

main()
