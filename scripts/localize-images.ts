/**
 * Downloads images the content still loads from Trello into public/img/entries/
 * and rewrites the links to the local copies, so pages don't depend on Trello
 * (or its signed, expiring file URLs).
 *
 * Usage: bun scripts/localize-images.ts [--dry]
 *
 * Safe to re-run, e.g. after `import:trello`: files already downloaded are
 * reused, and content with no Trello image links is left alone. Trello serves
 * attachments of public boards without signing in (a redirect to a signed
 * file URL), so no API key is needed.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = join(import.meta.dirname, '..')
const CONTENT = join(ROOT, 'content')
const OUT_DIR = join(ROOT, 'public', 'img', 'entries')
const PUBLIC_PATH = '/img/entries'
const DRY = process.argv.includes('--dry')

/** https://trello.com/1/cards/<card>/attachments/<attachment>/download/<file name> */
const IMAGE = /https:\/\/trello\.com\/1\/cards\/[0-9a-f]+\/attachments\/([0-9a-f]+)\/download\/([^\s)"\]]+)/g

/** A stable, URL-safe local name: the attachment id keeps names unique, the original name keeps them readable. */
function localName(attachment: string, fileName: string): string {
	const decoded = decodeURIComponent(fileName)
	const safe = decoded.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
	return `${attachment.slice(-8)}-${safe || 'image'}`
}

async function download(url: string, file: string) {
	const response = await fetch(url, { redirect: 'follow' })
	if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`)
	const type = response.headers.get('content-type') ?? ''
	if (!type.startsWith('image/')) throw new Error(`Not an image (${type}) at ${url}`)
	writeFileSync(file, new Uint8Array(await response.arrayBuffer()))
}

const files = readdirSync(CONTENT, { recursive: true, encoding: 'utf8' })
	.filter(name => name.endsWith('.md'))
	.map(name => join(CONTENT, name))

if (!DRY) mkdirSync(OUT_DIR, { recursive: true })

let downloaded = 0
let reused = 0
let rewritten = 0
const failures: string[] = []

for (const file of files) {
	const text = readFileSync(file, 'utf8')
	const matches = [...text.matchAll(IMAGE)]
	if (!matches.length) continue

	let next = text
	for (const match of matches) {
		const [url, attachment, fileName] = match as unknown as [string, string, string]
		const name = localName(attachment, fileName)
		const target = join(OUT_DIR, name)
		try {
			if (existsSync(target)) reused++
			else if (!DRY) {
				await download(url, target)
				downloaded++
			}
			next = next.replaceAll(url, `${PUBLIC_PATH}/${name}`)
		}
		catch (error) {
			failures.push(`${relative(ROOT, file)}: ${(error as Error).message}`)
		}
	}
	if (next !== text) {
		rewritten++
		if (!DRY) writeFileSync(file, next)
	}
}

console.log(`${DRY ? '[dry run] ' : ''}Downloaded ${downloaded}, reused ${reused}, rewrote ${rewritten} files.`)
for (const failure of failures) console.log(`  FAILED ${failure}`)
if (failures.length) process.exit(1)
