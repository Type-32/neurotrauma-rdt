<script setup lang="ts">
/**
 * A segmented step readout: one tick per step. Done ticks are solid, the
 * current one breathes, upcoming ones are faint; when everything is done they
 * all turn the "done" colour in a quick ripple. Decoration only (the step
 * count is in text beside it).
 */
const props = defineProps<{
	total: number
	/** Steps done; equal to total when finished. */
	done: number
}>()

const finished = computed(() => props.done >= props.total)
</script>

<template>
	<span class="flex items-center gap-1" aria-hidden="true">
		<span
			v-for="i in total"
			:key="i"
			class="tick h-1 w-5 rounded-full"
			:class="finished
				? 'bg-success'
				: i <= done ? 'bg-primary' : i === done + 1 ? 'current bg-primary' : 'bg-accented'"
			:style="finished ? { transitionDelay: `${(i - 1) * 40}ms` } : undefined"
		/>
	</span>
</template>

<style scoped>
.tick {
	transition: background-color 220ms ease;
}

.current {
	animation: tick-breathe 1.4s ease-in-out infinite;
}

@keyframes tick-breathe {
	0%, 100% { opacity: 0.35; }
	50% { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
	.current { animation: none; opacity: 0.6; }
	.tick { transition: none; }
}
</style>
