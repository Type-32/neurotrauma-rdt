<script setup lang="ts">
/**
 * Quick reference: the guide's short "how to" cards (how to diagnose, the five
 * commandments, treatment order, medkit loadouts), one on screen at a time.
 * Large tabs or ← → switch between them; the current one is in the URL hash
 * (/reference#order), so links can open a specific card. The text comes from
 * the info entries themselves, with locale fallback.
 */
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const { data: entries } = await useAsyncData(
	() => `reference-${locale.value}`,
	() => Promise.all(REFERENCE_SECTIONS.map(section => queryEntry('info', section.path, locale.value as ContentLocale))),
	{ default: () => [] },
)

const sections = computed(() => REFERENCE_SECTIONS
	.map((section, index) => ({ ...section, entry: entries.value[index] ?? null }))
	.filter(section => section.entry))

const activeId = computed(() => {
	const hash = route.hash.replace('#', '')
	return sections.value.some(section => section.id === hash) ? hash : sections.value[0]?.id
})
const activeIndex = computed(() => sections.value.findIndex(section => section.id === activeId.value))
const active = computed(() => sections.value[activeIndex.value] ?? null)

/** Which way the card slides: forward moves left, back moves right. */
const direction = ref(1)
function show(index: number) {
	const next = sections.value[(index + sections.value.length) % sections.value.length]
	if (!next || next.id === activeId.value) return
	direction.value = index > activeIndex.value ? 1 : -1
	router.replace({ hash: `#${next.id}` })
}

useEventListener(window, 'keydown', (event: KeyboardEvent) => {
	const target = event.target as HTMLElement | null
	if (target?.closest('input, textarea, [contenteditable="true"]') || event.metaKey || event.ctrlKey || event.altKey) return
	if (event.key === 'ArrowRight') show(activeIndex.value + 1)
	else if (event.key === 'ArrowLeft') show(activeIndex.value - 1)
})

const pad = (n: number) => String(n).padStart(2, '0')

useSeoMeta({ title: () => t('reference.title') })
</script>

<template>
	<div class="mx-auto w-full max-w-3xl px-5 pt-[5vh] sm:px-8">
		<h1 class="rise font-brand text-5xl font-semibold leading-none tracking-tight text-highlighted sm:text-7xl">{{ t('reference.title') }}</h1>

		<nav class="rise mt-10 grid grid-cols-2 gap-1 sm:grid-cols-4" style="--rise: 1" :aria-label="t('reference.jump')">
			<button
				v-for="(section, i) in sections"
				:key="section.id"
				type="button"
				class="relative rounded-md px-3 py-3 text-start transition-colors"
				:class="activeId === section.id ? 'text-highlighted' : 'text-muted hover:text-highlighted'"
				:aria-current="activeId === section.id ? 'true' : undefined"
				@click="show(i)"
			>
				<Motion v-if="activeId === section.id" layout-id="reference-tab" :transition="SPRING" class="absolute inset-0 rounded-md bg-accented" />
				<span class="relative block font-mono text-xs text-dimmed">{{ pad(i + 1) }}</span>
				<span class="relative mt-1 block text-lg leading-tight">{{ t(`reference.sections.${section.id}`) }}</span>
			</button>
		</nav>
		<p class="rise mt-3 hidden text-xs text-dimmed sm:block" style="--rise: 1">{{ t('reference.keys') }}</p>

		<!-- initial=false: the first card renders visible in the prerendered page, before any script runs. -->
		<AnimatePresence mode="wait" :initial="false">
			<Motion
				v-if="active"
				:key="active.id"
				v-bind="swap('x', 24 * direction)"
				as="article"
				class="mt-12"
			>
				<!-- Imported cards sometimes open with a top-level heading; here it reads as a subheading. -->
				<div class="[&_h1]:mb-4 [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_li]:text-lg [&_p]:text-lg">
					<ContentRenderer :value="active.entry!" />
				</div>
				<NuxtLink :to="active.path" class="mt-10 inline-flex items-center gap-1.5 text-muted transition-colors hover:text-highlighted">
					{{ t('reference.openEntry') }} <UIcon name="i-lucide-arrow-up-right" class="size-4" />
				</NuxtLink>
			</Motion>
		</AnimatePresence>
	</div>
</template>
