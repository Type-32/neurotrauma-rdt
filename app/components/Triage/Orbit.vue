<script setup lang="ts">
/**
 * The confidence display. One ring per remaining likely cause (up to seven);
 * rings drop away as answers rule causes out, and with one cause left it
 * settles to a single bright point. The leader's marker is the accent colour,
 * red when it is lethal. Decorative to screen readers: the count is in text.
 */
const props = defineProps<{
	count: number
	leaderLethal?: boolean
}>()

const MAX_RINGS = 7
const rings = computed(() => Array.from({ length: Math.min(props.count, MAX_RINGS) }, (_, i) => ({
	i,
	r: 16 + i * 6.5,
	// Golden-angle spacing keeps the markers from lining up.
	angle: (i * 137.5) % 360,
})))
const resolved = computed(() => props.count === 1)
const leaderColor = computed(() => props.leaderLethal ? 'var(--ui-error)' : 'var(--ui-primary)')
</script>

<template>
	<svg viewBox="0 0 120 120" class="overflow-visible" aria-hidden="true">
		<!-- Centre point: grows and brightens when one cause is left. -->
		<Motion
			as="circle"
			cx="60"
			cy="60"
			:animate="{ r: resolved ? 7 : 2.5 }"
			:transition="SPRING_SOFT"
			:fill="resolved ? leaderColor : 'var(--ui-text-dimmed)'"
		/>
		<Motion
			v-if="resolved"
			as="circle"
			cx="60"
			cy="60"
			r="7"
			fill="none"
			:stroke="leaderColor"
			:initial="{ scale: 1, opacity: 0.6 }"
			:animate="{ scale: 2.6, opacity: 0 }"
			:transition="{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }"
			style="transform-origin: 60px 60px"
		/>

		<g class="orbit-spin" style="transform-origin: 60px 60px">
			<AnimatePresence>
				<Motion
					v-for="ring in rings"
					:key="ring.i"
					as="g"
					:initial="{ opacity: 0, scale: 0.7 }"
					:animate="{ opacity: 1, scale: 1 }"
					:exit="{ opacity: 0, scale: 1.25 }"
					:transition="SPRING_SOFT"
					style="transform-origin: 60px 60px"
				>
					<circle cx="60" cy="60" :r="ring.r" fill="none" stroke="var(--micro-line)" stroke-dasharray="2 3" />
					<circle
						:cx="60 + ring.r * Math.cos(ring.angle * Math.PI / 180)"
						:cy="60 + ring.r * Math.sin(ring.angle * Math.PI / 180)"
						:r="ring.i === 0 ? 3 : 2"
						:fill="ring.i === 0 ? leaderColor : 'var(--ui-text-muted)'"
					/>
				</Motion>
			</AnimatePresence>
		</g>
	</svg>
</template>

<style scoped>
.orbit-spin {
	animation: orbit-spin 40s linear infinite;
}

@keyframes orbit-spin {
	to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
	.orbit-spin { animation: none; }
}
</style>
