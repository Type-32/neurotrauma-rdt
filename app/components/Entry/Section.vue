<script setup lang="ts">
/**
 * A section's items as a plain list. "lead" sections (first aid, treatment,
 * what a symptom is caused by) are large; the rest are body size. Thresholds
 * show as a small gauge and amounts as a figure, since both are real data.
 */
const props = withDefaults(defineProps<{
	items: SectionItem[]
	size?: 'lead' | 'body'
	/** First aid: the accent colour. */
	urgent?: boolean
}>(), { size: 'body', urgent: false })

const { t } = useI18n()

/** "(达到40%及以上)" or "(at 20% or more)": the threshold as written, which the gauge replaces. */
const THRESHOLD_NOTE = /\s*[（(]\s*(?:达到\s*\d+(?:\.\d+)?\s*%\s*(?:及以上|以上)?|at\s+\d+(?:\.\d+)?%\s+or\s+more)\s*[)）]/i

function displayText(item: SectionItem): string {
	let text = item.text
	if (item.amount !== undefined) text = text.replace(/^[+-]\d+(?:\.\d+)?\s*%\s*/, '')
	if (item.threshold !== undefined) text = text.replace(THRESHOLD_NOTE, '')
	return text
}

const formatAmount = (amount: number) => `${amount > 0 ? '+' : ''}${amount}%`
const lead = computed(() => props.size === 'lead')
/** Display size only for short lists; a long list at that size stops being readable. */
const big = computed(() => lead.value && props.items.length <= 4)
</script>

<template>
	<ul :class="lead ? 'space-y-3' : 'space-y-2'" :style="urgent ? { '--entry-link': 'var(--ui-primary)' } : undefined">
		<li
			v-for="(item, i) in items"
			:key="i"
			class="flex gap-3"
			:class="big ? 'text-2xl leading-snug text-highlighted sm:text-3xl' : lead ? 'text-xl leading-relaxed text-highlighted' : 'text-lg leading-relaxed text-toned'"
		>
			<span class="shrink-0 select-none" :class="urgent ? 'text-primary' : 'text-dimmed'" aria-hidden="true">{{ lead ? '→' : '·' }}</span>
			<span class="min-w-0 flex-1">
				<span v-if="item.amount !== undefined" class="me-2 font-mono text-base" :class="item.amount < 0 ? 'text-success' : 'text-muted'">{{ formatAmount(item.amount) }}</span>
				<EntryText :text="displayText(item)" />
				<span v-if="item.threshold !== undefined" class="ms-3 inline-flex items-center gap-2 align-middle">
					<MicroBar :value="item.threshold" color="neutral" />
					<span class="font-mono text-xs text-muted">{{ t('entry.threshold', { value: item.threshold }) }}</span>
				</span>
			</span>
		</li>
	</ul>
</template>
