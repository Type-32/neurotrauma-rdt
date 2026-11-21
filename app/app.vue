<script setup lang="ts">
const $rc = useRuntimeConfig()
const { t } = useI18n()
const localeHead = useLocaleHead()

const title = $rc.public.siteName as string || 'Neurotrauma RDT'

useHead(() => ({
	meta: [
		{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
		// Browser chrome matches each mode's page colour (graphite HUD / orbital ops).
		{ name: 'theme-color', content: '#0f1011', media: '(prefers-color-scheme: dark)' },
		{ name: 'theme-color', content: '#c6dac9', media: '(prefers-color-scheme: light)' },
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
		<NuxtLoadingIndicator color="var(--ui-primary)" :height="2" />

		<!-- reducedMotion="user": every motion-v animation respects the reader's reduced-motion setting. -->
		<MotionConfig reduced-motion="user">
			<NuxtLayout>
				<NuxtPage />
			</NuxtLayout>
		</MotionConfig>
	</UApp>
</template>
