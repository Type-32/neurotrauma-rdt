<script setup lang="ts">
// Entry detail page, laid out like a spec sheet: code band, name, structured
// sections, and a status column. Content follows
// https://content.nuxt.com/docs/integrations/i18n: the current locale's
// collection, falling back to the base locale (see app/utils/entries.ts).
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
const code = computed(() => page.value && isEntryType(type.value) ? entryCode(type.value, page.value.category, page.value.order) : '')

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
		? `${typeLabel} / ${t(`categories.${page.value.category}`)}`
		: typeLabel
})

/** Every surgery opens and closes the same way; other procedures point to that one. */
const OPEN_CLOSE = '/procedures/open-close-surgery'
const showOpenClose = computed(() => type.value === 'procedures' && path.value !== OPEN_CLOSE)

const { reportUrl, editUrl } = useContentFeedback(() => page.value ? { path: path.value, title: page.value.title } : null)

useSeoMeta({ title: () => page.value?.title })
</script>

<template>
	<UContainer v-if="page" class="pb-16 pt-6">
		<!-- Code band -->
		<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
			<p class="micro flex items-center gap-3">
				<NuxtLink :to="`/${type}`" class="text-muted transition-colors hover:text-highlighted">{{ headline }}</NuxtLink>
			</p>
			<p class="micro text-dimmed">~{{ path }}</p>
		</div>
		<MicroRule class="mt-2" />

		<div class="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
			<div class="min-w-0">
				<h1 class="font-brand text-4xl font-semibold leading-none tracking-tight text-highlighted sm:text-6xl">
					{{ names.primary }}
				</h1>
				<p v-if="names.secondary" class="mt-2 font-mono text-base text-muted sm:text-lg">{{ names.secondary }}</p>

				<UAlert
					v-if="showOpenClose"
					:title="t('checklist.openCloseTitle')"
					:description="t('checklist.openCloseDescription')"
					icon="i-lucide-info"
					color="neutral"
					variant="outline"
					:actions="[{ label: t('checklist.openCloseLink'), to: OPEN_CLOSE, color: 'neutral', variant: 'outline' }]"
					class="mt-6"
				/>

				<div v-if="sections.length" class="mt-8 grid gap-4 xl:grid-cols-2">
					<template v-for="(section, n) in sections" :key="section.key">
						<EntryChecklist v-if="section.key === 'steps'" :path="path" :items="section.items" :index="n + 1" class="xl:col-span-2" />
						<EntrySection
							v-else
							:section-key="section.key"
							:items="section.items"
							:index="n + 1"
							:class="section.key === 'firstAid' || section.key === 'treatment' ? 'xl:col-span-2' : ''"
						/>
					</template>
				</div>

				<!-- Kept in the DOM when closed, so the browser's find and the link crawler still see it. -->
				<UCollapsible :default-open="!sections.length" :unmount-on-hide="false" class="mt-8">
					<UButton
						:label="t('entry.fullText')"
						icon="i-lucide-file-text"
						trailing-icon="i-lucide-chevron-down"
						color="neutral"
						variant="outline"
						block
						class="micro justify-start"
						:ui="{ trailingIcon: 'ms-auto transition-transform group-data-[state=open]:rotate-180' }"
					/>
					<template #content>
						<ContentRenderer :value="page" class="pt-6" />
					</template>
				</UCollapsible>
			</div>

			<aside class="space-y-4 lg:sticky lg:top-[calc(var(--ui-header-height)+1.5rem)] lg:self-start">
				<EntryStatus :entry="page" :code="code" />
				<nav class="micro flex flex-col gap-2 text-muted" :aria-label="t('feedback.prompt')">
					<span class="text-dimmed">{{ t('feedback.prompt') }}</span>
					<ULink :to="reportUrl" target="_blank" class="inline-flex items-center gap-2 hover:text-highlighted">
						<UIcon name="i-lucide-flag" class="size-3.5" />{{ t('feedback.report') }}
					</ULink>
					<ULink :to="editUrl" target="_blank" class="inline-flex items-center gap-2 hover:text-highlighted">
						<UIcon name="i-lucide-pencil" class="size-3.5" />{{ t('feedback.edit') }}
					</ULink>
				</nav>
			</aside>
		</div>
	</UContainer>
</template>
