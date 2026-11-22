<script setup lang="ts">
/**
 * Triage, the home page, in two clear steps.
 *
 * 1. Pick: "What do you see?" Tap every finding on the patient (multi-select:
 *    words mark in place). A bar at the bottom shows how many are picked and
 *    a live preview of the likely cause, with "Get answer".
 * 2. Answer: one column, read top to bottom. The patient strip (picked words
 *    fly into it), the most likely cause, then right under it the question
 *    that narrows it down, then what to do, then the other possible causes.
 *    "Add what else you see" goes back to step 1 with everything kept.
 *
 * Treatment runs as a step-through. Logic is in shared/utils/triage.ts.
 *
 * The patient lives in the URL: ?f=s:headache,a:pneumothorax (seen),
 * &x=s:vomiting (ruled out), &a=1 (answer step). A link shares the patient,
 * and Back undoes the last answer. The data is /triage-index.json, loaded in
 * the browser.
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

// --- The patient, stored in the URL --------------------------------------------
const PREFIXES = { s: 'symptoms', a: 'afflictions' } as const

function decode(value: unknown): string[] {
	return String(value ?? '')
		.split(',')
		.map((code) => {
			const [prefix, slug] = code.split(':')
			const type = PREFIXES[prefix as keyof typeof PREFIXES]
			return type && slug ? `${type}/${slug}` : null
		})
		.filter((id): id is string => !!id)
}
function encode(ids: string[]): string {
	return ids.map(id => `${id.startsWith('symptoms/') ? 's' : 'a'}:${id.split('/')[1]}`).join(',')
}

/**
 * Local state, updated at once on every tap and then written to the URL. Reading
 * straight from the URL would lose quick taps: a second tap would read the
 * query before the first tap's navigation had landed. The watcher keeps it in
 * step with Back / Forward and with links.
 */
const selected = ref<string[]>([])
const ruledOut = ref<string[]>([])
const answerStep = ref(false)
watch(() => route.query, (query) => {
	selected.value = decode(query.f)
	ruledOut.value = decode(query.x).filter(id => !selected.value.includes(id))
	answerStep.value = query.a === '1'
}, { immediate: true })

/** Step 2 needs something picked; a bare ?a=1 shows step 1. */
const answering = computed(() => answerStep.value && selected.value.length + ruledOut.value.length > 0)

/**
 * Picking replaces the history entry (a dozen taps shouldn't take a dozen
 * Backs); moving between steps and answering questions push one.
 */
function setPatient(nextSelected: string[], nextRuledOut: string[], options: { answer?: boolean, push?: boolean } = {}) {
	const query: Record<string, string> = {}
	if (nextSelected.length) query.f = encode(nextSelected)
	if (nextRuledOut.length) query.x = encode(nextRuledOut)
	const answer = options.answer ?? answering.value
	if (answer) query.a = '1'
	const push = options.push ?? answering.value
	selected.value = nextSelected
	ruledOut.value = nextRuledOut
	answerStep.value = answer
	if (push) router.push({ query })
	else router.replace({ query })
}
const without = (ids: string[], id: string) => ids.filter(other => other !== id)

function toggle(id: string) {
	if (selected.value.includes(id)) setPatient(without(selected.value, id), ruledOut.value)
	else if (ruledOut.value.includes(id)) setPatient(selected.value, without(ruledOut.value, id))
	else setPatient([...selected.value, id], ruledOut.value)
}
function see(id: string) {
	if (!selected.value.includes(id)) setPatient([...selected.value, id], without(ruledOut.value, id))
}
function ruleOut(id: string) {
	if (!ruledOut.value.includes(id)) setPatient(without(selected.value, id), [...ruledOut.value, id])
}
function showAnswer() {
	if (selected.value.length) setPatient(selected.value, ruledOut.value, { answer: true, push: true })
}
function editFindings() {
	setPatient(selected.value, ruledOut.value, { answer: false, push: true })
}

const result = computed(() => triage.value?.evaluate(selected.value, ruledOut.value) ?? null)

// --- Names ----------------------------------------------------------------------
function nameOf(id: string) {
	const entry = index.value?.names[id]
	return entry ? entryNames({ title: entry.nameZh, ...entry }, locale.value) : { primary: id }
}
function lethalOf(id: string) {
	return triage.value?.entry(id)?.lethal
}

// --- Step 1: findings and the live preview -------------------------------------------
const observable = computed(() => index.value?.entries.filter(entry => triage.value!.isObservable(entry.id)) ?? [])
const weightOf = (id: string) => triage.value?.causesOf(id).length ?? 0

const preview = computed(() => {
	const known = result.value?.plan.find(step => step.entry.type === 'afflictions')
	if (known) return t('triage.previewTreat', { name: nameOf(known.entry.id).primary })
	const leader = result.value?.candidates[0]
	return leader ? t('triage.previewLikely', { name: nameOf(leader.entry.id).primary }) : t('triage.previewNone')
})

// --- Step 2: one question at a time; "Can't tell" skips it for this patient -----------
const skipped = ref<string[]>([])
const question = computed(() => result.value?.suggestions.find(suggestion => !skipped.value.includes(suggestion.id)) ?? null)

function answer(reply: 'yes' | 'no' | 'unsure') {
	const id = question.value?.id
	if (!id) return
	if (reply === 'yes') see(id)
	else if (reply === 'no') ruleOut(id)
	else skipped.value = [...skipped.value, id]
}

// Keys: step 1, Enter gets the answer; step 2, Y / N / Space answer the question.
// Not while typing in a field or with the treatment open.
useEventListener(window, 'keydown', (event: KeyboardEvent) => {
	if (treating.value || event.metaKey || event.ctrlKey || event.altKey) return
	const target = event.target as HTMLElement | null
	if (target?.closest('input, textarea, [contenteditable="true"], button, a')) return
	const key = event.key.toLowerCase()
	if (!answering.value) {
		if (key === 'enter') showAnswer()
		return
	}
	if (!question.value) return
	if (key === 'y') answer('yes')
	else if (key === 'n') answer('no')
	else if (key === ' ') {
		event.preventDefault()
		answer('unsure')
	}
})

// --- Looking at another candidate -----------------------------------------------------
const focusId = ref<string | null>(null)
watch(result, (next) => {
	if (focusId.value && !next?.candidates.some(candidate => candidate.entry.id === focusId.value)) focusId.value = null
})

// --- Treatment step-through -----------------------------------------------------------
const treating = ref(false)
async function confirm(id: string) {
	focusId.value = null
	see(id)
	await nextTick()
	treating.value = true
}

// --- Share and clear -------------------------------------------------------------------
async function share() {
	try {
		await navigator.clipboard.writeText(window.location.href)
		toast.add({ title: t('triage.copied'), description: t('triage.copiedDescription'), icon: 'i-lucide-link' })
	}
	catch {
		// Clipboard can be blocked; the address bar still has the link.
	}
}
function clear() {
	skipped.value = []
	focusId.value = null
	setPatient([], [], { answer: false, push: true })
}
</script>

<template>
	<div class="mx-auto w-full px-5 sm:px-8" :class="answering ? 'max-w-3xl' : 'max-w-4xl'">
		<ClientOnly>
			<template #fallback>
				<div class="pt-[8vh]">
					<h1 class="font-brand text-5xl font-semibold leading-none tracking-tight text-highlighted sm:text-7xl">{{ t('triage.prompt') }}</h1>
					<p class="mt-5 max-w-xl text-lg text-muted">{{ t('triage.description') }}</p>
				</div>
			</template>

			<div v-if="failed" class="pt-[8vh] text-xl text-error">{{ t('triage.failed') }}</div>

			<div v-else-if="!index" class="pt-[8vh]">
				<h1 class="font-brand text-5xl font-semibold leading-none tracking-tight text-highlighted sm:text-7xl">{{ t('triage.prompt') }}</h1>
				<p class="mt-5 max-w-xl text-lg text-muted">{{ t('triage.description') }}</p>
			</div>

			<LayoutGroup v-else>
				<!-- Step 1: pick everything you see -->
				<div v-if="!answering" class="pb-28 pt-[8vh]">
					<h1 class="font-brand text-5xl font-semibold leading-none tracking-tight text-highlighted sm:text-7xl">{{ t('triage.prompt') }}</h1>
					<p class="mt-5 max-w-xl text-lg text-muted">{{ t('triage.description') }}</p>
					<TriagePicker class="mt-12" :entries="observable" :selected="selected" :ruled-out="ruledOut" :weight-of="weightOf" @toggle="toggle" />

					<!-- The step's action: what's picked, a live preview, and Get answer -->
					<div class="pointer-events-none fixed inset-x-0 bottom-[5.25rem] z-40 flex justify-center px-3 sm:bottom-24">
						<AnimatePresence>
							<Motion
								v-if="selected.length"
								key="pick-bar"
								:initial="{ opacity: 0, y: 24 }"
								:animate="{ opacity: 1, y: 0 }"
								:exit="{ opacity: 0, y: 24 }"
								:transition="SPRING_SOFT"
								class="pointer-events-auto flex w-full max-w-xl items-center gap-4 rounded-xl bg-inverted py-2.5 pe-2.5 ps-5 text-inverted shadow-[0_12px_40px_-12px_rgb(0_0_0/0.5)]"
							>
								<div class="min-w-0 flex-1">
									<p class="font-mono text-xs uppercase tracking-wider opacity-60">{{ t('triage.picked', selected.length) }}</p>
									<AnimatePresence mode="wait" :initial="false">
										<Motion :key="preview" v-bind="swap('y', 8)" as="p" class="truncate text-base">{{ preview }}</Motion>
									</AnimatePresence>
								</div>
								<Motion
									as="button"
									type="button"
									:while-press="PRESS"
									class="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-3 text-lg font-medium text-white transition-opacity hover:opacity-90"
									@click="showAnswer"
								>
									{{ t('triage.getAnswer') }}
									<UIcon name="i-lucide-arrow-right" class="size-5" />
								</Motion>
							</Motion>
						</AnimatePresence>
					</div>
				</div>

				<!-- Step 2: the answer, one column, top to bottom -->
				<div v-else class="pt-2">
					<div class="flex flex-wrap items-center justify-between gap-2">
						<button type="button" class="-ms-2 inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-muted transition-colors hover:text-highlighted" @click="editFindings">
							<UIcon name="i-lucide-arrow-left" class="size-4" />{{ t('triage.editFindings') }}
						</button>
						<div class="flex items-center gap-1">
							<UButton :label="t('triage.share')" icon="i-lucide-link" color="neutral" variant="ghost" size="sm" class="text-muted" @click="share" />
							<UButton :label="t('triage.clear')" icon="i-lucide-rotate-ccw" color="neutral" variant="ghost" size="sm" class="text-muted" @click="clear" />
						</div>
					</div>

					<TriageStrip
						class="mt-4"
						:selected="selected"
						:ruled-out="ruledOut"
						:name-of="nameOf"
						:lethal-of="lethalOf"
						@remove="id => setPatient(without(selected, id), ruledOut)"
						@restore="id => setPatient(selected, without(ruledOut, id))"
					/>

					<TriageAnswer
						v-if="result"
						class="mt-12"
						:result="result"
						:focus-id="focusId"
						:name-of="nameOf"
						@focus="id => focusId = id"
						@confirm="confirm"
						@treat="treating = true"
					>
						<template v-if="question" #narrow>
							<TriageQuestion :suggestion="question" :name-of="nameOf" @answer="answer" />
						</template>
					</TriageAnswer>

					<button
						type="button"
						class="mt-16 inline-flex items-center gap-2 rounded-md border border-dashed border-accented px-5 py-3 text-lg text-toned transition-colors hover:border-(--ui-text-muted) hover:text-highlighted"
						@click="editFindings"
					>
						<UIcon name="i-lucide-plus" class="size-5" />{{ t('triage.addMore') }}
					</button>
				</div>
			</LayoutGroup>

			<AnimatePresence>
				<TriageTreatment
					v-if="treating && result?.plan.length"
					key="treatment"
					:plan="result.plan"
					:items="result.items"
					:name-of="nameOf"
					@close="treating = false"
				/>
			</AnimatePresence>
		</ClientOnly>
	</div>
</template>
