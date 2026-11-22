<script setup lang="ts">
/**
 * Picking what you see: one input, a source switch (all, symptoms, health
 * interface, scanner, analyzer) and the findings as plain words, most telling
 * first. Typing searches every source (English, 中文, pinyin, initials).
 * Each word carries a layoutId, so a picked word flies to the patient strip.
 */
const props = defineProps<{
	entries: TriageEntry[]
	/** Ids already on the patient strip (selected or ruled out): not offered again. */
	exclude: string[]
	/** How many findings lead to each, for ordering symptoms. */
	weightOf: (id: string) => number
	/** Smaller words and fewer shown, once there's an answer beside it. */
	compact?: boolean
}>()
const emit = defineEmits<{ pick: [id: string] }>()

const { t, locale } = useI18n()

const SOURCES = ['symptoms', 'interface', 'scanner', 'analyzer'] as const
type Source = typeof SOURCES[number]
/** "All" first and by default, so nothing seems missing before the reader finds the other tabs. */
const TABS = ['all', ...SOURCES] as const
type Tab = typeof TABS[number]

const source = ref<Tab>('all')
const query = ref('')
const expanded = ref(false)

function sourceOf(entry: TriageEntry): Source {
	return entry.type === 'symptoms' ? 'symptoms' : entry.visibleIn[0]!
}

const available = computed(() => props.entries.filter(entry => !props.exclude.includes(entry.id)))

const counts = computed(() => ({
	all: available.value.length,
	...Object.fromEntries(SOURCES.map(id => [id, available.value.filter(entry => sourceOf(entry) === id).length])),
}) as Record<Tab, number>)

function normalize(text: string | undefined) {
	return (text ?? '').toLowerCase().replace(/[\s'’-]+/g, '')
}

/** Matching rank: 0 starts with the query, 1 contains it, -1 no match. */
function rank(entry: TriageEntry, q: string): number {
	const fields = [entry.nameEn, entry.nameZh, entry.pinyin, entry.pinyinInitials].map(normalize).filter(Boolean)
	if (fields.some(field => field.startsWith(q))) return 0
	if (fields.some(field => field.includes(q))) return 1
	return -1
}

const categoryRank = (entry: TriageEntry) => CATEGORIES.afflictions.indexOf(entry.category as never)
const lethalRank = (entry: TriageEntry) => entry.lethal === 'lethal' ? 0 : entry.lethal === 'possibly-lethal' ? 1 : 2

const words = computed(() => {
	const q = normalize(query.value)
	if (q) {
		return available.value
			.map(entry => ({ entry, rank: rank(entry, q) }))
			.filter(match => match.rank >= 0)
			.sort((a, b) => a.rank - b.rank || props.weightOf(b.entry.id) - props.weightOf(a.entry.id))
			.map(match => match.entry)
	}
	const inSource = (id: Source) => available.value
		.filter(entry => sourceOf(entry) === id)
		.sort(id === 'symptoms'
			// Common symptoms first: they're the ones a medic sees most.
			? (a, b) => props.weightOf(b.id) - props.weightOf(a.id) || a.order - b.order
			: (a, b) => lethalRank(a) - lethalRank(b) || categoryRank(a) - categoryRank(b) || a.order - b.order)
	// All: each source in turn, symptoms first.
	return source.value === 'all' ? SOURCES.flatMap(inSource) : inSource(source.value)
})

const limit = computed(() => props.compact ? 12 : 18)
const shown = computed(() => expanded.value || query.value ? words.value : words.value.slice(0, limit.value))
const hidden = computed(() => words.value.length - shown.value.length)

watch(source, () => { expanded.value = false })

function names(entry: TriageEntry) {
	return entryNames({ title: entry.nameZh, nameZh: entry.nameZh, nameEn: entry.nameEn }, locale.value)
}

function pick(id: string) {
	emit('pick', id)
	query.value = ''
}

/** Enter picks the first match. */
function onEnter() {
	if (query.value && words.value[0]) pick(words.value[0].id)
}
</script>

<template>
	<div>
		<label class="flex items-center gap-3 border-b border-accented pb-2 transition-colors focus-within:border-primary">
			<UIcon name="i-lucide-search" class="size-5 shrink-0 text-dimmed" />
			<input
				v-model="query"
				type="search"
				:placeholder="t('triage.filter')"
				:aria-label="t('triage.filter')"
				class="min-w-0 flex-1 bg-transparent text-highlighted outline-none placeholder:text-dimmed"
				:class="compact ? 'text-lg' : 'text-xl'"
				@keydown.enter.prevent="onEnter"
			>
		</label>

		<!-- Source switch: hidden while searching, since search covers every source. -->
		<div v-if="!query" class="mt-5 flex flex-wrap gap-1" role="tablist">
			<button
				v-for="id in TABS"
				:key="id"
				type="button"
				role="tab"
				:aria-selected="source === id"
				:disabled="!counts[id]"
				class="relative rounded-md px-3 py-1.5 text-sm transition-colors disabled:opacity-40"
				:class="source === id ? 'text-highlighted' : 'text-muted hover:text-highlighted'"
				@click="source = id"
			>
				<Motion
					v-if="source === id"
					:layout-id="`picker-source-${compact ? 'c' : 'w'}`"
					:transition="SPRING"
					class="absolute inset-0 rounded-md bg-accented"
				/>
				<span class="relative">{{ t(`triage.sources.${id}`) }}</span>
				<span class="relative ms-1.5 font-mono text-xs text-dimmed">{{ counts[id] }}</span>
			</button>
		</div>

		<p v-if="query && !words.length" class="mt-6 text-muted">{{ t('triage.noMatches', { query }) }}</p>

		<ul class="mt-6 flex flex-wrap items-baseline gap-x-5 gap-y-2.5">
			<li v-for="entry in shown" :key="entry.id">
				<Motion
					as="button"
					type="button"
					:layout-id="`finding-${entry.id}`"
					:transition="SPRING"
					:while-press="PRESS"
					:while-hover="{ y: -2 }"
					class="group inline-flex items-baseline gap-1.5 text-start text-toned transition-colors hover:text-highlighted focus-visible:text-highlighted focus-visible:outline-none"
					:class="compact ? 'text-lg' : 'text-xl sm:text-2xl'"
					:title="names(entry).secondary"
					@click="pick(entry.id)"
				>
					<span
						v-if="entry.lethal"
						class="size-1.5 shrink-0 -translate-y-0.5 self-center rounded-full"
						:class="entry.lethal === 'lethal' ? 'bg-error' : 'bg-warning'"
						aria-hidden="true"
					/>
					<span class="underline decoration-transparent decoration-2 underline-offset-[6px] transition-[text-decoration-color] group-hover:decoration-primary group-focus-visible:decoration-primary">{{ names(entry).primary }}</span>
				</Motion>
			</li>
			<li v-if="hidden > 0 || expanded">
				<button type="button" class="text-muted underline decoration-dotted underline-offset-[6px] transition-colors hover:text-highlighted" :class="compact ? 'text-lg' : 'text-xl sm:text-2xl'" @click="expanded = !expanded">
					{{ expanded ? t('triage.fewer') : `+ ${t('triage.more', { count: hidden })}` }}
				</button>
			</li>
		</ul>
	</div>
</template>
