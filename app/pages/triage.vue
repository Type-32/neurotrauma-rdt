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

function scrollToResults() {
	document.getElementById('triage-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
	<UContainer class="pb-24 lg:pb-16">
		<UPageHeader :title="t('triage.title')" :description="t('triage.description')">
			<template #links>
				<UButton :label="t('triage.share')" icon="i-lucide-link" color="neutral" variant="outline" :disabled="!selected.length" @click="share" />
				<UButton :label="t('triage.clear')" icon="i-lucide-eraser" color="neutral" variant="outline" :disabled="!selected.length" @click="setSelected([])" />
			</template>
		</UPageHeader>

		<ClientOnly>
			<template #fallback>
				<p class="mt-8 text-muted">{{ t('triage.loading') }}</p>
			</template>

			<p v-if="failed" class="mt-8 text-error">{{ t('triage.failed') }}</p>
			<p v-else-if="!index" class="mt-8 text-muted">{{ t('triage.loading') }}</p>

			<div v-else class="mt-8 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
				<!-- What you see -->
				<section>
					<div class="flex items-center justify-between gap-4">
						<h2 class="text-lg font-semibold text-highlighted">{{ t('triage.findings') }}</h2>
						<UInput v-model="filter" icon="i-lucide-filter" :placeholder="t('triage.filter')" class="w-40" />
					</div>
					<div v-for="group in groups" :key="group.id" class="mt-5">
						<h3 class="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{{ t(`triage.groups.${group.id}`) }}</h3>
						<div class="flex flex-wrap gap-2">
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
				<section id="triage-results" class="scroll-mt-20 space-y-6 lg:sticky lg:top-[calc(var(--ui-header-height)+1rem)] lg:max-h-[calc(100dvh-var(--ui-header-height)-2rem)] lg:overflow-y-auto lg:pe-1">
					<!-- Selected -->
					<div>
						<h2 class="text-lg font-semibold text-highlighted">{{ t('triage.selected') }}</h2>
						<p v-if="!selected.length" class="mt-2 text-muted">{{ t('triage.nothingSelected') }}</p>
						<div v-else class="mt-2 flex flex-wrap gap-2">
							<UBadge
								v-for="id in selected"
								:key="id"
								:label="names(id).primary"
								color="primary"
								variant="subtle"
								size="lg"
								trailing-icon="i-lucide-x"
								class="cursor-pointer"
								role="button"
								@click="toggle(id)"
							/>
						</div>
					</div>

					<template v-if="result && selected.length">
						<!-- Treatment plan -->
						<UPageCard :title="t('triage.plan')" :description="t('triage.planDescription')" variant="subtle" highlight highlight-color="primary">
							<p v-if="!result.plan.length" class="text-muted">{{ t('triage.noPlan') }}</p>
							<template v-else>
								<div v-if="result.plan.some(step => step.entry.firstAid.length)">
									<h3 class="mb-2 text-sm font-semibold uppercase tracking-wide text-error">{{ t('triage.firstAid') }}</h3>
									<ul class="space-y-2">
										<template v-for="step in result.plan" :key="`fa-${step.entry.id}`">
											<li v-for="(item, i) in step.entry.firstAid" :key="i" class="leading-relaxed">
												<ULink :to="`/${step.entry.id}`" class="me-2 font-semibold text-highlighted hover:underline">{{ names(step.entry.id).primary }}</ULink>
												<EntryText :text="item.text" />
											</li>
										</template>
									</ul>
								</div>
								<div class="mt-5">
									<h3 class="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{{ t('triage.treatment') }}</h3>
									<ol class="space-y-3">
										<li v-for="(step, n) in result.plan" :key="step.entry.id" class="flex gap-3">
											<span class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-semibold">{{ n + 1 }}</span>
											<div class="min-w-0">
												<ULink :to="`/${step.entry.id}`" class="font-semibold text-highlighted hover:underline">{{ names(step.entry.id).primary }}</ULink>
												<UIcon v-if="step.entry.lethal" name="i-lucide-skull" class="ms-1 size-4 align-[-2px]" :class="step.entry.lethal === 'lethal' ? 'text-error' : 'text-warning'" />
												<ul class="mt-1 space-y-1">
													<li v-for="(item, i) in step.entry.treatment" :key="i" class="leading-relaxed"><EntryText :text="item.text" /></li>
												</ul>
											</div>
										</li>
									</ol>
								</div>
								<div v-if="result.items.length" class="mt-5">
									<h3 class="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{{ t('triage.items') }}</h3>
									<div class="flex flex-wrap gap-2">
										<UButton
											v-for="item in result.items"
											:key="item"
											:to="`/${item}`"
											:label="names(item).primary"
											icon="i-lucide-pill"
											color="neutral"
											variant="subtle"
											size="sm"
										/>
									</div>
								</div>
							</template>
						</UPageCard>

						<!-- Check next -->
						<UPageCard v-if="result.suggestions.length" :title="t('triage.checkNext')" :description="t('triage.checkNextDescription')" variant="subtle" highlight highlight-color="info">
							<div class="flex flex-wrap gap-2">
								<UButton
									v-for="suggestion in result.suggestions"
									:key="suggestion.id"
									icon="i-lucide-plus"
									color="info"
									variant="outline"
									class="min-h-11"
									@click="add(suggestion.id)"
								>
									<span class="flex flex-col items-start text-start leading-tight">
										<span>{{ names(suggestion.id).primary }}</span>
										<span class="text-xs opacity-70">{{ t('triage.splits', { splits: suggestion.splits, of: suggestion.of }) }}</span>
									</span>
								</UButton>
							</div>
						</UPageCard>

						<!-- Likely causes -->
						<UPageCard :title="t('triage.causes')" :description="t('triage.causesDescription')" variant="subtle">
							<p v-if="!result.unexplained.length" class="text-muted">{{ t('triage.allExplained') }}</p>
							<p v-else-if="!result.candidates.length" class="text-muted">{{ t('triage.noCauses') }}</p>
							<ul v-else class="divide-y divide-default">
								<li v-for="candidate in result.candidates.slice(0, 8)" :key="candidate.entry.id" class="py-3 first:pt-0 last:pb-0">
									<div class="flex items-start justify-between gap-3">
										<div class="min-w-0">
											<ULink :to="`/${candidate.entry.id}`" class="font-semibold text-highlighted hover:underline">
												<UIcon v-if="candidate.entry.lethal" name="i-lucide-skull" class="me-1 size-4 align-[-2px]" :class="candidate.entry.lethal === 'lethal' ? 'text-error' : 'text-warning'" />{{ names(candidate.entry.id).primary }}
											</ULink>
											<span v-if="names(candidate.entry.id).secondary" class="ms-2 text-sm text-muted">{{ names(candidate.entry.id).secondary }}</span>
											<p class="mt-1 text-sm">
												<span class="font-medium text-primary">{{ candidate.explains.length }}/{{ result.unexplained.length }}</span>
												· {{ t('triage.explains', { list: nameList(candidate.explains) }) }}
											</p>
											<p v-if="candidate.alsoLookFor.length" class="mt-1 text-sm text-muted">
												{{ t('triage.alsoLookFor') }}: {{ nameList(candidate.alsoLookFor) }}
											</p>
										</div>
										<UButton :label="t('triage.markPresent')" icon="i-lucide-plus" size="sm" color="primary" variant="soft" @click="add(candidate.entry.id)" />
									</div>
								</li>
							</ul>
						</UPageCard>
					</template>
				</section>
			</div>

			<!-- On phones the results are below the chips: a shortcut to them. -->
			<div v-if="selected.length" class="fixed inset-x-4 bottom-4 z-10 lg:hidden">
				<UButton :label="t('triage.jumpToResults', { count: selected.length })" icon="i-lucide-arrow-down" block size="lg" @click="scrollToResults" />
			</div>
		</ClientOnly>
	</UContainer>
</template>
