<script setup lang="ts">
/**
 * Quick reference: the guide's short "how to" cards on one page, with jump
 * links, so a medic doesn't click through info entries mid-round. The text
 * comes from the info entries themselves (with locale fallback), so editing
 * those entries updates this page.
 */
const { t, locale } = useI18n()

const SECTIONS = REFERENCE_SECTIONS

const { data: entries } = await useAsyncData(
	() => `reference-${locale.value}`,
	() => Promise.all(SECTIONS.map(section => queryEntry('info', section.path, locale.value as ContentLocale))),
	{ default: () => [] },
)

const sections = computed(() => SECTIONS
	.map((section, index) => ({ ...section, entry: entries.value[index] ?? null }))
	.filter(section => section.entry))

useSeoMeta({ title: () => t('reference.title') })
</script>

<template>
	<UContainer class="pb-16">
		<UPageHeader :title="t('reference.title')" :description="t('reference.description')">
			<template #links>
				<UButton :label="t('triage.title')" to="/triage" icon="i-lucide-heart-pulse" />
			</template>
		</UPageHeader>

		<nav class="sticky top-(--ui-header-height) z-10 -mx-4 mt-6 flex flex-wrap gap-2 bg-default/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6" :aria-label="t('reference.jump')">
			<UButton
				v-for="section in sections"
				:key="section.id"
				:to="`#${section.id}`"
				:label="t(`reference.sections.${section.id}`)"
				:icon="section.icon"
				color="neutral"
				variant="subtle"
				size="sm"
			/>
		</nav>

		<div class="mt-4 space-y-6">
			<UPageCard
				v-for="section in sections"
				:id="section.id"
				:key="section.id"
				:icon="section.icon"
				:title="t(`reference.sections.${section.id}`)"
				:description="section.entry!.title"
				variant="subtle"
				class="scroll-mt-36"
			>
				<!-- Imported cards sometimes open with a top-level heading; inside a card it should read as a subheading. -->
				<div class="[&_h1]:mb-3 [&_h1]:text-xl [&_h2]:text-lg [&_h3]:text-base">
					<ContentRenderer :value="section.entry!" />
				</div>
				<ULink :to="section.path" class="mt-2 inline-flex items-center gap-1 text-sm text-muted hover:text-highlighted">
					<UIcon name="i-lucide-arrow-up-right" class="size-4" />{{ t('reference.openEntry') }}
				</ULink>
			</UPageCard>
		</div>
	</UContainer>
</template>
