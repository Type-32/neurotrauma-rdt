/**
 * Triage: from what the medic sees on the patient (symptoms and visible
 * afflictions), rank the conditions that would explain it, suggest what to
 * check next, and build one treatment plan for everything present. Findings
 * the medic checked and didn't see ("ruled out") count against the conditions
 * that would cause them.
 *
 * The data is the prerendered /triage-index.json (server/routes/triage-index.json.ts).
 * Everything here is pure, so scripts/test-triage.ts tests the same code the page runs.
 */

export type Visibility = 'interface' | 'scanner' | 'analyzer'

export interface TriageEntry {
	/** `afflictions/pneumothorax` or `symptoms/headache`. */
	id: string
	type: 'afflictions' | 'symptoms'
	nameZh: string
	nameEn?: string
	/** For the finding filter: full pinyin ("qixiong") and initials ("qx"). */
	pinyin?: string
	pinyinInitials?: string
	category: string
	order: number
	lethal?: 'lethal' | 'possibly-lethal'
	/** Where the game shows it; empty when it isn't visible. Symptoms are always shown. */
	visibleIn: Visibility[]
	/** Ids of the symptoms and afflictions this entry leads to. */
	causes: string[]
	firstAid: SectionItem[]
	treatment: SectionItem[]
}

export interface TriageIndex {
	entries: TriageEntry[]
	/** Names for every entry on the site (items, procedures…), so plans can name what they link to. */
	names: Record<string, { nameZh: string, nameEn?: string }>
}

/**
 * Treatment order from the guide's 治疗顺序 card (content/en/info/zhiliaoshunxu.md);
 * the number is the step on that card. Conditions the card doesn't mention
 * are placed by lethality: lethal ones after the card's urgent steps (3–9),
 * the rest after its last step.
 */
export const TREATMENT_ORDER: Record<string, number> = {
	'afflictions/arterial-bleeding': 3,
	'afflictions/bleeding': 4,
	'afflictions/blood-loss': 4,
	'afflictions/pneumothorax': 5,
	'afflictions/radiation-sickness': 6,
	'afflictions/sepsis': 6,
	'afflictions/neurotrauma': 6,
	'afflictions/cardiac-arrest': 7,
	'afflictions/respiratory-arrest': 7,
	'afflictions/aortic-rupture': 8,
	'afflictions/internal-bleeding': 8,
	'afflictions/fibrillation': 9,
	'afflictions/irregular-heartbeat': 9,
	'afflictions/cardiac-tamponade': 9,
	'afflictions/heart-attack': 9,
	'afflictions/hypoxemia': 9,
	'afflictions/lung-damage': 9,
	'afflictions/burns': 10,
	'afflictions/fractures': 11,
	'afflictions/spinal-cord-injury': 11,
	'afflictions/foreign-bodies': 12,
	'afflictions/internal-damage': 12,
	'afflictions/liver-damage': 13,
	'afflictions/kidney-damage': 13,
	'afflictions/heart-damage': 13,
	'afflictions/open-wounds': 14,
	'afflictions/dislocations': 15,
	'afflictions/acidosis': 16,
	'afflictions/alkalosis': 16,
	'afflictions/hypotension': 16,
	'afflictions/hypertension': 16,
}
const UNLISTED_LETHAL = 9.5
const UNLISTED_POSSIBLY_LETHAL = 9.6
const UNLISTED = 17
const SYMPTOM_RELIEF = 18

export function treatmentOrder(entry: TriageEntry): number {
	const listed = TREATMENT_ORDER[entry.id]
	if (listed !== undefined) return listed
	if (entry.type === 'symptoms') return SYMPTOM_RELIEF
	if (entry.lethal === 'lethal') return UNLISTED_LETHAL
	if (entry.lethal === 'possibly-lethal') return UNLISTED_POSSIBLY_LETHAL
	return UNLISTED
}

export interface Candidate {
	entry: TriageEntry
	/** Selected findings it explains. */
	explains: string[]
	/** Other findings it leads to that aren't selected or ruled out: what to look for to confirm it. */
	alsoLookFor: string[]
	/** Ruled-out findings it leads to. Not proof against it (many findings only show above a threshold), but evidence. */
	contradicts: string[]
	score: number
	/** Its share of the evidence among all candidates, 0–1, for the confidence bar. */
	share: number
}

export interface Suggestion {
	id: string
	/** How many of the leading candidates lead to it. */
	splits: number
	of: number
}

export interface PlanStep {
	entry: TriageEntry
	order: number
}

export interface TriageResult {
	/** Selected entries that are conditions to treat, in treatment order. */
	plan: PlanStep[]
	/** Selected findings no selected condition explains. */
	unexplained: string[]
	/** Conditions that would explain the unexplained findings, best first. */
	candidates: Candidate[]
	/** Findings to check next: the ones that best tell the leading candidates apart. */
	suggestions: Suggestion[]
	/** Items the plan's first aid and treatment link to, in plan order. */
	items: string[]
}

export function createTriage(index: TriageIndex) {
	const byId = new Map(index.entries.map(entry => [entry.id, entry]))
	const afflictionCount = index.entries.filter(entry => entry.type === 'afflictions').length

	/** finding id → ids of the afflictions that lead to it. */
	const causesOf = new Map<string, Set<string>>()
	for (const entry of index.entries) {
		if (entry.type !== 'afflictions') continue
		for (const target of entry.causes) {
			if (!causesOf.has(target)) causesOf.set(target, new Set())
			causesOf.get(target)!.add(entry.id)
		}
	}

	/** Rarer findings say more: headache (8 causes) counts less than jaundice (1). */
	function weight(finding: string): number {
		const causes = causesOf.get(finding)?.size ?? 0
		return Math.log(1 + afflictionCount / Math.max(1, causes))
	}

	/** Findings the medic can actually see and tap: every symptom, and afflictions visible in game. */
	function isObservable(id: string): boolean {
		const entry = byId.get(id)
		return !!entry && (entry.type === 'symptoms' || entry.visibleIn.length > 0)
	}

	function evaluate(selectedIds: Iterable<string>, ruledOutIds: Iterable<string> = []): TriageResult {
		const selected = new Set([...selectedIds].filter(id => byId.has(id)))
		const ruledOut = new Set([...ruledOutIds].filter(id => byId.has(id) && !selected.has(id)))

		const plan = [...selected]
			.map(id => byId.get(id)!)
			.filter(entry => entry.firstAid.length || entry.treatment.length)
			.map(entry => ({ entry, order: treatmentOrder(entry) }))
			.sort((a, b) => a.order - b.order || lethalRank(a.entry) - lethalRank(b.entry) || a.entry.order - b.entry.order)

		// A finding is explained when a selected affliction leads to it.
		const explainedBySelection = new Set<string>()
		for (const id of selected) {
			for (const target of byId.get(id)!.causes) explainedBySelection.add(target)
		}
		const unexplained = [...selected].filter(id => !explainedBySelection.has(id) && (causesOf.get(id)?.size ?? 0) > 0)

		const candidates: Candidate[] = []
		const candidateIds = new Set(unexplained.flatMap(id => [...causesOf.get(id) ?? []]))
		for (const id of candidateIds) {
			if (selected.has(id)) continue
			const entry = byId.get(id)!
			const explains = unexplained.filter(finding => entry.causes.includes(finding))
			const alsoLookFor = entry.causes.filter(finding => !selected.has(finding) && !ruledOut.has(finding) && isObservable(finding))
			const contradicts = entry.causes.filter(finding => ruledOut.has(finding))
			const score = explains.reduce((sum, finding) => sum + weight(finding), 0)
				- CONTRADICTION_WEIGHT * contradicts.reduce((sum, finding) => sum + weight(finding), 0)
			candidates.push({ entry, explains, alsoLookFor, contradicts, score, share: 0 })
		}
		candidates.sort((a, b) =>
			b.explains.length - a.explains.length
			|| a.contradicts.length - b.contradicts.length
			|| lethalRank(a.entry) - lethalRank(b.entry)
			|| b.score - a.score
			|| a.entry.order - b.entry.order)

		// Shares: positive evidence only, so a heavily contradicted candidate shows an almost empty bar.
		const positive = candidates.map(candidate => Math.max(MIN_SHARE_SCORE, candidate.score))
		const total = positive.reduce((sum, value) => sum + value, 0)
		candidates.forEach((candidate, i) => { candidate.share = total ? positive[i]! / total : 0 })

		return { plan, unexplained, candidates, suggestions: suggest(candidates), items: planItems(plan) }
	}

	/**
	 * What to check next. Among the leading candidates (those explaining the most
	 * findings, at most six), the best question is a finding that about half of
	 * them lead to: either answer rules out a share. With one candidate left,
	 * its other findings confirm it.
	 */
	function suggest(candidates: Candidate[]): Suggestion[] {
		if (!candidates.length) return []
		const best = candidates[0]!
		const leading = candidates
			.filter(candidate => candidate.explains.length === best.explains.length && candidate.contradicts.length === best.contradicts.length)
			.slice(0, 6)
		const counts = new Map<string, number>()
		for (const candidate of leading) {
			for (const finding of candidate.alsoLookFor) counts.set(finding, (counts.get(finding) ?? 0) + 1)
		}
		return [...counts]
			.map(([id, splits]) => ({ id, splits, of: leading.length, balance: leading.length === 1 ? 1 : Math.min(splits, leading.length - splits) }))
			.filter(suggestion => suggestion.balance > 0)
			.sort((a, b) => b.balance - a.balance || weight(b.id) - weight(a.id) || a.id.localeCompare(b.id))
			.slice(0, 4)
			.map(({ id, splits, of }) => ({ id, splits, of }))
	}

	function planItems(plan: PlanStep[]): string[] {
		const items: string[] = []
		for (const { entry } of plan) {
			for (const item of [...entry.firstAid, ...entry.treatment]) {
				for (const ref of item.refs ?? []) {
					if (ref.startsWith('items/') && !items.includes(ref)) items.push(ref)
				}
			}
		}
		return items
	}

	return { evaluate, entry: (id: string) => byId.get(id), isObservable, causesOf: (id: string) => [...causesOf.get(id) ?? []] }
}

/** How much a ruled-out finding counts against a candidate, relative to a present one counting for it. */
const CONTRADICTION_WEIGHT = 0.6
/** Floor for the share calculation, so every candidate keeps a sliver of bar. */
const MIN_SHARE_SCORE = 0.05

function lethalRank(entry: TriageEntry): number {
	return entry.lethal === 'lethal' ? 0 : entry.lethal === 'possibly-lethal' ? 1 : 2
}
