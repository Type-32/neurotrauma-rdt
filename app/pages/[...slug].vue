<script setup lang="ts">
// Follows https://content.nuxt.com/docs/integrations/i18n: query the current
// locale's collection, and fall back to the base locale when an entry has no
// override there. The first path segment picks the entry type's collection.
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
	async () => {
		if (!isEntryType(type.value)) return null
		const current = locale.value as ContentLocale
		const localized = await queryCollection(entryCollection(type.value, current)).path(path.value).first()
		if (localized || current === BASE_CONTENT_LOCALE) return localized
		return queryCollection(entryCollection(type.value, BASE_CONTENT_LOCALE)).path(path.value).first()
	},
)

if (!page.value) {
	throw createError({ statusCode: 404, statusMessage: t('page.notFound'), message: t('page.notFoundDescription'), fatal: true })
}

useSeoMeta({ title: () => page.value?.title })
</script>

<template>
	<UContainer v-if="page" class="py-8">
		<h1 class="text-3xl font-brand text-highlighted">{{ page.title }}</h1>
		<ContentRenderer :value="page" class="mt-6" />
	</UContainer>
</template>
