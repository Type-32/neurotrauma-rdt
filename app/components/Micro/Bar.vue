<script setup lang="ts">
/**
 * A segmented 0–100% gauge, e.g. the strength at which an effect starts.
 * Ten segments; the filled ones light up in sequence on mount.
 */
const props = withDefaults(defineProps<{
	/** 0–100. */
	value: number
	color?: 'primary' | 'error' | 'warning' | 'success' | 'neutral'
}>(), { color: 'primary' })

const filled = computed(() => Math.max(0, Math.min(10, Math.round(props.value / 10))))
const COLORS = {
	primary: 'bg-primary',
	error: 'bg-error',
	warning: 'bg-warning',
	success: 'bg-success',
	neutral: 'bg-inverted',
} as const
</script>

<template>
	<span class="inline-flex gap-px align-middle" role="img" :aria-label="`${value}%`">
		<Motion
			v-for="i in 10"
			:key="i"
			as="span"
			class="block h-2.5 w-1.5"
			:class="i <= filled ? COLORS[color] : 'bg-accented'"
			:initial="i <= filled ? { opacity: 0.25 } : false"
			:animate="{ opacity: 1 }"
			:transition="{ duration: 0.12, delay: 0.15 + i * 0.03 }"
		/>
	</span>
</template>
