<script setup lang="ts">
const { t } = useI18n()
const $rc = useRuntimeConfig()

const TYPE_ICONS: Record<EntryType, string> = {
	afflictions: 'i-lucide-activity',
	symptoms: 'i-lucide-stethoscope',
	items: 'i-lucide-pill',
	procedures: 'i-lucide-list-ordered',
	info: 'i-lucide-info',
}
</script>

<template>
	<UContainer class="pb-16">
		<UPageHeader :title="$rc.public.siteName as string" :description="t('site.intro')" />

		<UPageCard
			to="/triage"
			icon="i-lucide-heart-pulse"
			:title="t('triage.title')"
			:description="t('triage.homeDescription')"
			orientation="horizontal"
			highlight
			highlight-color="primary"
			spotlight
			class="mt-8"
		/>

		<UPageGrid class="mt-4">
			<UPageCard
				v-for="type in ENTRY_TYPES"
				:key="type"
				:to="`/${type}`"
				:icon="TYPE_ICONS[type]"
				:title="t(`types.${type}`)"
				:description="t(`typeDescriptions.${type}`)"
				spotlight
			/>
		</UPageGrid>
	</UContainer>
</template>
