<script setup lang="ts">
/**
 * Inlines a micrographic from app/assets/micro/ (imported from the
 * "Micrographics Vol.1" pack by scripts/import-micrographics.ts). Graphics use
 * currentColor, so set the colour with a text-* class; size with size-* / w-*.
 * Decorative: hidden from screen readers.
 */
const props = withDefaults(defineProps<{
	name: MicroGraphicName
	/** Slow continuous rotation, e.g. for idle and loading states. Off with reduced motion. */
	spin?: boolean
}>(), { spin: false })

const svg = computed(() => MICRO_GRAPHICS[props.name] ?? '')
</script>

<script lang="ts">
const files = import.meta.glob<string>('~/assets/micro/*.svg', { query: '?raw', import: 'default', eager: true })

const MICRO_GRAPHICS: Record<string, string> = Object.fromEntries(
	Object.entries(files).map(([path, raw]) => [path.split('/').pop()!.replace(/\.svg$/, ''), raw]),
)

export type MicroGraphicName =
	| 'orbit' | 'target' | 'dot-ring' | 'burst' | 'arcs' | 'forbidden'
	| 'dither' | 'matrix' | 'ruler' | 'expand' | 'scan' | 'link-arrow'
</script>

<template>
	<!-- eslint-disable-next-line vue/no-v-html -- trusted local SVG files, cleaned by scripts/import-micrographics.ts -->
	<span class="micro-graphic inline-block shrink-0" :class="{ 'micro-spin': spin }" aria-hidden="true" v-html="svg" />
</template>

<style scoped>
.micro-graphic :deep(svg) {
	display: block;
	width: 100%;
	height: 100%;
}

.micro-spin {
	animation: micro-spin 24s linear infinite;
}

@keyframes micro-spin {
	to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
	.micro-spin { animation: none; }
}
</style>
