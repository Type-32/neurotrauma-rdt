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
	.map(category => ({ category, code: categoryCode(category), entries: entries.value.filter(entry => entry.category === category) }))
	.filter(group => group.entries.length))

const pad = (n: number, width = 2) => String(n).padStart(width, '0')

useSeoMeta({ title: () => t(`types.${entryType.value}`) })
</script>

<template>
	<UContainer class="pb-16 pt-6">
		<MicroPageHead :code="`DB // ${TYPE_CODES[entryType]}`" :title="t(`types.${entryType}`)" :description="t(`typeDescriptions.${entryType}`)">
			<p class="text-end">
				<span class="micro block text-dimmed">{{ t('home.entries') }}</span>
				<span class="font-mono text-3xl leading-none text-highlighted">{{ pad(entries.length, 3) }}</span>
			</p>
		</MicroPageHead>

		<!-- Category jump bar, for types with many categories -->
		<nav
			v-if="groups.length > 3"
			class="sticky top-(--ui-header-height) z-10 -mx-4 flex gap-1 overflow-x-auto border-b border-default bg-default/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6"
			:aria-label="t('index.categories')"
		>
			<a
				v-for="group in groups"
				:key="group.category"
				:href="`#${group.category}`"
				:title="t(`categories.${group.category}`)"
				class="micro shrink-0 px-2 py-1 text-muted transition-colors hover:bg-elevated hover:text-highlighted"
			>
				{{ group.code }} <span class="text-dimmed">{{ pad(group.entries.length) }}</span>
			</a>
		</nav>

		<section v-for="(group, n) in groups" :id="group.category" :key="group.category" class="mt-8 scroll-mt-32">
			<template v-if="groups.length > 1">
				<header class="flex items-center justify-between gap-3 pb-2">
					<h2 class="micro text-highlighted">
						<span class="text-dimmed">{{ pad(n + 1) }} //</span> {{ t(`categories.${group.category}`) }}
					</h2>
					<span class="micro text-dimmed">{{ group.code }} [{{ pad(group.entries.length) }}]</span>
				</header>
				<MicroRule :delay="Math.min(n, 6) * 0.05" class="mb-3" />
			</template>
			<ul class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
				<li v-for="entry in group.entries" :key="entry.path">
					<EntryRow :entry="entry" />
				</li>
			</ul>
		</section>
	</UContainer>
</template>
