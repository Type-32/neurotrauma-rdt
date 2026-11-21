<script setup lang="ts">
/**
 * Site search: a command palette in a modal, opened with "/" or Ctrl/⌘+K or
 * the header button. Results come pre-ranked from shared/utils/search.ts
 * (names, then aliases and pinyin, then related names), best first, so Enter
 * opens the top hit. Styled as a terminal prompt: each result shows its code
 * stamp, and a bar on the left marks lethal entries.
 */
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'

interface PaletteItem extends CommandPaletteItem {
	/** Second-language name, under the label. */
	secondary?: string
	/** Code stamp, e.g. "AFF // LNG-04"; absent for the browse links. */
	code?: string
	lethal?: 'lethal' | 'possibly-lethal'
}

const { open, ready, failed, load, search } = useSearch()
const { t, locale } = useI18n()
const route = useRoute()

const searchTerm = ref('')

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

const groups = computed<CommandPaletteGroup<PaletteItem>[]>(() => {
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
					code: TYPE_CODES[type],
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
				secondary: names.secondary,
				icon: TYPE_ICONS[record.type],
				to: record.path,
				code: entryCode(record.type, record.category, record.order),
				lethal: record.lethal,
			}
		}),
	}]
})

const emptyText = computed(() => failed.value
	? t('search.failed')
	: ready.value ? t('search.noResults') : t('search.loading'))

const pad = (n: number) => String(n).padStart(2, '0')
</script>

<template>
	<UModal v-model:open="open" :title="t('search.title')" :description="t('search.hint')" :ui="{ content: 'sm:max-w-2xl' }">
		<template #content>
			<UCommandPalette
				v-model:search-term="searchTerm"
				:groups="groups"
				:placeholder="t('search.placeholder')"
				:loading="open && !ready && !failed"
				icon="i-lucide-chevron-right"
				close
				class="h-[min(32rem,80dvh)]"
				:ui="{
					input: 'font-mono [&_svg]:text-primary',
					label: 'micro font-normal text-dimmed',
					item: 'items-center py-2',
					empty: 'micro',
				}"
				@update:open="open = $event"
			>
				<template #group-label="{ group, label }">
					{{ label }} <span class="text-dimmed">[{{ pad(group.items?.length ?? 0) }}]</span>
				</template>

				<template #item-leading="{ item }">
					<span
						class="h-7 w-0.5 shrink-0"
						:class="item.lethal === 'lethal' ? 'bg-error' : item.lethal === 'possibly-lethal' ? 'bg-warning' : 'bg-transparent'"
						aria-hidden="true"
					/>
					<UIcon :name="item.icon!" class="size-4 shrink-0 text-dimmed" />
				</template>

				<template #item-label="{ item }">
					<span class="block truncate text-highlighted">{{ item.label }}</span>
					<span v-if="item.secondary" class="block truncate text-xs text-muted">{{ item.secondary }}</span>
					<span v-if="item.lethal" class="sr-only">{{ t(item.lethal === 'lethal' ? 'entry.lethal' : 'entry.possiblyLethal') }}</span>
				</template>

				<template #item-trailing="{ item }">
					<span v-if="item.code" class="micro shrink-0 text-dimmed">{{ item.code }}</span>
				</template>

				<template #empty>
					{{ emptyText }}
				</template>

				<template #footer>
					<div class="micro flex items-center gap-4 text-dimmed">
						<span class="flex items-center gap-1"><UKbd value="arrowup" size="sm" /><UKbd value="arrowdown" size="sm" /> {{ t('search.navigate') }}</span>
						<span class="flex items-center gap-1"><UKbd value="enter" size="sm" /> {{ t('search.open') }}</span>
						<span class="flex items-center gap-1"><UKbd value="escape" size="sm" /> {{ t('search.close') }}</span>
					</div>
				</template>
			</UCommandPalette>
		</template>
	</UModal>
</template>
