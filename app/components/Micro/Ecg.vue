<script setup lang="ts">
/**
 * A small heartbeat trace: a faint ECG line with a bright pulse running along
 * it, looping slowly. Decoration only (hidden from screen readers); with
 * reduced motion the pulse stops and the line stays.
 */
</script>

<template>
	<svg viewBox="0 0 64 16" class="ecg" aria-hidden="true">
		<path
			class="ecg-line"
			d="M0 9 H20 L23 9 L25.5 2.5 L28.5 14 L31 9 H38 L40 7 L42 9 H64"
			pathLength="100"
			fill="none"
			stroke="currentColor"
			stroke-width="1.25"
			stroke-linejoin="round"
			stroke-linecap="round"
		/>
		<path
			class="ecg-pulse"
			d="M0 9 H20 L23 9 L25.5 2.5 L28.5 14 L31 9 H38 L40 7 L42 9 H64"
			pathLength="100"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linejoin="round"
			stroke-linecap="round"
		/>
	</svg>
</template>

<style scoped>
.ecg-line {
	opacity: 0.22;
}

.ecg-pulse {
	stroke-dasharray: 22 78;
	animation: ecg-run 2.6s linear infinite;
}

@keyframes ecg-run {
	from { stroke-dashoffset: 100; }
	to { stroke-dashoffset: 0; }
}

@media (prefers-reduced-motion: reduce) {
	.ecg-pulse { animation: none; stroke-dasharray: none; opacity: 0; }
	.ecg-line { opacity: 0.5; }
}
</style>
