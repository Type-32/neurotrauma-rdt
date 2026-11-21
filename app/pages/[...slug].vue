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

/** Every surgery opens and closes the same way; other procedures point to that one. */
const OPEN_CLOSE = '/procedures/open-close-surgery'
const showOpenClose = computed(() => type.value === 'procedures' && path.value !== OPEN_CLOSE)

const { reportUrl, editUrl } = useContentFeedback(() => page.value ? { path: path.value, title: page.value.title } : null)

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

		<UAlert
			v-if="showOpenClose"
			:title="t('checklist.openCloseTitle')"
			:description="t('checklist.openCloseDescription')"
			icon="i-lucide-info"
			color="info"
			variant="subtle"
			:actions="[{ label: t('checklist.openCloseLink'), to: OPEN_CLOSE, color: 'info', variant: 'outline' }]"
			class="mt-8"
		/>

		<div v-if="sections.length" class="mt-8 grid gap-4 lg:grid-cols-2">
			<template v-for="section in sections" :key="section.key">
				<EntryChecklist v-if="section.key === 'steps'" :path="path" :items="section.items" class="lg:col-span-2" />
				<EntrySection v-else :section-key="section.key" :items="section.items" />
			</template>
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

		<footer class="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-default pt-4 text-sm text-muted">
			<span>{{ t('feedback.prompt') }}</span>
			<ULink :to="reportUrl" target="_blank" class="inline-flex items-center gap-1 hover:text-highlighted">
				<UIcon name="i-lucide-flag" class="size-4" />{{ t('feedback.report') }}
			</ULink>
			<ULink :to="editUrl" target="_blank" class="inline-flex items-center gap-1 hover:text-highlighted">
				<UIcon name="i-lucide-pencil" class="size-4" />{{ t('feedback.edit') }}
			</ULink>
		</footer>
	</UContainer>
</template>
