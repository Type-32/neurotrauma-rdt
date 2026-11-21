<script setup lang="ts">
/** Lethality, skill checks, where the entry can be seen in game, and its other labels. */
import type { BadgeProps } from '@nuxt/ui'

const props = defineProps<{ entry: Entry }>()

const { t } = useI18n()

const TAG_COLORS: Partial<Record<Tag, BadgeProps['color']>> = {
	'lethal': 'error',
	'possibly-lethal': 'warning',
	'essential': 'primary',
	'very-important': 'primary',
	'important': 'primary',
	'first-aid': 'primary',
	'interface-visible': 'info',
	'scanner-visible': 'info',
	'analyzer-visible': 'info',
	'known-issue': 'warning',
}

const badges = computed(() => {
	const list: Array<{ label: string, color: BadgeProps['color'], variant: BadgeProps['variant'], icon?: string }> = []

	const { skill } = props.entry
	if (skill?.medical !== undefined) {
		list.push({
			label: skill.medical === 0 ? t('entry.noSkillCheck') : t('entry.medicalSkill', { value: skill.medical }),
			color: 'neutral',
			variant: 'solid',
			icon: 'i-lucide-heart-pulse',
		})
	}
	if (skill?.mechanical !== undefined) {
		list.push({ label: t('entry.mechanicalSkill', { value: skill.mechanical }), color: 'neutral', variant: 'solid', icon: 'i-lucide-wrench' })
	}

	const tags = TAGS.filter(tag => props.entry.tags.includes(tag) && !HIDDEN_TAGS.includes(tag))
	for (const tag of tags) {
		const color = TAG_COLORS[tag] ?? 'neutral'
		list.push({
			label: t(`tags.${tag}`),
			color,
			variant: tag === 'lethal' ? 'solid' : color === 'neutral' ? 'outline' : 'subtle',
			icon: tag === 'lethal' || tag === 'possibly-lethal' ? 'i-lucide-skull' : tag.endsWith('-visible') ? 'i-lucide-scan-eye' : undefined,
		})
	}

	if (props.entry.source !== 'base') {
		list.push({ label: t(`sources.${props.entry.source}`), color: 'secondary', variant: 'subtle', icon: 'i-lucide-puzzle' })
	}
	return list
})
</script>

<template>
	<div class="flex flex-wrap items-center gap-2">
		<UBadge
			v-for="badge in badges"
			:key="badge.label"
			:label="badge.label"
			:color="badge.color"
			:variant="badge.variant"
			:icon="badge.icon"
		/>
	</div>
</template>
