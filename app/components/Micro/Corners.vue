<script setup lang="ts">
/**
 * Four corner brackets that close in on their container when `active`, like a
 * viewfinder locking on, and drift back out when not. Put it inside a
 * `relative` element that doesn't clip its overflow. Decoration only.
 */
withDefaults(defineProps<{
	active: boolean
	/** How far outside the container the brackets sit, in px. */
	inset?: number
}>(), { inset: 6 })
</script>

<template>
	<span class="pointer-events-none absolute" :style="{ inset: `-${inset}px` }" aria-hidden="true">
		<span
			v-for="corner in ['tl', 'tr', 'bl', 'br']"
			:key="corner"
			class="corner absolute size-3 border-primary"
			:class="[corner, active && 'on']"
		/>
	</span>
</template>

<style scoped>
.corner {
	opacity: 0;
	transition: opacity 180ms ease, transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
}
.tl { top: 0; left: 0; border-top-width: 1.5px; border-left-width: 1.5px; transform: translate(-6px, -6px); }
.tr { top: 0; right: 0; border-top-width: 1.5px; border-right-width: 1.5px; transform: translate(6px, -6px); }
.bl { bottom: 0; left: 0; border-bottom-width: 1.5px; border-left-width: 1.5px; transform: translate(-6px, 6px); }
.br { bottom: 0; right: 0; border-bottom-width: 1.5px; border-right-width: 1.5px; transform: translate(6px, 6px); }
.corner.on {
	opacity: 1;
	transform: translate(0, 0);
}

@media (prefers-reduced-motion: reduce) {
	.corner { transition: opacity 120ms ease; transform: none; }
}
</style>
