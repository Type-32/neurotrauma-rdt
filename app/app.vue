<script setup lang="ts">
const $rc = useRuntimeConfig()
const { t } = useI18n()
const localeHead = useLocaleHead()

const title = $rc.public.siteName as string || 'Neurotrauma RDT'

useHead(() => ({
	meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
	link: [{ rel: 'icon', href: '/favicon.ico' }, ...(localeHead.value.link ?? [])],
	htmlAttrs: localeHead.value.htmlAttrs,
	titleTemplate: (titleChunk?: string) => titleChunk && !titleChunk.includes(title)
		? `${titleChunk} - ${title}`
		: title,
}))

useSeoMeta({
	title,
	description: () => t('site.description'),
	ogTitle: title,
	ogDescription: () => t('site.description'),
	twitterCard: 'summary_large_image',
})
</script>

<template>
	<UApp>
		<NuxtLoadingIndicator color="var(--ui-primary)" />

		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</UApp>
</template>
