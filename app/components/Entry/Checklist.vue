<script setup lang="ts">
/**
 * A procedure's steps as a tickable checklist. Ticks are kept in session
 * storage per page, so following a link to an item and coming back keeps
 * your place; a new tab or "Reset" starts over.
 */
const props = defineProps<{
	/** The entry's path, which keys the saved ticks. */
	path: string
	items: SectionItem[]
	/** 1-based position on the page, shown as "01 //". */
	index: number
}>()

const { t } = useI18n()

// initOnMounted: read storage after hydration, so the prerendered HTML (nothing ticked) always matches.
const done = useSessionStorage<number[]>(`checklist:${props.path}`, [], { initOnMounted: true })

function toggle(index: number, checked: boolean | 'indeterminate') {
	done.value = checked === true
		? [...new Set([...done.value, index])].sort((a, b) => a - b)
		: done.value.filter(i => i !== index)
}

const count = computed(() => done.value.filter(i => i < props.items.length).length)
const complete = computed(() => count.value === props.items.length)
const progress = computed(() => props.items.length ? Math.round(count.value / props.items.length * 100) : 0)
</script>

<template>
	<section
		class="micro-frame bg-elevated px-4 pb-3 pt-3"
		:style="{ '--frame-color': complete ? 'var(--ui-success)' : 'var(--micro-mark)', '--frame-size': '12px' }"
	>
		<header class="flex flex-wrap items-center justify-between gap-3 pb-2">
			<h2 class="micro text-highlighted">
				<span class="text-dimmed">{{ String(index).padStart(2, '0') }} //</span> {{ t('sections.steps') }}
			</h2>
			<span class="flex items-center gap-3">
				<span class="inline-flex items-center gap-2">
					<MicroBar :value="progress" :color="complete ? 'success' : 'primary'" />
					<span class="micro" :class="complete ? 'text-success' : 'text-muted'">{{ t('checklist.progress', { done: count, total: items.length }) }}</span>
				</span>
				<UButton :label="t('checklist.reset')" icon="i-lucide-rotate-ccw" size="xs" color="neutral" variant="ghost" class="micro" :disabled="!count" @click="done = []" />
			</span>
		</header>
		<MicroRule :delay="0.15" />

		<ol class="mt-2">
			<li v-for="(item, i) in items" :key="i" class="border-b border-dashed border-(--micro-line) last:border-b-0">
				<label
					class="flex min-h-12 cursor-pointer items-start gap-3 px-1 py-2.5 transition-colors hover:bg-accented/40"
					:class="done.includes(i) ? 'text-dimmed' : 'text-highlighted'"
				>
					<UCheckbox
						:model-value="done.includes(i)"
						:aria-label="t('checklist.step', { n: i + 1 })"
						color="success"
						class="mt-0.5"
						@update:model-value="toggle(i, $event)"
					/>
					<span class="w-7 shrink-0 pt-px font-mono text-xs" :class="done.includes(i) ? 'text-success' : 'text-muted'">{{ String(i + 1).padStart(2, '0') }}</span>
					<!-- Clicking the text ticks the box; links inside it navigate instead, as nested links take the click. -->
					<EntryText :text="item.text" class="leading-relaxed" :class="done.includes(i) ? 'line-through decoration-1' : ''" />
				</label>
			</li>
		</ol>
	</section>
</template>
