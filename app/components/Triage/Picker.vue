<script setup lang="ts">
/**
 * Picking what you see: one input, a source switch (all, symptoms, health
 * interface, scanner, analyzer) and the findings as plain words, most telling
 * first. Typing searches every source (English, 中文, pinyin, initials).
 *
 * Multi-select: tapping a word marks it in place (filled), tapping again
 * clears it, so a medic picks everything they see before asking for an
 * answer. Ruled-out findings show struck through; tapping one undoes it.
 * Marked words carry a layoutId, so they fly to the patient strip when the
 * answer opens.
 */
const props = defineProps<{
	entries: TriageEntry[]
	selected: string[]
	ruledOut: string[]
	/** How many findings lead to each, for ordering symptoms. */
	weightOf: (id: string) => number
	/** The body-map region the words are narrowed to, if any. */
	region?: BodyRegion | null
	regionsOf?: (id: string) => BodyRegion[]
}>()
const emit = defineEmits<{ 'toggle': [id: string], 'clear-region': [] }>()

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

const isSelected = (id: string) => props.selected.includes(id)
const isRuledOut = (id: string) => props.ruledOut.includes(id)
// Narrowed to a body region; picked words always stay, so nothing picked disappears.
const available = computed(() => props.region && props.regionsOf
	? props.entries.filter(entry => props.regionsOf!(entry.id).includes(props.region!) || isSelected(entry.id) || isRuledOut(entry.id))
	: props.entries)

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

const LIMIT = 24
// Marked words are never hidden behind "more", so the reader always sees what they picked.
const shown = computed(() => expanded.value || query.value
	? words.value
	: words.value.filter((entry, i) => i < LIMIT || isSelected(entry.id) || isRuledOut(entry.id)))
const hidden = computed(() => words.value.length - shown.value.length)

watch(source, () => { expanded.value = false })

function names(entry: TriageEntry) {
	return entryNames({ title: entry.nameZh, nameZh: entry.nameZh, nameEn: entry.nameEn }, locale.value)
}

function toggle(id: string) {
	emit('toggle', id)
}

/** Enter marks the first match and clears the filter for the next one. */
function onEnter() {
	if (query.value && words.value[0]) {
		if (!isSelected(words.value[0].id)) toggle(words.value[0].id)
		query.value = ''
	}
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
				class="min-w-0 flex-1 bg-transparent text-xl text-highlighted outline-none placeholder:text-dimmed"
				@keydown.enter.prevent="onEnter"
			>
		</label>

		<!-- Source switch: hidden while searching, since search covers every source. -->
		<!-- Narrowed by the body map: say so, with a way back. -->
		<AnimatePresence>
			<Motion
				v-if="region"
				key="region"
				:initial="{ opacity: 0, height: 0 }"
				:animate="{ opacity: 1, height: 'auto' }"
				:exit="{ opacity: 0, height: 0 }"
				:transition="SPRING_SOFT"
				class="overflow-hidden"
			>
				<button
					type="button"
					class="mt-5 inline-flex items-center gap-2 rounded-md bg-primary/12 px-3 py-1.5 text-sm text-primary transition-colors hover:bg-primary/20"
					@click="emit('clear-region')"
				>
					{{ t('triage.showingRegion', { region: t(`triage.regions.${region}`) }) }}
					<UIcon name="i-lucide-x" class="size-3.5" />
					<span class="sr-only">{{ t('triage.showAll') }}</span>
				</button>
			</Motion>
		</AnimatePresence>

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
					layout-id="picker-source"
					:transition="SPRING"
					class="absolute inset-0 rounded-md bg-accented"
				/>
				<span class="relative">{{ t(`triage.sources.${id}`) }}</span>
				<span class="relative ms-1.5 font-mono text-xs text-dimmed">{{ counts[id] }}</span>
			</button>
		</div>

		<p v-if="query && !words.length" class="mt-6 text-muted">{{ t('triage.noMatches', { query }) }}</p>

		<ul class="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2.5">
			<li v-for="entry in shown" :key="entry.id">
				<Motion
					as="button"
					type="button"
					:layout-id="isSelected(entry.id) || isRuledOut(entry.id) ? `finding-${entry.id}` : undefined"
					:transition="SPRING"
					:while-press="PRESS"
					:aria-pressed="isSelected(entry.id)"
					class="group inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-start text-xl transition-colors focus-visible:outline-2 focus-visible:outline-primary sm:text-2xl"
					:class="isSelected(entry.id)
						? 'bg-inverted text-inverted'
						: isRuledOut(entry.id)
							? 'text-dimmed line-through decoration-1 hover:text-muted'
							: 'text-toned hover:bg-accented/60 hover:text-highlighted'"
					:title="names(entry).secondary"
					@click="toggle(entry.id)"
				>
					<UIcon v-if="isSelected(entry.id)" name="i-lucide-check" class="size-4 shrink-0" />
					<span
						v-else-if="entry.lethal"
						class="size-1.5 shrink-0 rounded-full"
						:class="entry.lethal === 'lethal' ? 'bg-error' : 'bg-warning'"
						aria-hidden="true"
					/>
					{{ names(entry).primary }}
				</Motion>
			</li>
			<li v-if="hidden > 0 || expanded">
				<button type="button" class="px-3 py-1.5 text-xl text-muted underline decoration-dotted underline-offset-[6px] transition-colors hover:text-highlighted sm:text-2xl" @click="expanded = !expanded">
					{{ expanded ? t('triage.fewer') : `+ ${t('triage.more', { count: hidden })}` }}
				</button>
			</li>
		</ul>
	</div>
</template>
