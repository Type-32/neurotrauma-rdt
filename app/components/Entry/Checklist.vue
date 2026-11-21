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
</script>

<template>
	<UPageCard variant="subtle" highlight :highlight-color="complete ? 'success' : 'primary'" :ui="{ container: 'gap-y-3' }">
		<template #title>
			<span class="flex items-center justify-between gap-3">
				<span class="text-sm font-semibold uppercase tracking-wide text-muted">{{ t('sections.steps') }}</span>
				<span class="flex items-center gap-2">
					<UBadge :label="t('checklist.progress', { done: count, total: items.length })" :color="complete ? 'success' : 'neutral'" variant="subtle" />
					<UButton :label="t('checklist.reset')" icon="i-lucide-rotate-ccw" size="xs" color="neutral" variant="ghost" :disabled="!count" @click="done = []" />
				</span>
			</span>
		</template>

		<ol class="space-y-1">
			<li v-for="(item, index) in items" :key="index">
				<label
					class="flex min-h-11 cursor-pointer items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-elevated/60"
					:class="done.includes(index) ? 'text-muted line-through decoration-1' : ''"
				>
					<UCheckbox
						:model-value="done.includes(index)"
						:aria-label="t('checklist.step', { n: index + 1 })"
						class="mt-0.5"
						@update:model-value="toggle(index, $event)"
					/>
					<span class="w-6 shrink-0 font-mono text-sm text-muted">{{ index + 1 }}.</span>
					<!-- Clicking the text ticks the box; links inside it navigate instead, as nested links take the click. -->
					<EntryText :text="item.text" class="leading-relaxed" />
				</label>
			</li>
		</ol>
	</UPageCard>
</template>
