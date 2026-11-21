<script setup lang="ts">
/**
 * Terminal status strip along the bottom of every page. Everything on it is
 * real state: connection (offline means the cached copy is being used), the
 * interface language, and the colour mode.
 */
const { t, locale } = useI18n()
const online = useOnline()
const colorMode = useColorMode()
</script>

<template>
	<footer class="border-t border-default">
		<UContainer class="micro flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2.5 text-dimmed">
			<span>NT-RDT // {{ t('statusBar.tagline') }}</span>
			<span class="flex items-center gap-5">
				<ClientOnly>
					<span class="flex items-center gap-1.5" :class="online ? 'text-success' : 'text-warning'">
						<span class="block size-1.5" :class="online ? 'bg-success' : 'bg-warning'" />
						{{ online ? t('statusBar.online') : t('statusBar.offline') }}
					</span>
					<span>{{ t('statusBar.lang') }} {{ locale.toUpperCase() }}</span>
					<span>{{ t('statusBar.mode') }} {{ colorMode.value === 'dark' ? 'HUD' : 'OPS' }}</span>
				</ClientOnly>
			</span>
		</UContainer>
	</footer>
</template>
