<script setup lang="ts">
/**
 * One entry in a list: short code, name, and second-language name. A bar on
 * the left edge marks lethal (red) and possibly lethal (amber) entries.
 */
const props = defineProps<{
	entry: EntrySummary
}>()

const { t, locale } = useI18n()

const names = computed(() => entryNames(props.entry, locale.value))
const danger = computed(() => lethality(props.entry))
const code = computed(() => entryShortCode(props.entry.category, props.entry.order))
</script>

<template>
	<NuxtLink
		:to="entry.path"
		class="group relative flex h-full items-baseline gap-3 border border-default bg-elevated/40 py-2 pe-3 ps-4 transition-colors hover:border-accented hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
	>
		<span
			class="absolute inset-y-0 start-0 w-0.5"
			:class="danger === 'lethal' ? 'bg-error' : danger === 'possibly-lethal' ? 'bg-warning' : 'bg-transparent group-hover:bg-(--micro-mark)'"
			aria-hidden="true"
		/>
		<span class="micro w-12 shrink-0 text-dimmed">{{ code }}</span>
		<span class="min-w-0 flex-1">
			<span class="block font-medium leading-snug text-highlighted">{{ names.primary }}</span>
			<span v-if="names.secondary" class="block text-sm leading-snug text-muted">{{ names.secondary }}</span>
		</span>
		<span v-if="danger" class="sr-only">{{ t(danger === 'lethal' ? 'entry.lethal' : 'entry.possiblyLethal') }}</span>
	</NuxtLink>
</template>
