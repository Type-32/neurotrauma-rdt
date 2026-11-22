<script setup lang="ts">
/**
 * One structured section of an entry (first aid, treatment, effects…) as a
 * framed panel with a numbered micro-label. Thresholds show as a segmented
 * gauge, amounts as a mono readout.
 */
const props = defineProps<{
	sectionKey: SectionKey
	items: SectionItem[]
	/** 1-based position on the page, shown as "01 //". */
	index: number
}>()

const { t } = useI18n()

/** First aid is the one section that gets the hot accent. */
const urgent = computed(() => props.sectionKey === 'firstAid')
const prominent = computed(() => props.sectionKey === 'firstAid' || props.sectionKey === 'treatment')

/** "(达到40%及以上)" or "(at 20% or more)": the threshold as written, which the gauge replaces. */
const THRESHOLD_NOTE = /\s*[（(]\s*(?:达到\s*\d+(?:\.\d+)?\s*%\s*(?:及以上|以上)?|at\s+\d+(?:\.\d+)?%\s+or\s+more)\s*[)）]/i

function displayText(item: SectionItem): string {
	let text = item.text
	if (item.amount !== undefined) text = text.replace(/^[+-]\d+(?:\.\d+)?\s*%\s*/, '')
	if (item.threshold !== undefined) text = text.replace(THRESHOLD_NOTE, '')
	return text
}

function formatAmount(amount: number): string {
	return `${amount > 0 ? '+' : ''}${amount}%`
}
</script>

<template>
	<section
		class="micro-frame px-4 pb-4 pt-3"
		:class="prominent ? 'bg-elevated' : 'bg-elevated/50'"
		:style="urgent ? { '--frame-color': 'var(--ui-primary)', '--frame-size': '12px', '--entry-link': 'var(--ui-primary)' } : undefined"
	>
		<header class="flex items-center justify-between gap-3 pb-2">
			<h2 class="micro" :class="urgent ? 'text-primary' : 'text-highlighted'">
				<span class="text-dimmed">{{ String(index).padStart(2, '0') }} //</span> {{ t(`sections.${sectionKey}`) }}
			</h2>
			<span class="micro text-dimmed">[{{ String(items.length).padStart(2, '0') }}]</span>
		</header>
		<MicroRule :delay="0.1 + index * 0.05" />

		<ul class="mt-3 space-y-2.5">
			<li v-for="(item, i) in items" :key="i" class="flex gap-2.5 leading-relaxed" :class="prominent ? 'text-base text-highlighted' : 'text-sm'">
				<span class="mt-px shrink-0 select-none font-mono text-xs" :class="urgent ? 'text-primary' : 'text-dimmed'" aria-hidden="true">&gt;</span>
				<span class="min-w-0 flex-1">
					<span v-if="item.amount !== undefined" class="me-2 font-mono text-xs" :class="item.amount < 0 ? 'text-success' : 'text-toned'">{{ formatAmount(item.amount) }}</span>
					<EntryText :text="displayText(item)" />
					<span v-if="item.threshold !== undefined" class="ms-2 inline-flex items-center gap-1.5 align-middle">
						<MicroBar :value="item.threshold" />
						<span class="font-mono text-[0.6875rem] text-muted">{{ t('entry.threshold', { value: item.threshold }) }}</span>
					</span>
				</span>
			</li>
		</ul>
	</section>
</template>
