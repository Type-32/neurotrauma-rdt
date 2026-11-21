<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()
</script>

<template>
	<!-- UError has its own "back to home" button, which clears the error. -->
	<UError
		:error="error"
		:ui="{
			statusMessage: 'font-brand',
			statusCode: 'font-mono text-2xl text-dimmed',
		}"
	/>
</template>
