<script setup lang="ts">
/**
 * The database: every entry, one type at a time (/afflictions, /symptoms…),
 * as a typographic list grouped by category, with a filter that narrows it
 * as you type. Names only, with a red or amber dot for lethal entries; the
 * second-language name is the tooltip. The type switch keeps this page
 * mounted (one page key), so switching slides the marker instead of
 * reloading, and the filter carries over.
 */
definePageMeta({ key: 'database' })

const route = useRoute()
const { locale, t } = useI18n()

const type = computed(() => String(route.params.type))
if (!isEntryType(type.value)) {
	throw createError({ statusCode: 404, statusMessage: t('page.notFound'), message: t('page.notFoundDescription'), fatal: true })
}
const entryType = computed(() => (isEntryType(type.value) ? type.value : 'afflictions') as EntryType)

// Every type at once: the tabs show how many match the filter in each.
const { data: lists } = await useAsyncData(
	() => `database-${locale.value}`,
	async () => Object.fromEntries(await Promise.all(ENTRY_TYPES.map(async id => [id, await queryEntries(id, locale.value as ContentLocale)] as const))) as Record<EntryType, EntrySummary[]>,
	{ default: () => ({}) as Record<EntryType, EntrySummary[]> },
)

const query = ref('')

function normalize(text: string | undefined) {
	return (text ?? '').toLowerCase().replace(/[\s'’-]+/g, '')
}
function matches(entry: EntrySummary, q: string) {
	if (!q) return true
	return [entry.nameEn, entry.nameZh, entry.pinyin, entry.pinyinInitials].some(field => normalize(field).includes(q))
}

const q = computed(() => normalize(query.value))
const counts = computed(() => Object.fromEntries(ENTRY_TYPES.map(id => [id, (lists.value[id] ?? []).filter(entry => matches(entry, q.value)).length])) as Record<EntryType, number>)

const groups = computed(() => {
	const entries = (lists.value[entryType.value] ?? []).filter(entry => matches(entry, q.value))
	return CATEGORIES[entryType.value]
		.map(category => ({ category, entries: entries.filter(entry => entry.category === category) }))
		.filter(group => group.entries.length)
})
const shown = computed(() => groups.value.reduce((sum, group) => sum + group.entries.length, 0))
/** With nothing here, point at the other types that do match. */
const elsewhere = computed(() => ENTRY_TYPES.filter(id => id !== entryType.value && counts.value[id] > 0))

const names = (entry: EntrySummary) => entryNames(entry, locale.value)

useSeoMeta({ title: () => `${t('database.title')} · ${t(`types.${entryType.value}`)}` })
</script>

<template>
	<div class="mx-auto w-full max-w-6xl px-5 pt-[5vh] sm:px-8">
		<h1 class="rise font-brand text-5xl font-semibold leading-none tracking-tight text-highlighted sm:text-7xl">{{ t('database.title') }}</h1>
		<p class="rise mt-4 max-w-xl text-lg text-muted" style="--rise: 1">{{ t('database.description') }}</p>

		<!-- Type switch: the marker slides; counts follow the filter -->
		<nav class="rise mt-10 flex flex-wrap gap-x-1 gap-y-2" style="--rise: 2" :aria-label="t('database.title')">
			<NuxtLink
				v-for="id in ENTRY_TYPES"
				:key="id"
				:to="`/${id}`"
				class="relative rounded-md px-3.5 py-2 text-lg transition-colors"
				:class="[entryType === id ? 'text-highlighted' : 'text-muted hover:text-highlighted', !counts[id] && 'opacity-40']"
				:aria-current="entryType === id ? 'page' : undefined"
			>
				<Motion v-if="entryType === id" layout-id="database-type" :transition="SPRING" class="absolute inset-0 rounded-md bg-accented" />
				<span class="relative">{{ t(`types.${id}`) }}</span>
				<span class="relative ms-2 font-mono text-sm text-dimmed">{{ counts[id] }}</span>
			</NuxtLink>
		</nav>

		<label class="rise mt-6 flex max-w-xl items-center gap-3 border-b border-accented pb-2 transition-colors focus-within:border-primary" style="--rise: 3">
			<UIcon name="i-lucide-search" class="size-5 shrink-0 text-dimmed" />
			<input
				v-model="query"
				type="search"
				:placeholder="t('database.filter')"
				:aria-label="t('database.filter')"
				class="min-w-0 flex-1 bg-transparent text-xl text-highlighted outline-none placeholder:text-dimmed"
			>
		</label>

		<!-- Nothing in this type: say so, and point to the types that match -->
		<div v-if="!shown" class="mt-12 text-lg text-muted">
			<p class="flex items-center gap-3">
				<MicroGraphic name="forbidden" motion="pulse" class="size-7 text-warning" />{{ t('database.noMatches', { query }) }}
			</p>
			<p v-if="elsewhere.length" class="mt-3 flex flex-wrap gap-x-5 gap-y-1">
				<NuxtLink v-for="id in elsewhere" :key="id" :to="`/${id}`" class="text-highlighted underline decoration-dotted underline-offset-4 hover:text-primary">
					{{ t('database.elsewhere', { count: counts[id], type: t(`types.${id}`) }) }}
				</NuxtLink>
			</p>
		</div>

		<LayoutGroup>
			<section v-for="group in groups" :key="`${entryType}-${group.category}`" class="mt-14">
				<Motion
					v-if="groups.length > 1"
					as="h2"
					layout="position"
					:transition="SPRING"
					class="flex items-baseline gap-3 text-sm text-muted"
				>
					{{ t(`categories.${group.category}`) }}
					<span class="font-mono text-xs text-dimmed">{{ group.entries.length }}</span>
				</Motion>
				<ul class="mt-3 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					<AnimatePresence :initial="false">
						<Motion
							v-for="entry in group.entries"
							:key="entry.path"
							as="li"
							layout
							:initial="{ opacity: 0, scale: 0.96 }"
							:animate="{ opacity: 1, scale: 1 }"
							:exit="{ opacity: 0, scale: 0.96 }"
							:transition="SPRING"
						>
							<NuxtLink
								:to="entry.path"
								:title="names(entry).secondary"
								class="group flex items-baseline gap-2 py-1.5 text-lg text-toned transition-colors hover:text-highlighted"
							>
								<span class="truncate underline decoration-transparent decoration-2 underline-offset-[6px] transition-[text-decoration-color] group-hover:decoration-primary">{{ names(entry).primary }}</span>
								<span
									v-if="lethality(entry)"
									class="size-1.5 shrink-0 -translate-y-0.5 self-center rounded-full"
									:class="lethality(entry) === 'lethal' ? 'bg-error' : 'bg-warning'"
									:aria-label="t(lethality(entry) === 'lethal' ? 'entry.lethal' : 'entry.possiblyLethal')"
								/>
							</NuxtLink>
						</Motion>
					</AnimatePresence>
				</ul>
			</section>
		</LayoutGroup>
	</div>
</template>
