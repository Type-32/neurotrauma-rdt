<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import Logo from "~/components/Logo.vue";
const $rc = useRuntimeConfig();
const { locale, setLocale, t } = useI18n();

/** Toggles between en and zh, staying on the same page. */
async function toggleLocale() {
	await setLocale(locale.value === 'en' ? 'zh' : 'en');
}

const navigationItems = ref<NavigationMenuItem[]>([]);
</script>

<template>
	<UHeader>
		<template #left>
			<NuxtLink to="/" class="flex items-center justify-center gap-1.5 select-none">
				<Logo class="h-8 w-auto shrink-0"/>
				<span class="text-xl font-brand text-highlighted">{{$rc.public.siteName}}</span>
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
