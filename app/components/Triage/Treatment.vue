<script setup lang="ts">
/**
 * Treatment as a step-through: the plan takes over the screen, one step at a
 * time in large type, with what to bring listed once at the start. Finishing
 * a step collapses it to a struck-through line and the next one rises. A thin
 * progress line is the only decoration. Enter or Space: done; Backspace: back;
 * Esc: close.
 */
const props = defineProps<{
	plan: PlanStep[]
	items: string[]
	nameOf: (id: string) => { primary: string, secondary?: string }
}>()
const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()

interface Step { id: string, condition: string, kind: 'firstAid' | 'treatment', text: string, lethal?: string }

const steps = computed<Step[]>(() => props.plan.flatMap(({ entry }) => [
	...entry.firstAid.map((item, i) => ({ id: `${entry.id}-a${i}`, condition: entry.id, kind: 'firstAid' as const, text: item.text, lethal: entry.lethal })),
	...entry.treatment.map((item, i) => ({ id: `${entry.id}-t${i}`, condition: entry.id, kind: 'treatment' as const, text: item.text, lethal: entry.lethal })),
]))

const current = ref(0)
const finished = computed(() => current.value >= steps.value.length)
const progress = computed(() => steps.value.length ? current.value / steps.value.length : 0)

function next() {
	if (!finished.value) current.value++
}
function back() {
	if (current.value > 0) current.value--
}

const panel = useTemplateRef<HTMLElement>('panel')
onMounted(() => panel.value?.focus())

// On the window, so the keys work wherever focus is inside the overlay.
useEventListener(window, 'keydown', (event: KeyboardEvent) => {
	if (event.target instanceof HTMLElement && event.target.closest('a, button') && event.key !== 'Escape') return
	if (event.key === 'Escape') emit('close')
	else if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		if (finished.value) emit('close')
		else next()
	}
	else if (event.key === 'Backspace') {
		event.preventDefault()
		back()
	}
})
</script>

<template>
	<Motion
		as="div"
		class="fixed inset-0 z-[60] overflow-y-auto bg-default"
		:initial="{ y: '6%', opacity: 0 }"
		:animate="{ y: 0, opacity: 1 }"
		:exit="{ y: '6%', opacity: 0 }"
		:transition="SPRING_SOFT"
		role="dialog"
		aria-modal="true"
		:aria-label="t('triage.treatment')"
	>
		<!-- Progress -->
		<div class="sticky top-0 z-10 h-1 bg-accented/60">
			<Motion
				class="h-full"
				:class="finished ? 'bg-success' : 'bg-primary'"
				:initial="false"
				:animate="{ width: `${Math.round((finished ? 1 : progress) * 100)}%` }"
				:transition="SPRING_SOFT"
			/>
		</div>

		<div ref="panel" tabindex="-1" class="mx-auto flex min-h-[calc(100dvh-0.25rem)] w-full max-w-3xl flex-col px-6 pb-16 pt-8 outline-none sm:px-10">
			<header class="flex items-center justify-between gap-4">
				<p class="micro text-muted">
					{{ t('triage.treatment') }}
					<span v-if="!finished" class="ms-3 text-dimmed">{{ t('triage.step', { n: current + 1, total: steps.length }) }}</span>
				</p>
				<UButton :label="t('triage.close')" icon="i-lucide-x" color="neutral" variant="ghost" class="text-muted" @click="emit('close')" />
			</header>

			<!-- Bring: listed once, at the start -->
			<section v-if="items.length && current === 0" class="mt-8">
				<p class="micro text-dimmed">{{ t('triage.bring') }}</p>
				<p class="mt-2 text-lg text-toned">
					<template v-for="(id, i) in items" :key="id">
						<NuxtLink :to="`/${id}`" class="underline decoration-dotted underline-offset-4 hover:text-primary">{{ nameOf(id).primary }}</NuxtLink><span v-if="i < items.length - 1" class="text-dimmed"> · </span>
					</template>
				</p>
			</section>

			<!-- Done steps collapse to struck-through lines -->
			<ul v-if="current > 0" class="mt-10 space-y-1.5">
				<AnimatePresence :initial="false">
					<Motion
						v-for="step in steps.slice(0, current)"
						:key="step.id"
						as="li"
						layout
						:initial="{ opacity: 0, height: 0 }"
						:animate="{ opacity: 1, height: 'auto' }"
						:exit="{ opacity: 0, height: 0 }"
						:transition="SPRING"
						class="flex gap-3 text-base text-dimmed line-through decoration-1"
					>
						<UIcon name="i-lucide-check" class="mt-1 size-4 shrink-0 text-success no-underline" />
						<EntryText :text="step.text" />
					</Motion>
				</AnimatePresence>
			</ul>

			<!-- The current step -->
			<div class="flex flex-1 flex-col justify-center py-10">
				<AnimatePresence mode="wait">
					<Motion
						v-if="!finished"
						:key="steps[current]!.id"
						v-bind="swap('y', 28)"
					>
						<p class="micro" :class="steps[current]!.kind === 'firstAid' ? 'text-primary' : 'text-muted'">
							{{ nameOf(steps[current]!.condition).primary }} · {{ steps[current]!.kind === 'firstAid' ? t('triage.firstAid') : t('sections.treatment') }}
						</p>
						<p
							class="mt-4 font-brand text-4xl font-medium leading-tight tracking-tight text-highlighted sm:text-5xl"
							:style="steps[current]!.kind === 'firstAid' ? { '--entry-link': 'var(--ui-primary)' } : undefined"
						>
							<EntryText :text="steps[current]!.text" />
						</p>
					</Motion>
					<Motion
						v-else
						key="finished"
						:initial="{ opacity: 0, scale: 0.96 }"
						:animate="{ opacity: 1, scale: 1 }"
						:transition="SPRING_SOFT"
					>
						<UIcon name="i-lucide-circle-check" class="size-12 text-success" />
						<p class="mt-4 font-brand text-4xl font-semibold tracking-tight text-highlighted sm:text-5xl">{{ t('triage.allDone') }}</p>
						<p class="mt-3 max-w-lg text-lg text-muted">{{ t('triage.allDoneDescription') }}</p>
					</Motion>
				</AnimatePresence>
			</div>

			<!-- Upcoming, quiet -->
			<ul v-if="!finished && current < steps.length - 1" class="mb-10 space-y-1">
				<li v-for="step in steps.slice(current + 1, current + 4)" :key="step.id" class="truncate text-sm text-dimmed">
					{{ nameOf(step.condition).primary }} · <EntryText :text="step.text" />
				</li>
			</ul>

			<div class="flex flex-wrap items-center gap-3">
				<Motion
					as="button"
					type="button"
					:while-press="PRESS"
					class="inline-flex min-w-40 items-center justify-center gap-3 rounded-md px-7 py-4 text-xl font-medium transition-colors"
					:class="finished ? 'bg-inverted text-inverted' : 'bg-primary text-inverted hover:opacity-90'"
					@click="finished ? emit('close') : next()"
				>
					<UIcon :name="finished ? 'i-lucide-x' : 'i-lucide-check'" class="size-5" />
					{{ finished ? t('triage.close') : t('triage.done') }}
					<kbd v-if="!finished" class="font-mono text-xs opacity-60">↵</kbd>
				</Motion>
				<button
					v-if="current > 0"
					type="button"
					class="px-4 py-4 text-lg text-muted transition-colors hover:text-highlighted"
					@click="back"
				>
					{{ t('triage.back') }}
				</button>
			</div>
		</div>
	</Motion>
</template>
