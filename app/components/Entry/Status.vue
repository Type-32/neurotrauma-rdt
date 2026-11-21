<script setup lang="ts">
/**
 * The entry's status readout, spec-sheet style: lethality, where the game
 * shows it, skill checks, source and other flags, as label/value rows.
 */
const props = defineProps<{ entry: Entry, code: string }>()
const { t } = useI18n()

const lethal = computed(() => lethality(props.entry))
const lethalLabel = computed(() => lethal.value === 'lethal'
	? t('tags.lethal')
	: lethal.value === 'possibly-lethal' ? t('tags.possibly-lethal') : props.entry.tags.includes('non-lethal') ? t('tags.non-lethal') : null)

const VISIBILITY = [
	{ tag: 'interface-visible', key: 'interface' },
	{ tag: 'scanner-visible', key: 'scanner' },
	{ tag: 'analyzer-visible', key: 'analyzer' },
] as const
const visibility = computed(() => VISIBILITY.map(v => ({ ...v, on: props.entry.tags.includes(v.tag) })))
const showVisibility = computed(() => visibility.value.some(v => v.on) || props.entry.tags.includes('not-visible'))

const SHOWN_ELSEWHERE: readonly Tag[] = ['lethal', 'possibly-lethal', 'non-lethal', 'interface-visible', 'scanner-visible', 'analyzer-visible', 'not-visible']
const flags = computed(() => TAGS.filter(tag => props.entry.tags.includes(tag) && !SHOWN_ELSEWHERE.includes(tag) && !HIDDEN_TAGS.includes(tag)))
</script>

<template>
	<dl class="micro-frame bg-elevated/60 px-4 py-3 text-sm">
		<div class="flex items-center justify-between pb-2">
			<dt class="micro text-muted">{{ t('status.title') }}</dt>
			<dd class="micro text-highlighted"><MicroScramble :text="code" :delay="120" /></dd>
		</div>

		<div v-if="lethalLabel" class="status-row">
			<dt class="micro text-muted">{{ t('status.lethality') }}</dt>
			<dd class="flex items-center gap-2 font-mono text-xs uppercase" :class="lethal === 'lethal' ? 'text-error' : lethal ? 'text-warning' : 'text-toned'">
				<UIcon :name="lethal ? 'i-lucide-skull' : 'i-lucide-shield'" class="size-3.5" />{{ lethalLabel }}
			</dd>
		</div>

		<div v-if="showVisibility" class="status-row">
			<dt class="micro text-muted">{{ t('status.visibility') }}</dt>
			<dd class="space-y-1">
				<span v-for="(v, i) in visibility" :key="v.key" class="flex items-center gap-2 font-mono text-xs uppercase" :class="v.on ? 'text-highlighted' : 'text-dimmed'">
					<Motion
						as="span"
						class="block size-2"
						:class="v.on ? 'bg-success' : 'border border-accented'"
						:initial="v.on ? { opacity: 0.2 } : false"
						:animate="{ opacity: 1 }"
						:transition="{ duration: 0.15, delay: 0.25 + i * 0.08 }"
					/>
					{{ t(`triage.groups.${v.key}`) }}
				</span>
			</dd>
		</div>

		<div v-if="entry.skill" class="status-row">
			<dt class="micro text-muted">{{ t('status.skill') }}</dt>
			<dd class="space-y-0.5 font-mono text-xs uppercase text-highlighted">
				<span v-if="entry.skill.medical !== undefined" class="block">
					{{ entry.skill.medical === 0 ? t('entry.noSkillCheck') : t('entry.medicalSkill', { value: entry.skill.medical }) }}
				</span>
				<span v-if="entry.skill.mechanical !== undefined" class="block">{{ t('entry.mechanicalSkill', { value: entry.skill.mechanical }) }}</span>
			</dd>
		</div>

		<div class="status-row">
			<dt class="micro text-muted">{{ t('status.source') }}</dt>
			<dd class="font-mono text-xs uppercase" :class="entry.source === 'base' ? 'text-toned' : 'text-highlighted'">{{ t(`sources.${entry.source}`) }}</dd>
		</div>

		<div v-if="entry.alsoIn?.length" class="status-row">
			<dt class="micro text-muted">{{ t('status.alsoIn') }}</dt>
			<dd class="font-mono text-xs uppercase text-toned">{{ entry.alsoIn.map(c => t(`categories.${c}`)).join(' / ') }}</dd>
		</div>

		<div v-if="flags.length" class="status-row">
			<dt class="micro text-muted">{{ t('status.flags') }}</dt>
			<dd class="flex flex-wrap gap-1">
				<span v-for="flag in flags" :key="flag" class="border border-accented px-1.5 py-px font-mono text-[0.6875rem] uppercase tracking-wide text-toned">{{ t(`tags.${flag}`) }}</span>
			</dd>
		</div>
	</dl>
</template>

<style scoped>
.status-row {
	display: grid;
	grid-template-columns: 6.5rem minmax(0, 1fr);
	align-items: baseline;
	gap: 0.5rem;
	padding-block: 0.5rem;
	border-top: 1px dashed var(--micro-line);
}
</style>
