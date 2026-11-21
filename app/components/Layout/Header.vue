<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import Logo from "~/components/Logo.vue";
const $rc = useRuntimeConfig();
const { locale, setLocale, t } = useI18n();

/** Toggles between en and zh, staying on the same page. */
async function toggleLocale() {
	await setLocale(locale.value === 'en' ? 'zh' : 'en');
}

const navigationItems = computed<NavigationMenuItem[]>(() =>
	ENTRY_TYPES.map(type => ({ label: t(`types.${type}`), to: `/${type}` })),
);
</script>

<template>
	<UHeader>
		<template #left>
			<NuxtLink to="/" class="flex items-center justify-center gap-1.5 select-none">
				<Logo class="size-7 shrink-0"/>
				<span class="whitespace-nowrap text-lg font-brand text-highlighted sm:text-xl">{{$rc.public.siteName}}</span>
			</NuxtLink>
		</template>
		<UNavigationMenu
			:items="navigationItems"
			arrow
			content-orientation="vertical"
			orientation="horizontal"
		/>
		<template #right>
			<UButton
				:label="t('locale.switchTo')"
				:aria-label="t('locale.switchLabel')"
				icon="i-lucide-languages"
				color="neutral"
				variant="ghost"
				@click="toggleLocale"
			/>
			<UColorModeButton class="text-muted hover:text-highlighted" aria-label="Toggle Color Mode" />
		</template>
	</UHeader>
</template>

<style scoped></style>
