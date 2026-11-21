<script setup lang="ts">
/**
 * One structured section of an entry (first aid, treatment, steps, effects…)
 * as a card. Thresholds and amounts parsed by the importer show as badges.
 */
const props = defineProps<{
	sectionKey: SectionKey
	items: SectionItem[]
}>()

const { t } = useI18n()

/** First aid and treatment are what a medic looks for first, so they stand out. */
const highlight = computed(() => {
	if (props.sectionKey === 'firstAid') return 'error' as const
	if (props.sectionKey === 'treatment' || props.sectionKey === 'steps') return 'primary' as const
	return undefined
})

const ordered = computed(() => props.sectionKey === 'steps')

/** "(达到40%及以上)" or "(at 20% or more)": the threshold as written, which the badge replaces. */
const THRESHOLD_NOTE = /\s*[（(]\s*(?:达到\s*\d+(?:\.\d+)?\s*%\s*(?:及以上|以上)?|at\s+\d+(?:\.\d+)?%\s+or\s+more)\s*[)）]/i

/** The text without its leading amount and threshold note, which are shown as badges instead. */
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
	<UPageCard
		:title="t(`sections.${sectionKey}`)"
		variant="subtle"
		:highlight="!!highlight"
		:highlight-color="highlight"
		:ui="{ title: 'text-sm font-semibold uppercase tracking-wide text-muted' }"
	>
		<component :is="ordered ? 'ol' : 'ul'" class="space-y-2" :class="ordered ? 'list-decimal ps-5' : ''">
			<li v-for="(item, index) in items" :key="index" class="leading-relaxed">
				<span class="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
					<UBadge
						v-if="item.amount !== undefined"
						:label="formatAmount(item.amount)"
						color="neutral"
						variant="soft"
						size="sm"
						class="font-mono"
					/>
					<EntryText :text="displayText(item)" />
					<UBadge
						v-if="item.threshold !== undefined"
						:label="t('entry.threshold', { value: item.threshold })"
						color="neutral"
						variant="outline"
						size="sm"
					/>
				</span>
			</li>
		</component>
	</UPageCard>
</template>
