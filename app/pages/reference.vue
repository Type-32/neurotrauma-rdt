<script setup lang="ts">
/**
 * Quick reference: the guide's short "how to" cards on one page, with jump
 * tabs that follow the scroll, so a medic doesn't click through info entries
 * mid-round. The text comes from the info entries themselves (with locale
 * fallback), so editing those entries updates this page.
 */
const { t, locale } = useI18n()

const { data: entries } = await useAsyncData(
	() => `reference-${locale.value}`,
	() => Promise.all(REFERENCE_SECTIONS.map(section => queryEntry('info', section.path, locale.value as ContentLocale))),
	{ default: () => [] },
)

const sections = computed(() => REFERENCE_SECTIONS
	.map((section, index) => ({ ...section, entry: entries.value[index] ?? null }))
	.filter(section => section.entry))

/** The section in the middle band of the screen, marked in the tabs. */
const active = ref<string>(REFERENCE_SECTIONS[0].id)
const targets = ref<HTMLElement[]>([])
onMounted(() => {
	targets.value = sections.value.map(section => document.getElementById(section.id)).filter((el): el is HTMLElement => !!el)
})
useIntersectionObserver(targets, (observed) => {
	const visible = observed.filter(entry => entry.isIntersecting)
	if (visible.length) active.value = visible[0]!.target.id
}, { rootMargin: '-35% 0px -60% 0px' })

const pad = (n: number) => String(n).padStart(2, '0')

useSeoMeta({ title: () => t('reference.title') })
</script>

<template>
	<UContainer class="pb-16 pt-6">
		<MicroPageHead code="REF // QUICK" :title="t('reference.title')" :description="t('reference.description')">
			<UButton :label="t('triage.title')" to="/triage" icon="i-lucide-heart-pulse" class="micro" />
		</MicroPageHead>

		<nav
			class="sticky top-(--ui-header-height) z-10 -mx-4 flex gap-1 overflow-x-auto border-b border-default bg-default/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6"
			:aria-label="t('reference.jump')"
		>
			<a
				v-for="(section, i) in sections"
				:key="section.id"
				:href="`#${section.id}`"
				class="micro relative shrink-0 px-2 py-1 transition-colors hover:text-highlighted"
				:class="active === section.id ? 'text-highlighted' : 'text-muted'"
				:aria-current="active === section.id ? 'location' : undefined"
				@click="active = section.id"
			>
				<span class="text-dimmed">{{ pad(i + 1) }}</span> {{ t(`reference.sections.${section.id}`) }}
				<span
					class="absolute inset-x-2 -bottom-2 h-0.5 transition-colors"
					:class="active === section.id ? 'bg-primary' : 'bg-transparent'"
					aria-hidden="true"
				/>
			</a>
		</nav>

		<div class="mt-6 space-y-6">
			<MicroPanel
				v-for="(section, i) in sections"
				:id="section.id"
				:key="section.id"
				:index="i + 1"
				:label="t(`reference.sections.${section.id}`)"
				:meta="section.entry!.title"
				class="scroll-mt-32"
			>
				<!-- Imported cards sometimes open with a top-level heading; inside a panel it should read as a subheading. -->
				<div class="[&_h1]:mb-3 [&_h1]:text-xl [&_h2]:text-lg [&_h3]:text-base">
					<ContentRenderer :value="section.entry!" />
				</div>
				<MicroRule class="mt-4" />
				<NuxtLink :to="section.path" class="micro mt-3 inline-flex items-center gap-2 text-muted transition-colors hover:text-highlighted">
					<UIcon name="i-lucide-arrow-up-right" class="size-3.5" />{{ t('reference.openEntry') }}
					<span class="text-dimmed">~{{ section.path }}</span>
				</NuxtLink>
			</MicroPanel>
		</div>
	</UContainer>
</template>
