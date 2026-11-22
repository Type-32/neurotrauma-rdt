/**
 * Validates the content folder, since Nuxt Content does not reject files
 * that break their collection schema.
 *
 * Usage: bun scripts/check-content.ts
 *
 * Checks, for every markdown file under content/<locale>/<type>/:
 * - its frontmatter against the type's schema in content.config.ts;
 * - that every internal link (`](/type/slug)`) and every `refs` entry points
 *   at an entry that exists in the base locale;
 * - that every override in a non-base locale has a base entry at the same path.
 *
 * Exits with 1 when anything fails, so CI stops before building.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { parse } from 'yaml'
import { schemas } from '../content.schemas'
import { BASE_CONTENT_LOCALE, CONTENT_LOCALES, ENTRY_TYPES, isEntryType, REFERENCE_SECTIONS } from '../shared/utils/content'
import { TREATMENT_ORDER } from '../shared/utils/triage'

const ROOT = join(import.meta.dirname, '..', 'content')
const problems: string[] = []

function markdownFiles(dir: string): string[] {
	if (!existsSync(dir)) return []
	return readdirSync(dir, { recursive: true, encoding: 'utf8' })
		.filter(file => file.endsWith('.md'))
		.map(file => join(dir, file))
}

/** `type/slug` for every base entry: what links and refs may point at. */
const baseEntries = new Set(ENTRY_TYPES.flatMap(type =>
	markdownFiles(join(ROOT, BASE_CONTENT_LOCALE, type)).map(file =>
		`${type}/${relative(join(ROOT, BASE_CONTENT_LOCALE, type), file).replace(/\\/g, '/').replace(/\.md$/, '')}`)))

const INTERNAL_LINK = /\]\(\/([a-z]+\/[a-z0-9-]+)\/?\)/g

/** Symptom and affliction names (two characters or more), for spotting unlinked mentions. */
const clinicalNames: Array<[string, string]> = []
for (const type of ['afflictions', 'symptoms'] as const) {
	for (const file of markdownFiles(join(ROOT, BASE_CONTENT_LOCALE, type))) {
		const fm = parse(readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '') as { nameZh?: string, nameEn?: string } | null
		const id = `${type}/${relative(join(ROOT, BASE_CONTENT_LOCALE, type), file).replace(/\\/g, '/').replace(/\.md$/, '')}`
		for (const name of [fm?.nameZh, fm?.nameEn]) if (name && name.length >= 2) clinicalNames.push([name, id])
	}
}

/**
 * Warnings don't fail the check. A "leads to" line that names a symptom or
 * affliction without linking it is invisible to triage, so it's worth fixing.
 */
const warnings: string[] = []

let checked = 0
for (const locale of CONTENT_LOCALES) {
	for (const type of ENTRY_TYPES) {
		const dir = join(ROOT, locale, type)
		for (const file of markdownFiles(dir)) {
			checked++
			const name = relative(ROOT, file).replace(/\\/g, '/')
			const source = readFileSync(file, 'utf8')
			const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
			if (!match) {
				problems.push(`${name}: no frontmatter`)
				continue
			}

			let frontmatter: unknown
			try {
				frontmatter = parse(match[1]!)
			}
			catch (error) {
				problems.push(`${name}: frontmatter is not valid YAML (${(error as Error).message.split('\n')[0]})`)
				continue
			}

			const result = schemas[type].safeParse(frontmatter)
			if (!result.success) {
				for (const issue of result.error.issues) problems.push(`${name}: ${issue.path.join('.') || '(root)'}: ${issue.message}`)
			}

			// Unknown top-level keys would be silently dropped by the schema.
			const known = Object.keys(schemas[type].shape)
			for (const key of Object.keys(frontmatter as object ?? {})) {
				if (key !== 'title' && key !== 'description' && !known.includes(key)) problems.push(`${name}: unknown field "${key}"`)
			}

			const slug = relative(dir, file).replace(/\\/g, '/').replace(/\.md$/, '')
			if (locale !== BASE_CONTENT_LOCALE && !baseEntries.has(`${type}/${slug}`)) {
				problems.push(`${name}: override has no ${BASE_CONTENT_LOCALE} entry at ${type}/${slug}`)
			}

			const targets = new Set<string>()
			for (const [, target] of source.matchAll(INTERNAL_LINK)) targets.add(target!)
			const sections = frontmatter as Record<string, unknown>
			for (const value of Object.values(sections ?? {})) {
				if (!Array.isArray(value)) continue
				for (const item of value) {
					for (const ref of (item as { refs?: string[] })?.refs ?? []) targets.add(ref)
				}
			}
			for (const target of targets) {
				const [targetType] = target.split('/')
				if (!isEntryType(targetType) || !baseEntries.has(target)) problems.push(`${name}: link to missing entry /${target}`)
			}

			const self = `${type}/${slug}`
			for (const item of (sections?.causes as Array<{ text: string, refs?: string[] }> | undefined) ?? []) {
				// Only plain text counts: names inside existing links are already linked.
				const plain = item.text.replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
				const hits = clinicalNames.filter(([entryName, id]) => id !== self && plain.includes(entryName) && !(item.refs ?? []).includes(id))
				// "出血" inside "动脉出血" is the longer name, not a second mention.
				const mentioned = hits
					.filter(([entryName]) => !hits.some(([other]) => other !== entryName && other.includes(entryName)))
					.map(([, id]) => id)
				if (mentioned.length) warnings.push(`${name}: "leads to" line names ${[...new Set(mentioned)].join(', ')} without linking it: ${item.text}`)
			}
		}
	}
}

// Pages that name specific entries: the quick reference, and triage's treatment order.
for (const { path } of REFERENCE_SECTIONS) {
	if (!baseEntries.has(path.slice(1))) problems.push(`quick reference (shared/utils/content.ts) names missing entry ${path}`)
}
for (const id of Object.keys(TREATMENT_ORDER)) {
	if (!baseEntries.has(id)) problems.push(`treatment order (shared/utils/triage.ts) names missing entry /${id}`)
}

if (warnings.length) {
	console.warn(`${warnings.length} warning(s) (not failures):`)
	for (const warning of warnings) console.warn(`- ${warning}`)
	console.warn('')
}

if (problems.length) {
	console.error(`Content check failed: ${problems.length} problem(s) in ${checked} files.\n`)
	for (const problem of problems) console.error(`- ${problem}`)
	process.exit(1)
}
console.log(`Content check passed: ${checked} files, ${baseEntries.size} entries.`)
