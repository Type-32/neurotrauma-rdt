<script setup lang="ts">
/**
 * The only chrome at the top of the page: a small wordmark home link, and the
 * language and colour mode switches, kept quiet so the page content leads.
 */
const { locale, setLocale, t } = useI18n()

async function toggleLocale() {
	await setLocale(locale.value === 'en' ? 'zh' : 'en')
}
</script>

<template>
	<header class="flex items-center justify-between px-5 py-4 sm:px-8">
		<NuxtLink to="/" class="group flex items-center gap-2 text-muted transition-colors hover:text-highlighted" :aria-label="t('dock.home')">
			<AppLogo class="size-5 transition-transform group-hover:rotate-12" />
			<span class="micro hidden tracking-[0.2em] sm:inline">Neurotrauma RDT</span>
		</NuxtLink>
		<div class="flex items-center gap-1">
			<UButton
				:label="t('locale.switchTo')"
				:aria-label="t('locale.switchLabel')"
				color="neutral"
				variant="ghost"
				size="sm"
				class="text-muted hover:text-highlighted"
				@click="toggleLocale"
			/>
			<UColorModeButton size="sm" class="text-muted hover:text-highlighted" />
		</div>
	</header>
</template>
