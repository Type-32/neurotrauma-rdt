/**
 * Imports the Trello board export into Nuxt Content markdown files.
 *
 * Usage:
 *   bun scripts/import-trello.ts [--in data/trello/board.json] [--out content/en]
 *                                [--report data/trello/import-report.md] [--force]
 *
 * --force regenerates every entry except files whose frontmatter has
 * `manual: true`: those are hand-edited and kept as they are.
 *
 * Get the input from the board menu: Print, export and share → Export as JSON.
 *
 * The board is a copy of the original guide, so links inside card descriptions
 * point at the original board's card IDs. Links are therefore resolved by the
 * card name in the URL slug, not by ID. Anything that cannot be resolved,
 * parsed or classified is listed in the report for fixing by hand.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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

/** Exact label name → tag. The board has Chinese and English versions of most labels. */
const LABEL_TAGS = new Map<string, string>([
	['苦痛 Affliction', 'affliction'], ['Affliction', 'affliction'],
	['物品', 'item'], ['Item', 'item'],
	['信息', 'info'], ['Information', 'info'],
	['程序', 'procedure'], ['流程', 'procedure'], ['Procedure', 'procedure'],
	['症状', 'symptom'],
	['精神症状 Mental Symptom', 'mental-symptom'],
	['致命', 'lethal'], ['Lethal', 'lethal'],
	['非致命', 'non-lethal'], ['Non-Lethal', 'non-lethal'],
	['可能致命', 'possibly-lethal'], ['Lethality Depends', 'possibly-lethal'],
	['健康扫描仪可见', 'scanner-visible'], ['Visible on Scanner', 'scanner-visible'],
	['健康界面可见', 'interface-visible'], ['Visible on Health Interface', 'interface-visible'],
	['血液分析仪可见', 'analyzer-visible'], ['Visible on Hematology Analyzer', 'analyzer-visible'],
	['游戏内不可见', 'not-visible'], ['Not Visible Ingame', 'not-visible'],
	['小众', 'niche'], ['Niche', 'niche'],
	['机制', 'mechanic'], ['Mechanic', 'mechanic'],
	['必需', 'essential'], ['Essential', 'essential'],
	['重要', 'important'], ['Important', 'important'],
	['非常重要', 'very-important'],
	['急救', 'first-aid'], ['First Aid', 'first-aid'],
	['外科手术', 'surgery'], ['Surgery', 'surgery'],
	['赛博肢体拓展', 'cybernetics'], ['Cybernetics Expansion', 'cybernetics'],
	['外科Plus拓展', 'surgery-plus'], ['Surgery Plus Expansion', 'surgery-plus'],
	['译者添加', 'translator-note'], ['译者补充', 'translator-note'],
	['已知问题', 'known-issue'],
	['疑问/未完成', 'unfinished'],
])

/** Tag → entry type, for lists that mix types. */
const TAG_TYPES: Array<[string, EntryType]> = [
	['item', 'items'],
	['procedure', 'procedures'],
	['symptom', 'symptoms'],
	['affliction', 'afflictions'],
	['info', 'info'],
]

type SectionKey = 'firstAid' | 'treats' | 'treatment' | 'onFailure' | 'onSuccess' | 'causedBy' | 'causes' | 'effects' | 'steps'

/** Heading text → structured field. Tested in order, so the narrower patterns come first. */
const SECTION_RULES: Array<[RegExp, SectionKey]> = [
	[/急救|first aid/i, 'firstAid'],
	[/用于治疗|^treats\b/i, 'treats'],
	[/治疗|treatment/i, 'treatment'],
	[/失败|failure/i, 'onFailure'],
	[/成功|success|^应用时$/i, 'onSuccess'],
	[/由.*(造成|导致|引起)|原因|病因|caused by/i, 'causedBy'],
	[/^导致|^causes|leads to/i, 'causes'],
	[/^效果|^effects/i, 'effects'],
	[/^步骤|^steps/i, 'steps'],
]

/** Skill requirements written as headings, e.g. "医疗水平需求：30" or "Mechanical skill requirement: 60". */
const SKILL_HEADINGS: Array<[RegExp, 'medical' | 'mechanical']> = [
	[/医疗水平(?:需求|要求)\s*[:：]?\s*(\d+|无)|medical skill (?:check|requirement)\s*[:：]?\s*(\d+|none)/i, 'medical'],
	[/机械水平(?:需求|要求)\s*[:：]?\s*(\d+|无)|mechanical skill (?:check|requirement)\s*[:：]?\s*(\d+|none)/i, 'mechanical'],
]

const ITEM_FIRST: EntryType[] = ['items', 'procedures', 'afflictions', 'symptoms', 'info']
const AFFLICTION_FIRST: EntryType[] = ['afflictions', 'symptoms', 'items', 'procedures', 'info']

/** In a section, which entry type a link most likely means when a name exists in several types. */
const SECTION_LINK_PREFERENCE: Record<SectionKey | 'body', EntryType[]> = {
	causes: ['symptoms', 'afflictions', 'items', 'procedures', 'info'],
	causedBy: AFFLICTION_FIRST,
	treatment: ITEM_FIRST,
	firstAid: ITEM_FIRST,
	steps: ITEM_FIRST,
	treats: AFFLICTION_FIRST,
	onSuccess: AFFLICTION_FIRST,
	onFailure: AFFLICTION_FIRST,
	effects: AFFLICTION_FIRST,
	body: AFFLICTION_FIRST,
}

// ---------------------------------------------------------------------------
// Text helpers

const CJK_CHAR = /[\u3000-\u303F\u3400-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]/
const HAN_CHARS = /\p{Script=Han}/gu

/**
 * English names for cards whose title is Chinese only, confirmed by the slugs
 * of links pointing at them from the original board.
 */
const ENGLISH_NAMES: Record<string, string> = {
	原版器官损伤: 'Vanilla Organ Damage',
	氰化物中毒: 'Cyanide Poisoning',
}

/**
 * "气胸 Pneumothorax" → { zh: "气胸", en: "Pneumothorax" }. Normally splits after
 * the last CJK character; "Multipurpose Scalpel 多功能手术刀" (English first,
 * Chinese last) splits before the first one instead.
 */
function splitName(name: string): { zh: string, en: string } {
	const trimmed = name.trim()
	let first = -1
	let last = -1
	for (let i = 0; i < trimmed.length; i++) {
		if (CJK_CHAR.test(trimmed[i]!)) {
			if (first === -1) first = i
			last = i
		}
	}
	if (last === -1) return { zh: '', en: trimmed }
	if (last === trimmed.length - 1 && first > 0 && /^[A-Za-z]/.test(trimmed)) {
		return { zh: trimmed.slice(first).trim(), en: trimmed.slice(0, first).trim() }
	}
	const zh = trimmed.slice(0, last + 1).trim()
	return { zh, en: trimmed.slice(last + 1).trim() || ENGLISH_NAMES[zh] || '' }
}

function slugifyLatin(text: string): string {
	return text.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function toPinyin(zh: string): { full: string, initials: string } {
	if (!zh) return { full: '', initials: '' }
	const full = pinyin(zh, { toneType: 'none', nonZh: 'consecutive' }).toLowerCase().replace(/[^a-z0-9]/g, '')
	const initials = pinyin(zh, { pattern: 'first', toneType: 'none', nonZh: 'removed' }).toLowerCase().replace(/[^a-z0-9]/g, '')
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
	/** Duplicate cards (same name, same or subset text) folded into this entry. */
	merged: Array<{ card: TrelloCard, category: string }>
}

interface SectionItem {
	text: string
	refs?: string[]
	/** "达到40%及以上" → 40: the strength at which this effect starts. */
	threshold?: number
	/** "-60% 伤口感染" → -60: how much an item adds or removes. */
	amount?: number
}

const report = {
	unknownLists: new Set<string>(),
	unknownLabels: new Set<string>(),
	typeGuessed: [] as string[],
	slugCollisions: [] as string[],
	duplicateNames: [] as string[],
	unresolvedLinks: [] as Array<{ from: string, url: string, label: string }>,
	brokenLinks: [] as Array<{ from: string, label: string, url: string }>,
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
			for (const { card } of entry.merged) this.byShortLink.set(card.shortLink, entry)
			push(this.byFull, trelloSlug(entry.card.name), entry)
			if (entry.en) push(this.byLatin, latinKey(entry.en), entry)
			if (entry.zh) push(this.byHan, hanKey(entry.zh), entry)
		}
	}

	/** Original-board short link → entry, learned from links that resolved unambiguously elsewhere. */
	private learned = new Map<string, Entry>()

	/** Cards matching a name: the full name first, then both scripts together, then either one. */
	private candidatesForName(name: string): Entry[] {
		const latin = latinKey(name.replace(HAN_CHARS, ' '))
		const han = hanKey(name)
		let candidates = this.byFull.get(trelloSlug(name)) ?? []
		if (!candidates.length && latin && han) {
			const hanSet = new Set(this.byHan.get(han) ?? [])
			candidates = (this.byLatin.get(latin) ?? []).filter(e => hanSet.has(e))
		}
		if (!candidates.length && latin) candidates = this.byLatin.get(latin) ?? []
		if (!candidates.length && han) candidates = this.byHan.get(han) ?? []
		return candidates
	}

	/** Candidates from the URL slug, falling back to the link text. */
	private candidatesForLink(rawSlug: string | undefined, label: string): Entry[] {
		if (rawSlug) {
			const fromSlug = this.candidatesForName(safeDecode(rawSlug).replace(/^\d+-/, ''))
			if (fromSlug.length) return fromSlug
		}
		const text = label.replace(/[*_`]/g, '').trim()
		if (!text || /^https?:\/\//.test(text)) return []
		return this.candidatesForName(text)
	}

	/**
	 * First pass over every description: when a link's slug or text names exactly
	 * one card, remember its short link, so bare links with the same ID resolve too.
	 */
	learn(cards: TrelloCard[]) {
		const votes = new Map<string, Map<Entry, number>>()
		for (const card of cards) {
			for (const [, label, url] of (card.desc ?? '').matchAll(MD_LINK)) {
				const match = url!.match(TRELLO_CARD_URL)
				if (!match || this.byShortLink.has(match[1]!)) continue
				const candidates = this.candidatesForLink(match[2], label!)
				if (candidates.length !== 1) continue
				const tally = votes.get(match[1]!) ?? new Map<Entry, number>()
				tally.set(candidates[0]!, (tally.get(candidates[0]!) ?? 0) + 1)
				votes.set(match[1]!, tally)
			}
		}
		for (const [shortLink, tally] of votes) {
			const [best] = [...tally].sort((a, b) => b[1] - a[1])
			this.learned.set(shortLink, best![0])
		}
	}

	/** The one card a name refers to, or null when it names none or several. */
	resolveName(name: string): Entry | null {
		const text = name.replace(/[*_`]/g, '').trim()
		if (!text) return null
		const candidates = this.candidatesForName(text)
		return candidates.length === 1 ? candidates[0]! : null
	}

	/** Short links still unknown after learning: the ones worth looking up on the original board. */
	unknownShortLinks(cards: TrelloCard[]): string[] {
		const unknown = new Set<string>()
		for (const card of cards) {
			for (const [, , url] of (card.desc ?? '').matchAll(MD_LINK)) {
				const id = url!.match(TRELLO_CARD_URL)?.[1]
				if (id && !this.byShortLink.has(id) && !this.learned.has(id)) unknown.add(id)
			}
		}
		return [...unknown]
	}

	/** Teaches short links whose names were looked up on the original board. */
	learnNames(names: Record<string, string>) {
		for (const [shortLink, name] of Object.entries(names)) {
			if (this.learned.has(shortLink)) continue
			const candidates = this.candidatesForName(name)
			if (candidates.length === 1) this.learned.set(shortLink, candidates[0]!)
		}
	}

	resolve(url: string, label: string, from: string, context: SectionKey | 'body'): Entry | null {
		const match = url.match(TRELLO_CARD_URL)
		if (!match) return null
		const [, shortLink, rawSlug] = match

		const known = this.byShortLink.get(shortLink!) ?? this.learned.get(shortLink!)
		if (known) return known

		const candidates = this.candidatesForLink(rawSlug, label)
		if (!candidates.length) {
			report.unresolvedLinks.push({ from, url, label })
			return null
		}
		if (candidates.length === 1) return candidates[0]!

		const preference = SECTION_LINK_PREFERENCE[context]
		const chosen = [...candidates].sort((a, b) => preference.indexOf(a.type) - preference.indexOf(b.type))[0]!
		report.ambiguousLinks.push({ from, url, chosen: entryRef(chosen), candidates: candidates.map(entryRef) })
		return chosen
	}
}

const TRELLO_CARD_URL = /trello\.com\/c\/([A-Za-z0-9]+)(?:\/([^\s)"?#]+))?/

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
			const target = index.resolve(url, label, from, context)
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
	// Links that are broken in Trello itself, with no address (e.g. `[血袋](%22%E2%80%8C%22 "‌")`):
	// link them by their text when it names one card, otherwise keep just the text.
	const repaired = out.replace(BROKEN_LINK, (_whole, label: string, url: string) => {
		const target = index.resolveName(label)
		if (target) {
			refs.push(entryRef(target))
			return `[${label}](/${entryRef(target)})`
		}
		report.brokenLinks.push({ from, label, url })
		return label
	})
	return { text: repaired, refs }
}

/** Markdown links whose target is neither an http(s) URL nor a site path. */
const BROKEN_LINK = /\[([^\]]*)\]\((?!https?:\/\/|\/)([^)]*)\)/g

/**
 * The text of a list-like line: "- x" bullets, "**1.** x" or "1. x" numbered
 * steps, and escaped signed lines like "\-60% x" (returned as "-60% x").
 */
function listItemText(line: string): string | null {
	const bullet = line.match(/^\s*[-*+]\s+(.*\S)\s*$/)
	if (bullet) return bullet[1]!
	const signed = line.match(/^\s*\\([-+])\s*(.*\S)\s*$/)
	if (signed) return `${signed[1]}${signed[2]}`
	const numbered = line.match(/^\s*\*{0,2}\d+\*{0,2}[.)、]\*{0,2}\s*(.*\S)\s*$/)
	if (numbered) return numbered[1]!
	return null
}

const THRESHOLD =/达到\s*(\d+(?:\.\d+)?)\s*%|(\d+(?:\.\d+)?)\s*%\s*(?:及以上|以上|\+|or more|and above)/i

/**
 * One pass over the description: rewrites links in every line (using the
 * enclosing section to break ties between same-named cards), and collects the
 * list items under recognised headings as structured fields.
 */
interface ProcessedDescription {
	body: string
	sections: Partial<Record<SectionKey, SectionItem[]>>
	skill: Partial<Record<'medical' | 'mechanical', number>>
}

function processDescription(desc: string, entry: Entry, index: LinkIndex): ProcessedDescription {
	const sections: Partial<Record<SectionKey, SectionItem[]>> = {}
	const skill: ProcessedDescription['skill'] = {}
	const out: string[] = []
	let current: SectionKey | null = null
	/** False when this heading repeats a section already collected (usually its English copy). */
	let collect = false

	for (const rawLine of desc.split(/\r?\n/)) {
		// Real headings, or short plain lines ending in a colon that name a known section ("应用成功时：").
		const pseudo = rawLine.match(/^\s*\**([^#\n*]{1,30}?)\**\s*[:：]\s*\**\s*$/)
		const heading = rawLine.match(/^#{1,6}\s*(.+?)\s*[:：]?\s*$/)
			?? (pseudo && SECTION_RULES.some(([pattern]) => pattern.test(pseudo[1]!.trim())) ? pseudo : null)
		if (heading) {
			const title = heading[1]!.replace(/\*+/g, '').trim()
			current = SECTION_RULES.find(([pattern]) => pattern.test(title))?.[1] ?? null
			// "效果/Effects" on an affliction describes what it causes.
			if (current === 'effects' && (entry.type === 'afflictions' || entry.type === 'symptoms')) current = 'causes'
			collect = current !== null && !sections[current]
			const seen = report.headings.get(title)
			if (seen) seen.count++
			else report.headings.set(title, { count: 1, mapped: current, example: entry.card.name })

			for (const [pattern, kind] of SKILL_HEADINGS) {
				const match = title.match(pattern)
				const value = match?.[1] ?? match?.[2]
				if (value && skill[kind] === undefined) skill[kind] = /^\d+$/.test(value) ? Number(value) : 0
			}
		}

		const { text: line, refs } = rewriteLinks(rawLine, entry.card.name, current ?? 'body', index)
		out.push(line)
		if (heading || !current || !collect) continue

		const text = listItemText(line)?.replace(/‌/g, '')
		if (!text) continue

		const parsed: SectionItem = { text }
		if (refs.length) parsed.refs = [...new Set(refs)]
		const amount = text.match(/^([+-]\d+(?:\.\d+)?)\s*%/)
		if (amount) parsed.amount = Number(amount[1])

		const threshold = text.match(THRESHOLD)
		if (threshold) parsed.threshold = Number(threshold[1] ?? threshold[2])
		else if (current === 'causes' && /%/.test(text)) report.unparsedThresholds.push({ from: entry.card.name, line: text })

		;(sections[current] ??= []).push(parsed)
	}
	return { body: out.join('\n').replace(/‌/g, '').trim(), sections, skill }
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
			const tag = LABEL_TAGS.get(label.name.trim())
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
			merged: [],
		})
	}

	const kept = mergeDuplicates(entries)

	// Slugs: English name, else pinyin, else the Trello short link. Unique per type directory.
	const used = new Map<EntryType, Set<string>>()
	for (const entry of kept) {
		const base = slugifyLatin(entry.en) || slugifyLatin(toPinyin(entry.zh).full) || `card-${entry.card.shortLink.toLowerCase()}`
		const taken = used.get(entry.type) ?? new Set<string>()
		used.set(entry.type, taken)
		let slug = base
		for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`
		if (slug !== base) report.slugCollisions.push(`${entry.card.name} → ${entry.type}/${slug} (${base} was taken)`)
		taken.add(slug)
		entry.slug = slug
	}

	return kept
}

const MERGE_PREFERENCE: EntryType[] = ['symptoms', 'afflictions', 'items', 'procedures', 'info']

function descLines(card: TrelloCard): Set<string> {
	return new Set((card.desc ?? '').split(/\r?\n/).map(l => l.trim()).filter(Boolean))
}

/**
 * Trello shows some cards on two lists (e.g. Nausea under Symptoms and Torso),
 * which the export has as two cards. Same-named cards whose text is identical,
 * or a subset of the other's, become one entry: the symptom copy if there is
 * one, keeping the longer text, with the other lists recorded as `alsoIn`.
 */
function mergeDuplicates(entries: Entry[]): Entry[] {
	const groups = new Map<string, Entry[]>()
	for (const entry of entries) push(groups, entry.card.name.trim(), entry)

	const dropped = new Set<Entry>()
	for (const [name, group] of groups) {
		if (group.length < 2) continue
		const sorted = [...group].sort((a, b) => MERGE_PREFERENCE.indexOf(a.type) - MERGE_PREFERENCE.indexOf(b.type))
		const keeper = sorted[0]!
		for (const other of sorted.slice(1)) {
			const a = descLines(keeper.card)
			const b = descLines(other.card)
			const subset = [...a].every(l => b.has(l)) || [...b].every(l => a.has(l))
			if (!subset) {
				report.duplicateNames.push(`${name}: ${entryListLabel(keeper)} and ${entryListLabel(other)} differ, kept both`)
				continue
			}
			if (b.size > a.size) keeper.card = { ...keeper.card, desc: other.card.desc }
			keeper.tags = [...new Set([...keeper.tags, ...other.tags])]
			keeper.merged.push({ card: other.card, category: other.category })
			dropped.add(other)
			report.duplicateNames.push(`${name}: merged ${entryListLabel(other)} into ${entryListLabel(keeper)}${a.size === b.size ? '' : ' (text differed; kept the longer one)'}`)
		}
	}
	return entries.filter(e => !dropped.has(e))
}

function entryListLabel(entry: Entry): string {
	return `${entry.type}/${entry.category}`
}

// ---------------------------------------------------------------------------
// Output

function renderEntry(entry: Entry, index: LinkIndex): string {
	const desc = entry.card.desc ?? ''
	const { body, sections, skill } = processDescription(desc, entry, index)

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
		alsoIn: entry.merged.length ? [...new Set(entry.merged.map(m => m.category))] : undefined,
		source: entry.source,
		order: entry.order,
		tags: entry.tags,
		lethal: entry.tags.includes('lethal') || undefined,
		pinyin: full || undefined,
		pinyinInitials: initials || undefined,
		aliases: [],
		skill: Object.keys(skill).length ? skill : undefined,
		...sections,
		trello: { shortLink: entry.card.shortLink, url: entry.card.url },
	}
	// Leave out fields with no value rather than writing them as empty.
	const defined = Object.fromEntries(Object.entries(frontmatter).filter(([, value]) => value !== undefined))

	return `---\n${stringify(defined, { lineWidth: 0 })}---\n\n${body}\n`
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
	section('Duplicate card names', report.duplicateNames)
	section('Slug collisions', report.slugCollisions)
	section('Unresolved links', report.unresolvedLinks.map(l => `**${l.from}**: "${l.label}" ${l.url}`))
	section('Links broken in Trello with no matching card (kept as plain text)', report.brokenLinks.map(l => `**${l.from}**: "${l.label}" ${l.url}`))
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

/**
 * Looks up card names on the original (public) board for short links this
 * board doesn't contain. Results are cached as short link → name only, so
 * re-runs work offline and no member data is stored.
 */
async function lookUpOriginalNames(shortLinks: string[], cacheFile: string, offline: boolean): Promise<Record<string, string>> {
	const cache: Record<string, string> = existsSync(cacheFile) ? JSON.parse(readFileSync(cacheFile, 'utf8')) : {}
	const missing = shortLinks.filter(id => !(id in cache))

	if (missing.length && !offline) {
		console.log(`Looking up ${missing.length} card names on the original board…`)
		for (const id of missing) {
			try {
				const response = await fetch(`https://trello.com/c/${id}.json`)
				cache[id] = response.ok ? String((await response.json() as { name?: string }).name ?? '') : ''
			}
			catch {
				continue // network error: leave uncached so a later run retries
			}
		}
		mkdirSync(dirname(cacheFile), { recursive: true })
		const sorted = Object.fromEntries(Object.entries(cache).sort(([a], [b]) => a.localeCompare(b)))
		writeFileSync(cacheFile, `${JSON.stringify(sorted, null, '\t')}\n`)
	}
	return Object.fromEntries(Object.entries(cache).filter(([, name]) => name))
}

// ---------------------------------------------------------------------------
// Main

async function main() {
	const { values } = parseArgs({
		options: {
			in: { type: 'string', default: 'data/trello/board.json' },
			out: { type: 'string', default: 'content/en' },
			report: { type: 'string', default: 'data/trello/import-report.md' },
			force: { type: 'boolean', default: false },
			cache: { type: 'string', default: 'data/trello/original-cards.json' },
			offline: { type: 'boolean', default: false },
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
	// Hand-edited entries (`manual: true` in frontmatter) are kept as they are.
	const manual = new Map<string, string>()
	for (const type of nonEmpty) {
		for (const name of readdirSync(join(values.out, type), { recursive: true, encoding: 'utf8' })) {
			if (!name.endsWith('.md')) continue
			const file = join(values.out, type, name)
			const text = readFileSync(file, 'utf8')
			// Only the frontmatter counts: the block between the first two --- lines.
			const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? ''
			if (/^manual:\s*true\s*$/m.test(frontmatter)) manual.set(file, text)
		}
	}
	// --force replaces the generated directories outright, so entries that no longer exist don't linger.
	for (const type of nonEmpty) rmSync(join(values.out, type), { recursive: true, force: true })

	const board = JSON.parse(readFileSync(values.in, 'utf8')) as TrelloBoard
	const entries = classify(board)
	const index = new LinkIndex(entries)
	const cards = entries.map(e => e.card)
	index.learn(cards)
	index.learnNames(await lookUpOriginalNames(index.unknownShortLinks(cards), values.cache, values.offline))

	for (const entry of entries) {
		const file = join(values.out, entry.type, `${entry.slug}.md`)
		mkdirSync(dirname(file), { recursive: true })
		writeFileSync(file, renderEntry(entry, index))
	}
	for (const [file, text] of manual) {
		mkdirSync(dirname(file), { recursive: true })
		writeFileSync(file, text)
	}
	if (manual.size) console.log(`Kept ${manual.size} hand-edited entries (manual: true).`)

	mkdirSync(dirname(values.report), { recursive: true })
	writeFileSync(values.report, renderReport(board, entries))

	console.log(`Wrote ${entries.length} entries to ${values.out}/ and the report to ${values.report}.`)
	console.log(`Unresolved links: ${report.unresolvedLinks.length}, ambiguous: ${report.ambiguousLinks.length}, afflictions without sections: ${report.noSections.length}.`)
}

await main()
