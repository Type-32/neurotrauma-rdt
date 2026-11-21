<script setup lang="ts">
/**
 * The patient: what the medic has seen (picked words fly in here from the
 * picker) and what they checked and didn't see (struck through). Tapping a
 * seen finding removes it; tapping a ruled-out one undoes that.
 */
defineProps<{
	selected: string[]
	ruledOut: string[]
	nameOf: (id: string) => { primary: string, secondary?: string }
	lethalOf: (id: string) => 'lethal' | 'possibly-lethal' | undefined
}>()
defineEmits<{
	remove: [id: string]
	restore: [id: string]
	share: []
	clear: []
}>()

const { t } = useI18n()
</script>

<template>
	<div class="flex flex-wrap items-baseline gap-x-6 gap-y-3">
		<span class="micro text-dimmed">{{ t('triage.patient') }}</span>

		<ul class="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-2">
			<li v-for="id in selected" :key="id">
				<Motion
					as="button"
					type="button"
					:layout-id="`finding-${id}`"
					:transition="SPRING"
					:while-press="PRESS"
					class="group inline-flex items-center gap-2 rounded-md bg-accented/70 px-3 py-1.5 text-lg text-highlighted transition-colors hover:bg-accented"
					:aria-label="t('triage.remove', { name: nameOf(id).primary })"
					@click="$emit('remove', id)"
				>
					<span
						v-if="lethalOf(id)"
						class="size-1.5 rounded-full"
						:class="lethalOf(id) === 'lethal' ? 'bg-error' : 'bg-warning'"
						aria-hidden="true"
					/>
					{{ nameOf(id).primary }}
					<UIcon name="i-lucide-x" class="size-3.5 text-dimmed transition-colors group-hover:text-highlighted" />
				</Motion>
			</li>
			<li v-for="id in ruledOut" :key="id">
				<Motion
					as="button"
					type="button"
					:layout-id="`finding-${id}`"
					:transition="SPRING"
					:while-press="PRESS"
					class="px-2 py-1.5 text-lg text-dimmed line-through decoration-1 transition-colors hover:text-muted"
					:aria-label="t('triage.restore', { name: nameOf(id).primary })"
					@click="$emit('restore', id)"
				>
					{{ nameOf(id).primary }}
				</Motion>
			</li>
		</ul>

		<div class="flex items-center gap-1">
			<UButton :label="t('triage.share')" icon="i-lucide-link" color="neutral" variant="ghost" size="sm" class="text-muted" @click="$emit('share')" />
			<UButton :label="t('triage.clear')" icon="i-lucide-rotate-ccw" color="neutral" variant="ghost" size="sm" class="text-muted" @click="$emit('clear')" />
		</div>
	</div>
</template>
