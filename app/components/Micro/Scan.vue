<script setup lang="ts">
/**
 * One scan pass: a thin accent line with a fading trail sweeps across its
 * container once, as if the readout were just re-acquired. Re-runs whenever
 * `trigger` changes. Put it inside a `relative overflow-hidden` element.
 * Decoration only; with reduced motion it doesn't run.
 */
defineProps<{ trigger: unknown }>()
</script>

<template>
	<AnimatePresence>
		<Motion
			:key="String(trigger)"
			as="span"
			aria-hidden="true"
			class="scan pointer-events-none absolute inset-y-0 w-24"
			:initial="{ left: '-6rem', opacity: 1 }"
			:animate="{ left: '100%', opacity: [1, 1, 0] }"
			:transition="{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }"
		/>
	</AnimatePresence>
</template>

<style scoped>
.scan {
	background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--ui-primary) 18%, transparent) 85%, var(--ui-primary) 98%, transparent);
}

@media (prefers-reduced-motion: reduce) {
	.scan { display: none; }
}
</style>
