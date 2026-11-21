<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import Logo from "~/components/Logo.vue";
const $rc = useRuntimeConfig();

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
			<UColorModeButton class="text-muted hover:text-highlighted" aria-label="Toggle Color Mode" />
		</template>
	</UHeader>
</template>

<style scoped></style>
