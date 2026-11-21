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
	<button
		type="button"
		:aria-pressed="selected"
		class="group flex min-h-11 items-center gap-2 border px-2.5 py-1.5 text-start transition-[background-color,border-color,color] duration-100 active:scale-[0.98]"
		:class="selected
			? 'border-primary bg-primary text-inverted'
			: 'border-accented bg-default/60 text-highlighted hover:border-primary/60 hover:bg-elevated'"
		@click="$emit('toggle')"
	>
		<span
			class="block size-1.5 shrink-0"
			:class="selected ? 'bg-inverted' : lethal === 'lethal' ? 'bg-error' : lethal === 'possibly-lethal' ? 'bg-warning' : 'bg-accented'"
			aria-hidden="true"
		/>
		<span class="flex flex-col leading-tight">
			<span class="text-sm">{{ props.primary }}</span>
			<span v-if="props.secondary" class="font-mono text-[0.6875rem]" :class="selected ? 'text-inverted/75' : 'text-muted'">{{ props.secondary }}</span>
		</span>
	</button>
</template>
