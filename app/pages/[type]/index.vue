<script setup lang="ts">
// Index of one entry type (e.g. /afflictions), grouped by category in the
// Trello board's order.
const route = useRoute()
const { locale, t } = useI18n()

const type = computed(() => String(route.params.type))
if (!isEntryType(type.value)) {
	throw createError({ statusCode: 404, statusMessage: t('page.notFound'), message: t('page.notFoundDescription'), fatal: true })
}
const entryType = computed(() => type.value as EntryType)

const { data: entries } = await useAsyncData(
	() => `entries-${locale.value}-${entryType.value}`,
	() => queryEntries(entryType.value, locale.value as ContentLocale),
	{ default: () => [] },
)

const groups = computed(() => CATEGORIES[entryType.value]
	.map(category => ({ category, entries: entries.value.filter(entry => entry.category === category) }))
	.filter(group => group.entries.length))

useSeoMeta({ title: () => t(`types.${entryType.value}`) })
</script>

<template>
	<UContainer class="pb-16">
		<UPageHeader
			:title="t(`types.${entryType}`)"
			:description="`${t(`typeDescriptions.${entryType}`)} ${t('entries', entries.length)}`"
		/>

		<section v-for="group in groups" :key="group.category" class="mt-8">
			<h2 v-if="groups.length > 1" class="mb-3 text-lg font-semibold text-highlighted">
				{{ t(`categories.${group.category}`) }}
			</h2>
			<ul class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
				<li v-for="entry in group.entries" :key="entry.path">
					<ULink
						:to="entry.path"
						class="flex h-full items-start gap-2 rounded-md border border-default px-3 py-2 transition-colors hover:border-primary hover:bg-elevated/50"
					>
						<UIcon
							v-if="lethality(entry)"
							name="i-lucide-skull"
							class="mt-1 size-4 shrink-0"
							:class="lethality(entry) === 'lethal' ? 'text-error' : 'text-warning'"
							:aria-label="t(lethality(entry) === 'lethal' ? 'entry.lethal' : 'entry.possiblyLethal')"
						/>
						<span class="min-w-0">
							<span class="block font-medium text-highlighted">{{ entryNames(entry, locale).primary }}</span>
							<span v-if="entryNames(entry, locale).secondary" class="block text-sm text-muted">
								{{ entryNames(entry, locale).secondary }}
							</span>
						</span>
					</ULink>
				</li>
			</ul>
		</section>
	</UContainer>
</template>
