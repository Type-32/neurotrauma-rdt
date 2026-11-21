<script setup lang="ts">
/**
 * Site search: a command palette in a modal, opened with "/" or Ctrl/⌘+K or
 * the header button. Results come pre-ranked from shared/utils/search.ts
 * (names, then aliases and pinyin, then related names), best first, so Enter
 * opens the top hit.
 */
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'

const { open, ready, failed, load, search } = useSearch()
const { t, locale } = useI18n()
const route = useRoute()

const searchTerm = ref('')

const TYPE_ICONS: Record<EntryType, string> = {
	afflictions: 'i-lucide-activity',
	symptoms: 'i-lucide-stethoscope',
	items: 'i-lucide-pill',
	procedures: 'i-lucide-list-ordered',
	info: 'i-lucide-info',
}

defineShortcuts({
	// preventDefault stops the "/" itself from being typed into the search box once it's focused.
	'/': (event: KeyboardEvent) => {
		event.preventDefault()
		open.value = true
	},
	'meta_k': (event: KeyboardEvent) => {
		event.preventDefault()
		open.value = !open.value
	},
})

watch(open, (isOpen) => {
	if (isOpen) load()
	else searchTerm.value = ''
})

// Following a result navigates; close the palette when the page changes.
watch(() => route.fullPath, () => { open.value = false })

const groups = computed<CommandPaletteGroup<CommandPaletteItem>[]>(() => {
	const term = searchTerm.value.trim()
	if (!term) {
		return [{
			id: 'types',
			label: t('search.browse'),
			items: [
				{ label: t('triage.title'), icon: 'i-lucide-heart-pulse', to: '/triage' },
				{ label: t('reference.title'), icon: 'i-lucide-book-marked', to: '/reference' },
				...ENTRY_TYPES.map(type => ({
					label: t(`types.${type}`),
					icon: TYPE_ICONS[type],
					to: `/${type}`,
				})),
			],
		}]
	}

	// Depends on `ready` so results appear as soon as the index has loaded.
	const results = ready.value ? search(term) : []
	return [{
		id: 'results',
		label: t('search.results'),
		ignoreFilter: true,
		items: results.map(({ record }) => {
			const names = entryNames({ title: record.nameZh, nameZh: record.nameZh, nameEn: record.nameEn }, locale.value)
			return {
				label: names.primary,
				suffix: [names.secondary, t(`types.${record.type}`)].filter(Boolean).join(' · '),
				icon: record.lethal ? 'i-lucide-skull' : TYPE_ICONS[record.type],
				to: record.path,
				ui: record.lethal
					? { itemLeadingIcon: record.lethal === 'lethal' ? 'text-error' : 'text-warning' }
					: undefined,
			}
		}),
	}]
})

const emptyText = computed(() => failed.value
	? t('search.failed')
	: ready.value ? t('search.noResults') : t('search.loading'))
</script>

<template>
	<UModal v-model:open="open" :title="t('search.title')" :description="t('search.hint')" :ui="{ content: 'sm:max-w-2xl' }">
		<template #content>
			<UCommandPalette
				v-model:search-term="searchTerm"
				:groups="groups"
				:placeholder="t('search.placeholder')"
				:loading="open && !ready && !failed"
				close
				class="h-[min(32rem,80dvh)]"
				@update:open="open = $event"
			>
				<template #empty>
					{{ emptyText }}
				</template>
			</UCommandPalette>
		</template>
	</UModal>
</template>
