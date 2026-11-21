<script setup lang="ts">
/**
 * Triage: tap what you see; get likely causes, what to check next, and one
 * treatment plan for everything present. Logic is in shared/utils/triage.ts.
 *
 * The selection lives in the URL (?f=s:headache,a:pneumothorax), so a link
 * shares the patient and the back button undoes a tap. The page renders on the
 * client only: the selection comes from the URL and the data from
 * /triage-index.json, neither of which a static prerender can know.
 */
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()

useSeoMeta({ title: () => t('triage.title') })

const index = ref<TriageIndex | null>(null)
const failed = ref(false)
onMounted(async () => {
	try {
		index.value = await $fetch<TriageIndex>('/triage-index.json')
	}
	catch {
		failed.value = true
	}
})
const triage = computed(() => index.value ? createTriage(index.value) : null)

// --- Selection, stored in the URL ---------------------------------------------
const PREFIXES = { s: 'symptoms', a: 'afflictions' } as const

const selected = computed<string[]>(() => String(route.query.f ?? '')
	.split(',')
	.map((code) => {
		const [prefix, slug] = code.split(':')
		const type = PREFIXES[prefix as keyof typeof PREFIXES]
		return type && slug ? `${type}/${slug}` : null
	})
	.filter((id): id is string => !!id))

function setSelected(ids: string[]) {
	const f = ids.map(id => `${id.startsWith('symptoms/') ? 's' : 'a'}:${id.split('/')[1]}`).join(',')
	router.push({ query: f ? { f } : {} })
}
function toggle(id: string) {
	setSelected(selected.value.includes(id) ? selected.value.filter(other => other !== id) : [...selected.value, id])
}
function add(id: string) {
	if (!selected.value.includes(id)) setSelected([...selected.value, id])
}

async function share() {
	try {
		await navigator.clipboard.writeText(window.location.href)
		toast.add({ title: t('triage.copied'), description: t('triage.copiedDescription'), icon: 'i-lucide-link' })
	}
	catch {
		// Clipboard can be blocked; the URL bar still has the link.
	}
}

const result = computed(() => triage.value?.evaluate(selected.value))

// --- Names --------------------------------------------------------------------
function names(id: string) {
	const entry = index.value?.names[id]
	return entry ? entryNames({ title: entry.nameZh, ...entry }, locale.value) : { primary: id }
}
function nameList(ids: string[]) {
	return ids.map(id => names(id).primary).join(locale.value === 'zh' ? '、' : ', ')
}

// --- Finding chips, grouped by where the game shows them -----------------------
const filter = ref('')
const GROUP_ORDER = ['symptoms', 'interface', 'scanner', 'analyzer'] as const

const groups = computed(() => {
	if (!index.value || !triage.value) return []
	const query = filter.value.trim().toLowerCase()
	const matches = (entry: TriageEntry) => !query
		|| entry.nameZh.includes(query)
		|| (entry.nameEn ?? '').toLowerCase().includes(query)

	const categoryRank = (entry: TriageEntry) => CATEGORIES.afflictions.indexOf(entry.category as never)
	const byGroup = new Map<string, TriageEntry[]>()
	for (const entry of index.value.entries) {
		if (!triage.value.isObservable(entry.id) || !matches(entry)) continue
		const group = entry.type === 'symptoms' ? 'symptoms' : entry.visibleIn[0]!
		if (!byGroup.has(group)) byGroup.set(group, [])
		byGroup.get(group)!.push(entry)
	}
	return GROUP_ORDER
		.filter(group => byGroup.get(group)?.length)
		.map(group => ({
			id: group,
			entries: byGroup.get(group)!.sort(group === 'symptoms'
				// Common symptoms first: they're the ones a medic sees most.
				? (a, b) => triage.value!.causesOf(b.id).length - triage.value!.causesOf(a.id).length || a.order - b.order
				: (a, b) => categoryRank(a) - categoryRank(b) || a.order - b.order),
		}))
})

const resultsEl = useTemplateRef<HTMLElement>('results')
/** The phone shortcut to the results hides once they're on screen. */
const resultsVisible = useElementVisibility(resultsEl)

function scrollToResults() {
	resultsEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
	<UContainer class="pb-24 pt-6 lg:pb-16">
		<MicroPageHead code="SYS // TRIAGE" :title="t('triage.title')" :description="t('triage.description')">
			<UButton :label="t('triage.share')" icon="i-lucide-link" color="neutral" variant="outline" class="micro" :disabled="!selected.length" @click="share" />
			<UButton :label="t('triage.clear')" icon="i-lucide-eraser" color="neutral" variant="outline" class="micro" :disabled="!selected.length" @click="setSelected([])" />
		</MicroPageHead>

		<ClientOnly>
			<template #fallback>
				<div class="mt-10 flex items-center gap-3 text-muted">
					<MicroGraphic name="dot-ring" spin class="size-6" />
					<span class="micro">{{ t('triage.loading') }}</span>
				</div>
			</template>

			<p v-if="failed" class="micro mt-10 text-error">{{ t('triage.failed') }}</p>
			<div v-else-if="!index" class="mt-10 flex items-center gap-3 text-muted">
				<MicroGraphic name="dot-ring" spin class="size-6" />
				<span class="micro">{{ t('triage.loading') }}</span>
			</div>

			<div v-else class="mt-8 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
				<!-- What you see -->
				<section>
					<div class="flex items-center justify-between gap-4">
						<h2 class="micro text-highlighted"><span class="text-dimmed">IN //</span> {{ t('triage.findings') }}</h2>
						<UInput v-model="filter" icon="i-lucide-filter" :placeholder="t('triage.filter')" size="sm" class="w-40" :ui="{ base: 'font-mono text-xs' }" />
					</div>
					<div v-for="group in groups" :key="group.id" class="mt-6">
						<h3 class="micro mb-2 flex items-center gap-2 text-muted">
							<span>{{ t(`triage.groups.${group.id}`) }}</span>
							<span class="h-px flex-1 bg-(--micro-line)" />
							<span class="text-dimmed">[{{ String(group.entries.length).padStart(2, '0') }}]</span>
						</h3>
						<div class="flex flex-wrap gap-1.5">
							<TriageChip
								v-for="entry in group.entries"
								:key="entry.id"
								:primary="names(entry.id).primary"
								:secondary="names(entry.id).secondary"
								:selected="selected.includes(entry.id)"
								:lethal="entry.lethal"
								@toggle="toggle(entry.id)"
							/>
						</div>
					</div>
				</section>

				<!-- Results -->
				<section id="triage-results" ref="results" class="scroll-mt-20 space-y-5 lg:sticky lg:top-[calc(var(--ui-header-height)+1rem)] lg:max-h-[calc(100dvh-var(--ui-header-height)-2rem)] lg:overflow-y-auto lg:pe-1">
					<!-- Selected -->
					<div>
						<h2 class="micro flex items-center justify-between text-highlighted">
							<span><span class="text-dimmed">OUT //</span> {{ t('triage.selected') }}</span>
							<span class="text-dimmed">[{{ String(selected.length).padStart(2, '0') }}]</span>
						</h2>
						<div v-if="!selected.length" class="micro-frame mt-3 flex items-center gap-5 bg-elevated/40 px-5 py-6">
							<MicroGraphic name="orbit" spin class="size-20 text-muted" />
							<div>
								<p class="micro micro-cursor text-highlighted">{{ t('triage.awaiting') }}</p>
								<p class="mt-1 text-sm text-muted">{{ t('triage.nothingSelected') }}</p>
							</div>
						</div>
						<div v-else class="mt-3 flex flex-wrap gap-1.5">
							<button
								v-for="id in selected"
								:key="id"
								type="button"
								class="inline-flex items-center gap-2 border border-primary/50 bg-primary/10 px-2 py-1 font-mono text-xs text-highlighted transition-colors hover:bg-primary/20"
								@click="toggle(id)"
							>
								{{ names(id).primary }}
								<UIcon name="i-lucide-x" class="size-3 text-primary" />
							</button>
						</div>
					</div>

					<template v-if="result && selected.length">
						<!-- Treatment plan -->
						<MicroPanel :label="t('triage.plan')" :index="1" :meta="t('triage.steps', result.plan.length)" :description="t('triage.planDescription')" tone="primary">
							<p v-if="!result.plan.length" class="text-sm text-muted">{{ t('triage.noPlan') }}</p>
							<template v-else>
								<div v-if="result.plan.some(step => step.entry.firstAid.length)">
									<h3 class="micro mb-2 text-primary">&gt; {{ t('triage.firstAid') }}</h3>
									<ul class="space-y-2" style="--entry-link: var(--ui-primary)">
										<template v-for="step in result.plan" :key="`fa-${step.entry.id}`">
											<li v-for="(item, i) in step.entry.firstAid" :key="i" class="flex gap-2.5 leading-relaxed text-highlighted">
												<span class="mt-px font-mono text-xs text-primary" aria-hidden="true">!</span>
												<span>
													<ULink :to="`/${step.entry.id}`" class="me-2 font-mono text-xs uppercase tracking-wide text-muted hover:text-highlighted">{{ names(step.entry.id).primary }}</ULink>
													<EntryText :text="item.text" />
												</span>
											</li>
										</template>
									</ul>
								</div>
								<div class="mt-5">
									<h3 class="micro mb-2 text-muted">&gt; {{ t('triage.treatment') }}</h3>
									<ol>
										<li v-for="(step, n) in result.plan" :key="step.entry.id" class="flex gap-3 border-t border-dashed border-(--micro-line) py-3 first:border-t-0 first:pt-1">
											<span class="w-6 shrink-0 pt-0.5 font-mono text-xs text-dimmed">{{ String(n + 1).padStart(2, '0') }}</span>
											<div class="min-w-0">
												<ULink :to="`/${step.entry.id}`" class="inline-flex items-center gap-1.5 font-medium text-highlighted hover:underline">
													<UIcon v-if="step.entry.lethal" name="i-lucide-skull" class="size-3.5" :class="step.entry.lethal === 'lethal' ? 'text-error' : 'text-warning'" />
													{{ names(step.entry.id).primary }}
												</ULink>
												<ul class="mt-1 space-y-1 text-sm">
													<li v-for="(item, i) in step.entry.treatment" :key="i" class="leading-relaxed"><EntryText :text="item.text" /></li>
												</ul>
											</div>
										</li>
									</ol>
								</div>
								<div v-if="result.items.length" class="mt-4 border-t border-dashed border-(--micro-line) pt-3">
									<h3 class="micro mb-2 text-muted">&gt; {{ t('triage.items') }}</h3>
									<div class="flex flex-wrap gap-1.5">
										<ULink
											v-for="item in result.items"
											:key="item"
											:to="`/${item}`"
											class="border border-accented px-2 py-1 font-mono text-xs text-toned transition-colors hover:border-primary hover:text-highlighted"
										>{{ names(item).primary }}</ULink>
									</div>
								</div>
							</template>
						</MicroPanel>

						<!-- Check next -->
						<MicroPanel v-if="result.suggestions.length" :label="t('triage.checkNext')" :index="2" :description="t('triage.checkNextDescription')" tone="info">
							<div class="flex flex-wrap gap-1.5">
								<button
									v-for="suggestion in result.suggestions"
									:key="suggestion.id"
									type="button"
									class="flex min-h-11 items-center gap-2 border border-info/50 px-3 py-1.5 text-start transition-colors hover:bg-info/10"
									@click="add(suggestion.id)"
								>
									<UIcon name="i-lucide-plus" class="size-3.5 text-info" />
									<span class="leading-tight">
										<span class="block text-sm text-highlighted">{{ names(suggestion.id).primary }}</span>
										<span class="block font-mono text-[0.6875rem] text-muted">{{ t('triage.splits', { splits: suggestion.splits, of: suggestion.of }) }}</span>
									</span>
								</button>
							</div>
						</MicroPanel>

						<!-- Likely causes -->
						<MicroPanel :label="t('triage.causes')" :index="result.suggestions.length ? 3 : 2" :description="t('triage.causesDescription')">
							<template #meta>
								<MicroGraphic name="target" class="size-4 text-muted" />
							</template>
							<p v-if="!result.unexplained.length" class="text-sm text-muted">{{ t('triage.allExplained') }}</p>
							<div v-else-if="!result.candidates.length" class="flex items-center gap-3 text-sm text-muted">
								<MicroGraphic name="forbidden" class="size-5" />{{ t('triage.noCauses') }}
							</div>
							<ul v-else>
								<li v-for="candidate in result.candidates.slice(0, 8)" :key="candidate.entry.id" class="border-t border-dashed border-(--micro-line) py-3 first:border-t-0 first:pt-0 last:pb-0">
									<div class="flex items-start justify-between gap-3">
										<div class="min-w-0">
											<div class="flex flex-wrap items-baseline gap-x-2">
												<ULink :to="`/${candidate.entry.id}`" class="inline-flex items-center gap-1.5 font-medium text-highlighted hover:underline">
													<UIcon v-if="candidate.entry.lethal" name="i-lucide-skull" class="size-3.5" :class="candidate.entry.lethal === 'lethal' ? 'text-error' : 'text-warning'" />{{ names(candidate.entry.id).primary }}
												</ULink>
												<span v-if="names(candidate.entry.id).secondary" class="font-mono text-xs text-muted">{{ names(candidate.entry.id).secondary }}</span>
											</div>
											<p class="mt-1.5 flex items-center gap-2 text-sm">
												<MicroBar :value="candidate.explains.length / result.unexplained.length * 100" />
												<span class="font-mono text-xs text-primary">{{ candidate.explains.length }}/{{ result.unexplained.length }}</span>
												<span class="text-toned">{{ t('triage.explains', { list: nameList(candidate.explains) }) }}</span>
											</p>
											<p v-if="candidate.alsoLookFor.length" class="mt-1 text-xs text-muted">
												<span class="micro text-dimmed">{{ t('triage.alsoLookFor') }}:</span> {{ nameList(candidate.alsoLookFor) }}
											</p>
										</div>
										<UButton :label="t('triage.markPresent')" icon="i-lucide-plus" size="xs" color="primary" variant="outline" class="micro shrink-0" @click="add(candidate.entry.id)" />
									</div>
								</li>
							</ul>
						</MicroPanel>
					</template>
				</section>
			</div>

			<!-- On phones the results are below the chips: a shortcut to them. -->
			<div v-if="selected.length && !resultsVisible" class="fixed inset-x-4 bottom-4 z-10 lg:hidden">
				<UButton :label="t('triage.jumpToResults', { count: selected.length })" icon="i-lucide-arrow-down" block size="lg" class="micro" @click="scrollToResults" />
			</div>
		</ClientOnly>
	</UContainer>
</template>
