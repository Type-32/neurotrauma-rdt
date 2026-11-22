<script setup lang="ts">
/**
 * Triage, the home page, as a guided flow: "What do you see?" with one input
 * and the findings as plain words. Picked findings fly to the patient strip;
 * the most likely cause and its first aid take over as the answer; one
 * question at a time narrows it down; treatment runs as a step-through.
 * Logic is in shared/utils/triage.ts.
 *
 * The patient lives in the URL (?f=s:headache,a:pneumothorax for what's seen,
 * &x=s:vomiting for what's ruled out), so a link shares the patient and Back
 * undoes the last change. The data is /triage-index.json, loaded in the
 * browser.
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

const selected = computed(() => decode(route.query.f))
const ruledOut = computed(() => decode(route.query.x).filter(id => !selected.value.includes(id)))

function setPatient(nextSelected: string[], nextRuledOut: string[]) {
	const query: Record<string, string> = {}
	if (nextSelected.length) query.f = encode(nextSelected)
	if (nextRuledOut.length) query.x = encode(nextRuledOut)
	router.push({ query })
}
const without = (ids: string[], id: string) => ids.filter(other => other !== id)

function see(id: string) {
	if (!selected.value.includes(id)) setPatient([...selected.value, id], without(ruledOut.value, id))
}
function ruleOut(id: string) {
	if (!ruledOut.value.includes(id)) setPatient(without(selected.value, id), [...ruledOut.value, id])
}

const result = computed(() => triage.value?.evaluate(selected.value, ruledOut.value) ?? null)
const hasPatient = computed(() => selected.value.length + ruledOut.value.length > 0)

// --- Names ----------------------------------------------------------------------
function nameOf(id: string) {
	const entry = index.value?.names[id]
	return entry ? entryNames({ title: entry.nameZh, ...entry }, locale.value) : { primary: id }
}
function lethalOf(id: string) {
	return triage.value?.entry(id)?.lethal
}

// --- Findings that can be picked ---------------------------------------------------
const observable = computed(() => index.value?.entries.filter(entry => triage.value!.isObservable(entry.id)) ?? [])
const onStrip = computed(() => [...selected.value, ...ruledOut.value])
const weightOf = (id: string) => triage.value?.causesOf(id).length ?? 0

// --- Questions: one at a time; "Can't tell" skips for this patient -------------------
const skipped = ref<string[]>([])
const question = computed(() => result.value?.suggestions.find(suggestion => !skipped.value.includes(suggestion.id)) ?? null)

function answer(reply: 'yes' | 'no' | 'unsure') {
	const id = question.value?.id
	if (!id) return
	if (reply === 'yes') see(id)
	else if (reply === 'no') ruleOut(id)
	else skipped.value = [...skipped.value, id]
}

// Y / N / Space answer the question, unless typing in a field or the treatment is open.
useEventListener(window, 'keydown', (event: KeyboardEvent) => {
	if (!question.value || treating.value || event.metaKey || event.ctrlKey || event.altKey) return
	const target = event.target as HTMLElement | null
	if (target?.closest('input, textarea, [contenteditable="true"], button, a')) return
	const key = event.key.toLowerCase()
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
	setPatient([], [])
}
</script>

<template>
	<div class="mx-auto w-full max-w-6xl px-5 sm:px-8">
		<ClientOnly>
			<template #fallback>
				<div class="mx-auto max-w-3xl pt-[10vh]">
					<h1 class="font-brand text-5xl font-semibold leading-none tracking-tight text-highlighted sm:text-7xl">{{ t('triage.prompt') }}</h1>
					<p class="mt-5 max-w-xl text-lg text-muted">{{ t('triage.description') }}</p>
				</div>
			</template>

			<div v-if="failed" class="mx-auto max-w-3xl pt-[10vh] text-xl text-error">{{ t('triage.failed') }}</div>

			<div v-else-if="!index" class="mx-auto max-w-3xl pt-[10vh]">
				<h1 class="font-brand text-5xl font-semibold leading-none tracking-tight text-highlighted sm:text-7xl">{{ t('triage.prompt') }}</h1>
				<p class="mt-5 max-w-xl text-lg text-muted">{{ t('triage.description') }}</p>
			</div>

			<LayoutGroup v-else>
				<!-- Nothing yet: one question, centred -->
				<div v-if="!hasPatient" class="mx-auto max-w-3xl pt-[10vh]">
					<Motion layout-id="prompt" as="h1" :transition="SPRING_SOFT" class="font-brand text-5xl font-semibold leading-none tracking-tight text-highlighted sm:text-7xl">
						{{ t('triage.prompt') }}
					</Motion>
					<Motion as="p" :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" :transition="{ ...EASE, delay: 0.1 }" class="mt-5 max-w-xl text-lg text-muted">
						{{ t('triage.description') }}
					</Motion>
					<TriagePicker class="mt-12" :entries="observable" :exclude="onStrip" :weight-of="weightOf" @pick="see" />
				</div>

				<!-- A patient: the answer leads -->
				<div v-else class="pt-2">
					<TriageStrip
						:selected="selected"
						:ruled-out="ruledOut"
						:name-of="nameOf"
						:lethal-of="lethalOf"
						@remove="id => setPatient(without(selected, id), ruledOut)"
						@restore="id => setPatient(selected, without(ruledOut, id))"
						@share="share"
						@clear="clear"
					/>

					<div class="mt-12 grid gap-x-20 gap-y-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
						<TriageAnswer
							v-if="result"
							:result="result"
							:focus-id="focusId"
							:name-of="nameOf"
							@focus="id => focusId = id"
							@confirm="confirm"
							@treat="treating = true"
						/>

						<div class="space-y-16">
							<TriageQuestion v-if="question" :suggestion="question" :name-of="nameOf" @answer="answer" />
							<div>
								<Motion layout-id="prompt" as="h2" :transition="SPRING_SOFT" class="font-brand text-2xl font-semibold tracking-tight text-highlighted">
									{{ t('triage.promptMore') }}
								</Motion>
								<TriagePicker class="mt-5" compact :entries="observable" :exclude="onStrip" :weight-of="weightOf" @pick="see" />
							</div>
						</div>
					</div>
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
