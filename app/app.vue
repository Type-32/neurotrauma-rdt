<script setup lang="ts">
const $rc = useRuntimeConfig()
const { t } = useI18n()
const localeHead = useLocaleHead()

const title = $rc.public.siteName as string || 'Neurotrauma RDT'

useHead(() => ({
	meta: [
		{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
		{ name: 'theme-color', content: '#16a34a' },
	],
	link: [
		{ rel: 'icon', href: '/favicon.ico' },
		{ rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
		{ rel: 'apple-touch-icon', href: '/apple-touch-icon-180x180.png' },
		...(localeHead.value.link ?? []),
	],
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
		<NuxtPwaManifest />
		<NuxtLoadingIndicator color="var(--ui-primary)" />

		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</UApp>
</template>
