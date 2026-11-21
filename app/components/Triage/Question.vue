<script setup lang="ts">
/**
 * One question at a time: the finding that best tells the likely causes
 * apart. Yes puts it on the patient, No rules it out, Can't tell skips it.
 * The card slides away on answer and the next one comes in. Keyboard: Y, N,
 * and Space (handled by the page, so it works without focusing the card).
 */
const props = defineProps<{
	suggestion: Suggestion
	nameOf: (id: string) => { primary: string, secondary?: string }
}>()
defineEmits<{ answer: [answer: 'yes' | 'no' | 'unsure'] }>()

const { t } = useI18n()

const names = computed(() => props.nameOf(props.suggestion.id))
const hint = computed(() => props.suggestion.of === 1
	? t('triage.confirms')
	: t('triage.tellsApart', { splits: props.suggestion.splits, of: props.suggestion.of }))
</script>

<template>
	<AnimatePresence mode="wait">
		<Motion
			:key="suggestion.id"
			as="section"
			:initial="{ opacity: 0, x: 28 }"
			:animate="{ opacity: 1, x: 0 }"
			:exit="{ opacity: 0, x: -28 }"
			:transition="SPRING_SOFT"
			aria-live="polite"
		>
			<p class="micro text-info">{{ t('triage.checkNext') }}</p>
			<h2 class="mt-3 font-brand text-4xl font-semibold leading-tight tracking-tight text-highlighted">
				{{ names.primary }}?
			</h2>
			<p v-if="names.secondary" class="mt-1 text-lg text-muted">{{ names.secondary }}</p>
			<p class="mt-2 text-sm text-dimmed">{{ hint }}</p>

			<div class="mt-6 flex flex-wrap gap-2">
				<Motion
					as="button"
					type="button"
					:while-press="PRESS"
					class="inline-flex items-center gap-3 rounded-md bg-inverted px-5 py-3 text-lg font-medium text-inverted transition-opacity hover:opacity-90"
					@click="$emit('answer', 'yes')"
				>
					{{ t('triage.yes') }} <kbd class="font-mono text-xs opacity-60">Y</kbd>
				</Motion>
				<Motion
					as="button"
					type="button"
					:while-press="PRESS"
					class="inline-flex items-center gap-3 rounded-md border border-accented px-5 py-3 text-lg text-highlighted transition-colors hover:bg-accented/50"
					@click="$emit('answer', 'no')"
				>
					{{ t('triage.no') }} <kbd class="font-mono text-xs text-dimmed">N</kbd>
				</Motion>
				<Motion
					as="button"
					type="button"
					:while-press="PRESS"
					class="inline-flex items-center gap-3 rounded-md px-4 py-3 text-lg text-muted transition-colors hover:text-highlighted"
					@click="$emit('answer', 'unsure')"
				>
					{{ t('triage.unsure') }} <kbd class="font-mono text-xs text-dimmed">␣</kbd>
				</Motion>
			</div>
		</Motion>
	</AnimatePresence>
</template>
