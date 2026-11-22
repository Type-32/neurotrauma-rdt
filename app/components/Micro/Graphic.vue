<script setup lang="ts">
/**
 * Inlines a micrographic from app/assets/micro/ (from the "Micrographics
 * Vol.1" pack). Graphics use currentColor, so colour them with a text-* class
 * and size them with size-*. Strokes stay a crisp hairline at any size.
 * Decorative: hidden from screen readers.
 *
 * `motion` picks one slow, looping animation; reduced motion stops it.
 */
const props = withDefaults(defineProps<{
	name: MicroGraphicName
	motion?: 'none' | 'spin' | 'spin-slow' | 'spin-reverse' | 'pulse'
}>(), { motion: 'none' })

const svg = computed(() => MICRO_GRAPHICS[props.name] ?? '')
</script>

<script lang="ts">
const files = import.meta.glob<string>('~/assets/micro/*.svg', { query: '?raw', import: 'default', eager: true })

const MICRO_GRAPHICS: Record<string, string> = Object.fromEntries(
	Object.entries(files).map(([path, raw]) => [path.split('/').pop()!.replace(/\.svg$/, ''), raw]),
)

export type MicroGraphicName = 'dot-ring' | 'target' | 'arcs' | 'burst' | 'forbidden'
</script>

<template>
	<!-- eslint-disable-next-line vue/no-v-html -- trusted local SVG files from the pack -->
	<span class="micro-graphic inline-block shrink-0" :class="motion !== 'none' && `mg-${motion}`" aria-hidden="true" v-html="svg" />
</template>

<style scoped>
.micro-graphic :deep(svg) {
	display: block;
	width: 100%;
	height: 100%;
	overflow: visible;
}
.micro-graphic :deep(svg *) {
	vector-effect: non-scaling-stroke;
	stroke-width: 1px;
}

.mg-spin { animation: mg-spin 6s linear infinite; }
.mg-spin-slow { animation: mg-spin 30s linear infinite; }
.mg-spin-reverse { animation: mg-spin 18s linear infinite reverse; }
.mg-pulse { animation: mg-pulse 2.4s ease-in-out infinite; }

@keyframes mg-spin {
	to { transform: rotate(360deg); }
}
@keyframes mg-pulse {
	0%, 100% { opacity: 0.45; }
	50% { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
	.mg-spin, .mg-spin-slow, .mg-spin-reverse, .mg-pulse { animation: none; }
}
</style>
