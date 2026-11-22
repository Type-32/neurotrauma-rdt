<script setup lang="ts">
/**
 * The title band at the top of a page: a decoding code label ("DB // AFF"),
 * a large title, a short description, and a right-hand slot for a readout or
 * actions, closed by a hairline that draws in.
 */
defineProps<{
	code: string
	title: string
	description?: string
}>()
</script>

<template>
	<header>
		<div class="flex flex-wrap items-end justify-between gap-4">
			<div class="min-w-0">
				<p class="micro text-muted"><MicroScramble :text="code" /></p>
				<h1 class="mt-2 font-brand text-4xl font-semibold leading-none tracking-tight text-highlighted sm:text-5xl">{{ title }}</h1>
				<p v-if="description" class="mt-2 max-w-xl text-sm text-muted">{{ description }}</p>
			</div>
			<div v-if="$slots.default" class="flex items-center gap-2">
				<slot />
			</div>
		</div>
		<MicroRule class="mt-4" />
	</header>
</template>
