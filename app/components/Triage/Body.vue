<script setup lang="ts">
/**
 * The body map: a quick way to narrow the findings by where they are.
 * Tapping a region filters the finding words to that region; tapping it again
 * shows everything. The figure shows state too:
 * - filled: a region where the medic has picked findings;
 * - outlined: where the likely causes are, red or amber when one is lethal;
 * - accent: the region the list is filtered to.
 *
 * The figure is for pointing; the button list beside it carries the labels,
 * counts and keyboard access (the SVG is hidden from screen readers so each
 * region is announced once). Hovering either one highlights both.
 */
const props = defineProps<{
	/** Findings available in each region. */
	counts: Record<BodyRegion, number>
	/** Regions where findings are picked. */
	picked: BodyRegion[]
	/** Regions of the likely causes, with the most dangerous lethality there. */
	suspect: Partial<Record<BodyRegion, 'lethal' | 'possibly-lethal' | 'other'>>
}>()
const active = defineModel<BodyRegion | null>({ default: null })

const { t } = useI18n()
const hovered = ref<BodyRegion | null>(null)

function toggle(region: BodyRegion) {
	if (!props.counts[region]) return
	active.value = active.value === region ? null : region
}

const SUSPECT_STROKE = {
	'lethal': 'var(--ui-error)',
	'possibly-lethal': 'var(--ui-warning)',
	'other': 'var(--ui-text-muted)',
} as const

/** Fill and stroke for a region, from its state. */
function look(region: BodyRegion) {
	const isActive = active.value === region
	const isHovered = hovered.value === region
	const suspect = props.suspect[region]
	// The whole body is the outline around the figure: it shows state on its stroke only,
	// or its fill would hide the figure.
	const outlineOnly = region === 'body'
	return {
		fill: outlineOnly
			? 'transparent'
			: isActive
				? 'color-mix(in srgb, var(--ui-primary) 30%, transparent)'
				: props.picked.includes(region)
					? 'color-mix(in srgb, var(--ui-text-highlighted) 22%, transparent)'
					: isHovered
						? 'color-mix(in srgb, var(--ui-text-highlighted) 12%, transparent)'
						: 'color-mix(in srgb, var(--ui-text-highlighted) 4%, transparent)',
		stroke: isActive
			? 'var(--ui-primary)'
			: suspect
				? SUSPECT_STROKE[suspect]
				: outlineOnly && props.picked.includes(region)
					? 'var(--ui-text-muted)'
					: isHovered ? 'var(--ui-text-muted)' : 'var(--ui-text-dimmed)',
		strokeWidth: isActive || suspect ? 2.25 : 1.5,
		opacity: props.counts[region] ? 1 : 0.35,
	}
}

/** The list order, top to bottom of the body, whole body last. */
const ORDER: BodyRegion[] = ['head', 'lungs', 'heart', 'torso', 'extremities', 'bones', 'body']

function hover(region: BodyRegion | null) {
	hovered.value = region
}
</script>

<template>
	<div class="flex items-start gap-5">
		<!-- The figure: for pointing. The list carries the labels and keyboard access. -->
		<svg viewBox="0 0 200 380" class="w-28 shrink-0 sm:w-32" aria-hidden="true">
			<g class="body-regions" stroke-linejoin="round">
				<!-- Whole body: a dashed outline around the figure (wide invisible stroke to make it easy to hit). -->
				<g class="cursor-pointer" @click="toggle('body')" @mouseenter="hover('body')" @mouseleave="hover(null)">
					<rect x="6" y="4" width="188" height="372" rx="40" fill="none" stroke="transparent" stroke-width="14" />
					<rect
						x="6" y="4" width="188" height="372" rx="40"
						:fill="look('body').fill"
						:stroke="look('body').stroke"
						:stroke-width="look('body').strokeWidth"
						:opacity="look('body').opacity"
						stroke-dasharray="3 5"
						pointer-events="none"
					/>
				</g>

				<!-- Limbs -->
				<g class="cursor-pointer" :opacity="look('extremities').opacity" @click="toggle('extremities')" @mouseenter="hover('extremities')" @mouseleave="hover(null)">
					<rect v-for="limb in [{ x: 38, y: 80, w: 18, h: 116, r: 9 }, { x: 144, y: 80, w: 18, h: 116, r: 9 }, { x: 70, y: 208, w: 26, h: 152, r: 12 }, { x: 104, y: 208, w: 26, h: 152, r: 12 }]" :key="`${limb.x}-${limb.y}`" :x="limb.x" :y="limb.y" :width="limb.w" :height="limb.h" :rx="limb.r" :fill="look('extremities').fill" :stroke="look('extremities').stroke" :stroke-width="look('extremities').strokeWidth" />
				</g>

				<!-- Torso -->
				<g class="cursor-pointer" :opacity="look('torso').opacity" @click="toggle('torso')" @mouseenter="hover('torso')" @mouseleave="hover(null)">
					<rect x="62" y="74" width="76" height="132" rx="16" :fill="look('torso').fill" :stroke="look('torso').stroke" :stroke-width="look('torso').strokeWidth" />
				</g>

				<!-- Head and neck -->
				<g class="cursor-pointer" :opacity="look('head').opacity" @click="toggle('head')" @mouseenter="hover('head')" @mouseleave="hover(null)">
					<circle cx="100" cy="38" r="25" :fill="look('head').fill" :stroke="look('head').stroke" :stroke-width="look('head').strokeWidth" />
					<line x1="100" y1="63" x2="100" y2="74" :stroke="look('head').stroke" stroke-width="1.25" />
				</g>

				<!-- Lungs, inside the torso -->
				<g class="cursor-pointer" :opacity="look('lungs').opacity" @click.stop="toggle('lungs')" @mouseenter="hover('lungs')" @mouseleave="hover(null)">
					<ellipse cx="85" cy="110" rx="13" ry="24" :fill="look('lungs').fill" :stroke="look('lungs').stroke" :stroke-width="look('lungs').strokeWidth" />
					<ellipse cx="115" cy="110" rx="13" ry="24" :fill="look('lungs').fill" :stroke="look('lungs').stroke" :stroke-width="look('lungs').strokeWidth" />
				</g>

				<!-- Heart, over the lungs, on the body's left (the viewer's right) -->
				<g class="cursor-pointer" :opacity="look('heart').opacity" @click.stop="toggle('heart')" @mouseenter="hover('heart')" @mouseleave="hover(null)">
					<circle cx="106" cy="128" r="9" :fill="look('heart').fill === 'transparent' ? 'var(--ui-bg)' : look('heart').fill" :stroke="look('heart').stroke" :stroke-width="look('heart').strokeWidth" />
				</g>

				<!-- Bones: spine and long bones, drawn as a line overlay -->
				<g class="cursor-pointer" :opacity="look('bones').opacity" @click.stop="toggle('bones')" @mouseenter="hover('bones')" @mouseleave="hover(null)">
					<path d="M100 150 V200 M47 92 V184 M153 92 V184 M83 220 V348 M117 220 V348" fill="none" stroke="transparent" stroke-width="10" />
					<path
						d="M100 150 V200 M47 92 V184 M153 92 V184 M83 220 V348 M117 220 V348"
						fill="none"
						:stroke="active === 'bones' ? 'var(--ui-primary)' : look('bones').stroke"
						:stroke-width="active === 'bones' || hovered === 'bones' ? 3 : 1.5"
						stroke-dasharray="6 4"
						stroke-linecap="round"
					/>
				</g>
			</g>
		</svg>

		<!-- The list: labels, counts, keyboard access -->
		<ul class="min-w-0 flex-1 space-y-0.5">
			<li v-for="region in ORDER" :key="region">
				<button
					type="button"
					:aria-pressed="active === region"
					:disabled="!counts[region]"
					class="relative flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-start transition-colors disabled:opacity-40"
					:class="active === region ? 'text-highlighted' : 'text-muted hover:text-highlighted'"
					@click="toggle(region)"
					@mouseenter="hover(region)"
					@mouseleave="hover(null)"
					@focus="hover(region)"
					@blur="hover(null)"
				>
					<Motion v-if="active === region" layout-id="body-region" :transition="SPRING" class="absolute inset-0 rounded-md bg-accented" />
					<span
						class="relative size-2 shrink-0 rounded-full"
						:class="picked.includes(region) ? 'bg-inverted' : 'bg-transparent ring-1 ring-(--ui-border-accented)'"
						:style="suspect[region] ? { boxShadow: `0 0 0 2px ${SUSPECT_STROKE[suspect[region]!]}` } : undefined"
						aria-hidden="true"
					/>
					<span class="relative flex-1 truncate">{{ t(`triage.regions.${region}`) }}</span>
					<span class="relative font-mono text-xs text-dimmed">{{ counts[region] }}</span>
				</button>
			</li>
		</ul>
	</div>
</template>

<style scoped>
.body-regions :is(rect, circle, ellipse, line, path) {
	transition: fill 160ms ease, stroke 160ms ease, stroke-width 160ms ease;
}
</style>
