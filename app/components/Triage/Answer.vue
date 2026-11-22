<script setup lang="ts">
/**
 * The answer, which leads the page: conditions already known to be present
 * (treat now), then the most likely cause of what's unexplained in display
 * type with its first aid in the accent colour, the single hottest thing on
 * screen. Other candidates sit below as a short ranked list that physically
 * reorders as evidence arrives; tapping one looks at it instead.
 */
const props = defineProps<{
	result: TriageResult
	focusId: string | null
	nameOf: (id: string) => { primary: string, secondary?: string }
}>()
defineEmits<{
	focus: [id: string | null]
	confirm: [id: string]
	treat: []
}>()

const { t, locale } = useI18n()

const leader = computed(() =>
	props.result.candidates.find(candidate => candidate.entry.id === props.focusId) ?? props.result.candidates[0] ?? null)
/**
 * Conditions known to be present lead. Symptom relief (a symptom's own
 * treatment, e.g. for nausea) doesn't: it would push the cause off the top.
 * It still runs in the treatment step-through, after the conditions.
 */
const known = computed(() => props.result.plan.filter(step => step.entry.type === 'afflictions'))
const focused = computed(() => !!leader.value && leader.value !== props.result.candidates[0])
const others = computed(() => props.result.candidates.filter(candidate => candidate !== leader.value).slice(0, 5))

const join = (ids: string[]) => ids.map(id => props.nameOf(id).primary).join(locale.value === 'zh' ? '、' : ', ')
const lethalLabel = (lethal?: string) => lethal === 'lethal' ? t('entry.lethal') : lethal === 'possibly-lethal' ? t('entry.possiblyLethal') : ''
/** The bar's width is relative to the leader's share, so the leader reads as full when it clearly leads. */
const barOf = (share: number) => `${Math.max(4, Math.round(share / (props.result.candidates[0]?.share || 1) * 100))}%`
</script>

<template>
	<div class="space-y-14">
		<!-- Known conditions: treat now -->
		<section v-if="known.length">
			<p class="micro text-primary">{{ t('triage.treatNow') }}</p>
			<ul class="mt-3 space-y-4">
				<Motion
					v-for="step in known"
					:key="step.entry.id"
					as="li"
					layout
					:initial="APPEAR.initial"
					:animate="APPEAR.animate"
					:transition="SPRING_SOFT"
				>
					<p class="flex flex-wrap items-baseline gap-x-3">
						<NuxtLink :to="`/${step.entry.id}`" class="font-brand text-3xl font-semibold tracking-tight text-highlighted hover:underline">
							{{ nameOf(step.entry.id).primary }}
						</NuxtLink>
						<span v-if="step.entry.lethal" class="text-sm" :class="step.entry.lethal === 'lethal' ? 'text-error' : 'text-warning'">{{ lethalLabel(step.entry.lethal) }}</span>
					</p>
					<p v-if="step.entry.firstAid[0]" class="mt-1 text-xl text-primary" style="--entry-link: var(--ui-primary)">
						→ <EntryText :text="step.entry.firstAid[0].text" />
					</p>
					<p v-else-if="step.entry.treatment[0]" class="mt-1 text-xl text-toned">
						→ <EntryText :text="step.entry.treatment[0].text" />
					</p>
				</Motion>
			</ul>
			<Motion
				as="button"
				type="button"
				:while-press="PRESS"
				class="mt-6 inline-flex items-center gap-3 rounded-md bg-primary px-6 py-3.5 text-lg font-medium text-inverted transition-opacity hover:opacity-90"
				@click="$emit('treat')"
			>
				<UIcon name="i-lucide-play" class="size-5" />
				{{ t('triage.startTreatment') }}
			</Motion>
		</section>

		<!-- Most likely cause of what's unexplained -->
		<section v-if="leader">
			<div class="flex items-start justify-between gap-6">
				<div class="min-w-0">
					<p class="micro text-muted">
						{{ focused ? t('triage.lookingAt') : t('triage.mostLikely') }}
						<button v-if="focused" type="button" class="ms-2 text-dimmed underline underline-offset-2 hover:text-highlighted" @click="$emit('focus', null)">
							{{ t('triage.mostLikely') }}
						</button>
					</p>
					<AnimatePresence mode="wait">
						<Motion
							:key="leader.entry.id"
							v-bind="swap('y', 14)"
						>
							<h2 class="mt-2 font-brand text-5xl font-semibold leading-[1.02] tracking-tight text-highlighted sm:text-6xl">
								{{ nameOf(leader.entry.id).primary }}
							</h2>
							<p class="mt-2 flex flex-wrap items-baseline gap-x-3 text-lg">
								<span v-if="leader.entry.lethal" :class="leader.entry.lethal === 'lethal' ? 'text-error' : 'text-warning'">{{ lethalLabel(leader.entry.lethal) }}</span>
								<span v-if="nameOf(leader.entry.id).secondary" class="text-muted">{{ nameOf(leader.entry.id).secondary }}</span>
							</p>
						</Motion>
					</AnimatePresence>
				</div>
				<div class="hidden shrink-0 flex-col items-center gap-1 sm:flex">
					<TriageOrbit :count="result.candidates.length" :leader-lethal="result.candidates[0]?.entry.lethal === 'lethal'" class="size-28" />
					<span class="micro text-dimmed">{{ t('triage.candidates', result.candidates.length) }}</span>
				</div>
			</div>

			<!-- Evidence: share bar, what it explains, what counts against it -->
			<div class="mt-5 h-1 w-full max-w-md overflow-hidden rounded-full bg-accented">
				<Motion
					class="h-full rounded-full bg-primary"
					:initial="false"
					:animate="{ width: `${Math.round(leader.share * 100)}%` }"
					:transition="SPRING_SOFT"
				/>
			</div>
			<p class="mt-2 text-sm text-muted">
				{{ t('triage.explains', { list: join(leader.explains) }) }}<template v-if="leader.contradicts.length">
					· <span class="text-dimmed">{{ t('triage.against', { list: join(leader.contradicts) }) }}</span>
				</template>
			</p>

			<!-- What to do -->
			<AnimatePresence mode="wait">
				<Motion
					:key="leader.entry.id"
					v-bind="swap('y', 8)"
					class="mt-8"
				>
					<template v-if="leader.entry.firstAid.length">
						<p class="micro text-primary">{{ t('triage.firstAid') }}</p>
						<ul class="mt-2 space-y-2" style="--entry-link: var(--ui-primary)">
							<li v-for="(item, i) in leader.entry.firstAid" :key="i" class="flex gap-3 text-2xl leading-snug text-highlighted">
								<span class="text-primary" aria-hidden="true">→</span>
								<EntryText :text="item.text" />
							</li>
						</ul>
					</template>
					<template v-if="leader.entry.treatment.length">
						<p class="micro mt-6 text-muted">{{ leader.entry.firstAid.length ? t('triage.then') : t('sections.treatment') }}</p>
						<ul class="mt-2 space-y-1.5">
							<li v-for="(item, i) in leader.entry.treatment" :key="i" class="flex gap-3 text-lg leading-relaxed text-toned">
								<span class="text-dimmed" aria-hidden="true">·</span>
								<EntryText :text="item.text" />
							</li>
						</ul>
					</template>
					<p v-if="!leader.entry.firstAid.length && !leader.entry.treatment.length" class="text-lg text-muted">{{ t('triage.noTreatment') }}</p>

					<div class="mt-7 flex flex-wrap items-center gap-5">
						<Motion
							v-if="leader.entry.firstAid.length || leader.entry.treatment.length"
							as="button"
							type="button"
							:while-press="PRESS"
							class="inline-flex items-center gap-3 rounded-md bg-primary px-6 py-3.5 text-lg font-medium text-inverted transition-opacity hover:opacity-90"
							@click="$emit('confirm', leader.entry.id)"
						>
							<UIcon name="i-lucide-check" class="size-5" />
							{{ t('triage.confirm') }}
						</Motion>
						<NuxtLink :to="`/${leader.entry.id}`" class="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-highlighted">
							{{ t('triage.open') }} <UIcon name="i-lucide-arrow-up-right" class="size-4" />
						</NuxtLink>
					</div>
				</Motion>
			</AnimatePresence>
		</section>

		<p v-else-if="result.unexplained.length" class="text-xl text-muted">
			{{ t('triage.noCauses', { list: join(result.unexplained) }) }}
		</p>

		<!-- Also possible: reorders as evidence arrives -->
		<section v-if="others.length">
			<p class="micro text-dimmed">{{ t('triage.alsoPossible') }}</p>
			<ul class="mt-3">
				<AnimatePresence :initial="false">
					<Motion
						v-for="candidate in others"
						:key="candidate.entry.id"
						as="li"
						layout
						:initial="{ opacity: 0, x: -12 }"
						:animate="{ opacity: 1, x: 0 }"
						:exit="{ opacity: 0, x: 12 }"
						:transition="SPRING"
					>
						<button
							type="button"
							class="group flex w-full items-center gap-4 py-2.5 text-start"
							@click="$emit('focus', candidate.entry.id)"
						>
							<span class="min-w-0 flex-1 truncate text-xl text-toned transition-colors group-hover:text-highlighted">
								{{ nameOf(candidate.entry.id).primary }}
								<span
									v-if="candidate.entry.lethal"
									class="ms-1 inline-block size-1.5 -translate-y-1 rounded-full"
									:class="candidate.entry.lethal === 'lethal' ? 'bg-error' : 'bg-warning'"
									:aria-label="lethalLabel(candidate.entry.lethal)"
								/>
							</span>
							<span class="h-0.5 w-24 shrink-0 overflow-hidden rounded-full bg-accented sm:w-32">
								<Motion
									class="h-full rounded-full bg-(--ui-text-muted) transition-colors group-hover:bg-primary"
									:initial="false"
									:animate="{ width: barOf(candidate.share) }"
									:transition="SPRING_SOFT"
								/>
							</span>
						</button>
					</Motion>
				</AnimatePresence>
			</ul>
		</section>
	</div>
</template>
