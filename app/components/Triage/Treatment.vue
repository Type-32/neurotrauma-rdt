<script setup lang="ts">
/**
 * Triage's treatment plan as a step-through: every condition's first aid,
 * then its treatment, in plan order, with the plan's items to bring.
 */
const props = defineProps<{
	plan: PlanStep[]
	items: string[]
	nameOf: (id: string) => { primary: string, secondary?: string }
}>()
defineEmits<{ close: [] }>()

const { t } = useI18n()

const steps = computed(() => props.plan.flatMap(({ entry }) => {
	const name = props.nameOf(entry.id).primary
	return [
		...entry.firstAid.map((item, i) => ({ id: `${entry.id}-a${i}`, label: `${name} · ${t('triage.firstAid')}`, text: item.text, urgent: true })),
		...entry.treatment.map((item, i) => ({ id: `${entry.id}-t${i}`, label: `${name} · ${t('sections.treatment')}`, text: item.text })),
	]
}))
const bring = computed(() => props.items.map(id => ({ to: `/${id}`, label: props.nameOf(id).primary })))
</script>

<template>
	<StepThrough :title="t('triage.treatment')" :steps="steps" :bring="bring" :done-description="t('triage.allDoneDescription')" @close="$emit('close')" />
</template>
