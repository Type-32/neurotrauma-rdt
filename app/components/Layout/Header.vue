<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import AppLogo from "~/components/AppLogo.vue";
const { locale, setLocale, t } = useI18n();
const { open: searchOpen } = useSearch();

/** Toggles between en and zh, staying on the same page. */
async function toggleLocale() {
	await setLocale(locale.value === 'en' ? 'zh' : 'en');
}

const navigationItems = computed<NavigationMenuItem[]>(() => [
	{ label: t('triage.title'), to: '/triage', icon: 'i-lucide-heart-pulse' },
	{ label: t('reference.title'), to: '/reference', icon: 'i-lucide-book-marked' },
	...ENTRY_TYPES.map(type => ({ label: t(`types.${type}`), to: `/${type}` })),
]);
</script>

<template>
	<UHeader :ui="{ root: 'border-b border-default bg-default/85 backdrop-blur' }">
		<template #left>
			<NuxtLink to="/" class="flex items-center gap-2 select-none" aria-label="Neurotrauma RDT">
				<AppLogo class="size-6 shrink-0" />
				<span class="hidden font-mono text-xs uppercase tracking-[0.18em] text-highlighted sm:inline">Neurotrauma</span>
				<span class="bg-inverted px-1.5 py-0.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-inverted">RDT</span>
			</NuxtLink>
		</template>
		<UNavigationMenu
			:items="navigationItems"
			content-orientation="vertical"
			orientation="horizontal"
			highlight
			highlight-color="primary"
			:ui="{ link: 'font-mono text-xs uppercase tracking-wider', linkLeadingIcon: 'size-3.5' }"
		/>
		<template #right>
			<ClientOnly>
				<PwaInstall />
			</ClientOnly>
			<UButton
				icon="i-lucide-search"
				color="neutral"
				variant="outline"
				:aria-label="t('search.title')"
				class="lg:min-w-44"
				@click="searchOpen = true"
			>
				<span class="hidden font-mono text-xs uppercase tracking-wider text-muted lg:inline">{{ t('search.button') }}</span>
				<span class="ms-auto hidden gap-0.5 lg:flex">
					<UKbd value="meta" />
					<UKbd value="K" />
				</span>
			</UButton>
			<UButton
				:label="t('locale.switchTo')"
				:aria-label="t('locale.switchLabel')"
				icon="i-lucide-languages"
				color="neutral"
				variant="ghost"
				class="font-mono text-xs"
				@click="toggleLocale"
			/>
			<UColorModeButton class="text-muted hover:text-highlighted" aria-label="Toggle Color Mode" />
		</template>
	</UHeader>
</template>
