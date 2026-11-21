<script setup lang="ts">
/** A tappable finding: a symptom or visible affliction, on or off. */
const props = defineProps<{
	primary: string
	secondary?: string
	selected: boolean
	lethal?: 'lethal' | 'possibly-lethal'
}>()
defineEmits<{ toggle: [] }>()
</script>

<template>
	<UButton
		:color="selected ? 'primary' : 'neutral'"
		:variant="selected ? 'solid' : 'outline'"
		:icon="selected ? 'i-lucide-check' : lethal ? 'i-lucide-skull' : undefined"
		:aria-pressed="selected"
		size="md"
		class="min-h-11"
		:ui="{ leadingIcon: !selected && lethal ? (lethal === 'lethal' ? 'text-error' : 'text-warning') : undefined }"
		@click="$emit('toggle')"
	>
		<span class="flex flex-col items-start text-start leading-tight">
			<span>{{ props.primary }}</span>
			<span v-if="props.secondary" class="text-xs opacity-70">{{ props.secondary }}</span>
		</span>
	</UButton>
</template>
