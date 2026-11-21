<script setup lang="ts">
/** A dashed hairline that draws in from the left. Decoration only. */
withDefaults(defineProps<{ delay?: number }>(), { delay: 0 })
</script>

<template>
	<Motion
		as="div"
		aria-hidden="true"
		class="micro-rule origin-left"
		:initial="{ scaleX: 0 }"
		:animate="{ scaleX: 1 }"
		:transition="{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }"
	/>
</template>
