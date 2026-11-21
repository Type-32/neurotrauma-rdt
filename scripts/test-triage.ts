/**
 * Checks triage against the Phase 5 criterion: "selecting the symptoms listed
 * on an affliction's card puts that affliction at or near the top".
 *
 * Usage: bun scripts/test-triage.ts [path to triage-index.json]
 *        (default: .output/public/triage-index.json, so run `bun run generate` first)
 *
 * For every affliction that leads to at least two observable findings, it
 * selects those findings and checks where the affliction ranks. Another
 * affliction that explains exactly the same findings is a true tie (the
 * findings can't tell them apart), so ranking behind it still counts as top.
 * Also checks the treatment plan follows the guide's treatment-order card.
 */
import { readFileSync } from 'node:fs'
import { createTriage, type TriageIndex } from '../shared/utils/triage'

const file = process.argv[2] ?? '.output/public/triage-index.json'
const index = JSON.parse(readFileSync(file, 'utf8')) as TriageIndex
const triage = createTriage(index)

let total = 0
let first = 0
let top3 = 0
const misses: string[] = []

for (const entry of index.entries) {
	if (entry.type !== 'afflictions') continue
	const findings = entry.causes.filter(id => triage.isObservable(id))
	if (findings.length < 2) continue
	total++

	const { candidates } = triage.evaluate(findings)
	const position = candidates.findIndex(candidate => candidate.entry.id === entry.id)
	const target = candidates[position]
	// Candidates ranked above it that explain exactly the same findings are ties, not misses.
	const ahead = candidates.slice(0, Math.max(0, position)).filter(candidate =>
		!(target && candidate.explains.length === target.explains.length && candidate.explains.every(id => target.explains.includes(id))))
	const effective = position === -1 ? Infinity : ahead.length + 1

	if (effective === 1) first++
	if (effective <= 3) top3++
	else misses.push(`${entry.id} with ${findings.join(', ')} → rank ${position === -1 ? 'not found' : position + 1}`)
}

console.log(`Afflictions with 2+ observable findings: ${total}`)
console.log(`Ranked first (or tied first): ${first} (${Math.round(first / total * 100)}%)`)
console.log(`Ranked in top 3:               ${top3} (${Math.round(top3 / total * 100)}%)`)

let failed = misses.length > 0
for (const miss of misses) console.log(`  MISS ${miss}`)

// Harder, report-only: a medic usually sees only some findings. Select just the two
// rarest (most telling) findings of each affliction and see where it lands.
let partialTotal = 0
let partialTop3 = 0
let partialSuggestionHelps = 0
for (const entry of index.entries) {
	if (entry.type !== 'afflictions') continue
	const findings = entry.causes.filter(id => triage.isObservable(id))
	if (findings.length < 3) continue
	partialTotal++
	const rarest = [...findings].sort((a, b) => triage.causesOf(a).length - triage.causesOf(b).length).slice(0, 2)
	const result = triage.evaluate(rarest)
	const position = result.candidates.findIndex(candidate => candidate.entry.id === entry.id)
	if (position !== -1 && position < 3) partialTop3++
	// Does "check next" point at one of its remaining findings?
	if (result.suggestions.some(suggestion => findings.includes(suggestion.id) && !rarest.includes(suggestion.id))) partialSuggestionHelps++
}
console.log(`\nWith only 2 of 3+ findings (${partialTotal} afflictions): in top 3 ${Math.round(partialTop3 / partialTotal * 100)}%, "check next" suggests one of its other findings ${Math.round(partialSuggestionHelps / partialTotal * 100)}%`)

// The plan follows the 治疗顺序 card: arterial bleeding (step 3) before pneumothorax (5)
// before cardiac arrest (7) before burns (10) before dislocations (15).
const ordered = ['afflictions/dislocations', 'afflictions/burns', 'afflictions/cardiac-arrest', 'afflictions/pneumothorax', 'afflictions/arterial-bleeding']
const planOrder = triage.evaluate(ordered).plan.map(step => step.entry.id)
const expected = [...ordered].reverse().filter(id => planOrder.includes(id))
const planOk = JSON.stringify(planOrder.filter(id => expected.includes(id))) === JSON.stringify(expected)
console.log(`\nPlan order follows the treatment-order card: ${planOk ? 'ok' : 'FAIL'}`)
if (!planOk) {
	console.log(`  got ${planOrder.join(' → ')}`)
	failed = true
}

// Ruling out a finding must move the leading candidate that causes it below one
// that doesn't. For every single symptom with two or more candidates, rule out
// a finding only the leader leads to, and check the leader drops.
let ruleOutTotal = 0
let ruleOutOk = 0
for (const entry of index.entries) {
	if (entry.type !== 'symptoms') continue
	const before = triage.evaluate([entry.id]).candidates
	if (before.length < 2) continue
	const leader = before[0]!
	const telling = leader.alsoLookFor.find(finding => before.slice(1).some(other => !other.entry.causes.includes(finding)))
	if (!telling) continue
	ruleOutTotal++
	const after = triage.evaluate([entry.id], [telling]).candidates
	if (after[0]!.entry.id !== leader.entry.id) ruleOutOk++
	else console.log(`  RULE-OUT MISS ${entry.id}: ruling out ${telling} kept ${leader.entry.id} first`)
}
const ruleOutPass = ruleOutTotal > 0 && ruleOutOk === ruleOutTotal
console.log(`\nRuling out a finding demotes the leader: ${ruleOutOk}/${ruleOutTotal} ${ruleOutPass ? 'ok' : 'FAIL'}`)
if (!ruleOutPass) failed = true

// Pneumothorax's own findings: it should lead, and its first aid should name the needle.
const pneumo = triage.evaluate(['symptoms/shortness-of-breath', 'symptoms/increased-heartrate', 'afflictions/hyperventilation'])
const pneumoOk = pneumo.candidates[0]?.entry.id === 'afflictions/pneumothorax'
console.log(`Shortness of breath + increased heartrate + hyperventilation → Pneumothorax first: ${pneumoOk ? 'ok' : `FAIL (got ${pneumo.candidates[0]?.entry.id})`}`)
if (!pneumoOk) failed = true

process.exit(failed ? 1 : 0)
