/**
 * Copies the micrographics this site uses from the "Micrographics Vol.1"
 * pack (Fox Rockett Studio) into app/assets/micro/, cleaned up for inlining:
 *
 * - each file's <style> block is inlined as attributes, so the pack's shared
 *   class names (.cls-1, .cls-2…) can't clash when several are on one page;
 * - black (#000) becomes currentColor, so graphics take the theme's colours;
 * - ids are prefixed per graphic, and fixed width/height removed (viewBox kept).
 *
 * Usage: bun scripts/import-micrographics.ts [--src "<pack folder>"]
 * The source defaults to MICRO_SRC, then the pack's usual download location.
 *
 * The pack is a paid asset. Check its license before committing the output
 * to a public repository.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { optimize } from 'svgo'

/** Name used in code → component number in "Components Library/SVG". */
const GRAPHICS: Record<string, number> = {
	'orbit': 130, // dashed orbit rings around a crosshair: triage idle / scanning
	'target': 124, // crosshair ring with arrows: triage likely causes
	'dot-ring': 147, // ring of dots: loading
	'burst': 12, // radial ticks: loading / scan
	'arcs': 14, // nested arcs with nodes: decoration
	'forbidden': 123, // no sign: no results
	'dither': 5, // pixel block: decoration
	'matrix': 88, // dot matrix with open cells: decoration
	'ruler': 84, // tick ruler: section rules
	'expand': 66, // four corner arrows: focus / frame
	'scan': 102, // half disc with rays: diagnose
	'link-arrow': 108, // arrow in a circle: links
}

const { values } = parseArgs({
	options: {
		src: { type: 'string', default: process.env.MICRO_SRC ?? join(homedir(), 'Documents', 'Micrographics Vol.1 - Fox Rockett Studio') },
		out: { type: 'string', default: 'app/assets/micro' },
	},
})

const componentDir = join(values.src!, 'Components Library', 'SVG')
mkdirSync(values.out!, { recursive: true })

for (const [name, number] of Object.entries(GRAPHICS)) {
	const source = readFileSync(join(componentDir, `Micrographics Vol.1 - Component ${number}.svg`), 'utf8')
	const { data } = optimize(source, {
		multipass: true,
		plugins: [
			{ name: 'preset-default', params: { overrides: { inlineStyles: { onlyMatchedOnce: false } } } },
			'convertStyleToAttrs',
			'removeDimensions',
			{ name: 'removeAttrs', params: { attrs: ['data-name', 'class'] } },
			{ name: 'prefixIds', params: { prefix: `micro-${name}` } },
		],
	})
	const themed = data
		.replace(/(fill|stroke)="(#000|#000000|black)"/gi, '$1="currentColor"')
		.replace(/(fill|stroke):\s*(#000|#000000|black)/gi, '$1:currentColor')
		// Shapes with no fill default to black; a root fill makes them inherit currentColor instead.
		.replace(/^<svg(?![^>]*\sfill=)/, '<svg fill="currentColor"')
	writeFileSync(join(values.out!, `${name}.svg`), `${themed}\n`)
	console.log(`${name}.svg  ← Component ${number}  (${themed.length} bytes)`)
}
