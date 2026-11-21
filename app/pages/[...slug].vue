<script setup lang="ts">
// Entry detail page. Follows https://content.nuxt.com/docs/integrations/i18n:
// the current locale's collection, falling back to the base locale (see
// app/utils/entries.ts). The first path segment picks the entry type.
import { withLeadingSlash } from 'ufo'

const route = useRoute()
const { locale, t } = useI18n()

const path = computed(() => {
	const slug = route.params.slug
	return withLeadingSlash(Array.isArray(slug) ? slug.join('/') : String(slug ?? ''))
})
const type = computed(() => path.value.split('/')[1])

const { data: page } = await useAsyncData(
	() => `entry-${locale.value}-${path.value}`,
	() => isEntryType(type.value) ? queryEntry(type.value, path.value, locale.value as ContentLocale) : Promise.resolve(null),
)

if (!page.value) {
	throw createError({ statusCode: 404, statusMessage: t('page.notFound'), message: t('page.notFoundDescription'), fatal: true })
}

const names = computed(() => page.value ? entryNames(page.value, locale.value) : { primary: '' })

/** The structured sections this entry has, treatment first. */
const sections = computed(() => SECTION_KEYS
	.map(key => ({ key, items: page.value?.[key] as SectionItem[] | undefined }))
	.filter((section): section is { key: SectionKey, items: SectionItem[] } => !!section.items?.length))

/** Type, plus the category when it says more than the type (not "Items · Items"). */
const headline = computed(() => {
	if (!page.value || !isEntryType(type.value)) return ''
	const typeLabel = t(`types.${type.value}`)
	const showCategory = CATEGORIES[type.value].length > 1 && page.value.category !== CATEGORIES[type.value][0]
	return showCategory || type.value === 'afflictions'
		? `${typeLabel} · ${t(`categories.${page.value.category}`)}`
		: typeLabel
})

const alsoIn = computed(() => page.value?.alsoIn?.length
	? t('entry.alsoIn', { list: page.value.alsoIn.map(c => t(`categories.${c}`)).join(', ') })
	: '')

useSeoMeta({ title: () => page.value?.title })
</script>

<template>
	<UContainer v-if="page" class="pb-16">
		<UPageHeader :headline="headline" :title="names.primary" :description="names.secondary">
			<div class="mt-4 space-y-2">
				<EntryBadges :entry="page" />
				<p v-if="alsoIn" class="text-sm text-muted">{{ alsoIn }}</p>
			</div>
		</UPageHeader>

		<div v-if="sections.length" class="mt-8 grid gap-4 lg:grid-cols-2">
			<EntrySection
				v-for="section in sections"
				:key="section.key"
				:section-key="section.key"
				:items="section.items"
			/>
		</div>

		<!-- Kept in the DOM when closed, so the browser's find and the link crawler still see it. -->
		<UCollapsible :default-open="!sections.length" :unmount-on-hide="false" class="mt-8">
			<UButton
				:label="t('entry.fullText')"
				icon="i-lucide-book-open"
				trailing-icon="i-lucide-chevron-down"
				color="neutral"
				variant="subtle"
				block
				:ui="{ trailingIcon: 'ms-auto transition-transform group-data-[state=open]:rotate-180' }"
			/>
			<template #content>
				<ContentRenderer :value="page" class="pt-6" />
			</template>
		</UCollapsible>
	</UContainer>
</template>
