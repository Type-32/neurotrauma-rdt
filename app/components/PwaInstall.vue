<script setup lang="ts">
/**
 * Offline and install status from @vite-pwa/nuxt: a one-time notice when the
 * site is cached for offline use, and an Install button when the browser
 * offers installation (Chrome and Edge do; Safari installs from the Share menu).
 */
const { $pwa } = useNuxtApp()
const { t } = useI18n()
const toast = useToast()

watch(() => $pwa?.offlineReady, (ready) => {
	if (ready) toast.add({ title: t('pwa.offlineReady'), description: t('pwa.offlineReadyDescription'), icon: 'i-lucide-wifi-off' })
}, { immediate: true })

const canInstall = computed(() => !!$pwa?.showInstallPrompt && !$pwa?.isPWAInstalled)
</script>

<template>
	<UButton
		v-if="canInstall"
		:label="t('pwa.install')"
		:aria-label="t('pwa.installLabel')"
		icon="i-lucide-download"
		color="primary"
		variant="soft"
		class="hidden sm:inline-flex"
		@click="$pwa?.install()"
	/>
</template>
