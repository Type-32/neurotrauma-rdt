<script setup lang="ts">
/**
 * Home, laid out as a console: triage is the one hot panel, quick reference
 * beside it, a search prompt, and the database as a numbered index with live
 * counts.
 */
const { t, locale } = useI18n()
const siteName = useRuntimeConfig().public.siteName as string
const { open: searchOpen } = useSearch()

// Counts come from the base locale, which every locale falls back to, so they don't change with language.
const { data: stats } = await useAsyncData('home-stats', async () => {
	const lists = await Promise.all(ENTRY_TYPES.map(type => queryEntries(type, BASE_CONTENT_LOCALE)))
	return {
		counts: Object.fromEntries(ENTRY_TYPES.map((type, i) => [type, lists[i]!.length])) as Record<EntryType, number>,
		lethal: lists.flat().filter(entry => lethality(entry) === 'lethal').length,
	}
}, { default: () => ({ counts: {} as Record<EntryType, number>, lethal: 0 }) })

const total = computed(() => Object.values(stats.value.counts).reduce((sum, n) => sum + n, 0))
const pad = (n: number | undefined, width = 3) => String(n ?? 0).padStart(width, '0')
</script>

<template>
	<UContainer class="pb-16 pt-6">
		<MicroPageHead code="SYS // INDEX" :title="siteName" :description="t('site.intro')">
			<dl class="micro grid grid-cols-3 gap-x-5 gap-y-0.5 text-dimmed">
				<dt>{{ t('home.entries') }}</dt>
				<dt>{{ t('home.lethal') }}</dt>
				<dt>{{ t('home.lang') }}</dt>
				<dd class="text-base text-highlighted">{{ pad(total) }}</dd>
				<dd class="text-base text-error">{{ pad(stats.lethal, 2) }}</dd>
				<dd class="text-base text-highlighted">{{ locale.toUpperCase() }}</dd>
			</dl>
		</MicroPageHead>

		<div class="mt-8 grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
			<!-- Triage: the one hot panel -->
			<NuxtLink
				to="/triage"
				class="micro-frame group block bg-elevated px-5 pb-5 pt-3 focus-visible:outline-2 focus-visible:outline-primary"
				style="--frame-color: var(--ui-primary); --frame-size: 12px"
			>
				<div class="flex items-center justify-between gap-3 pb-2">
					<span class="micro text-primary"><span class="text-dimmed">01 //</span> {{ t('triage.title') }}</span>
					<span class="micro text-dimmed">RDT</span>
				</div>
				<MicroRule :delay="0.15" />
				<div class="mt-4 flex items-center gap-6">
					<div class="min-w-0 flex-1">
						<h2 class="font-brand text-3xl font-semibold leading-none tracking-tight text-highlighted sm:text-4xl">{{ t('triage.title') }}</h2>
						<p class="mt-3 max-w-md text-sm text-muted">{{ t('triage.homeDescription') }}</p>
						<p class="micro mt-5 inline-flex items-center gap-2 text-primary">
							&gt; {{ t('home.start') }}
							<UIcon name="i-lucide-arrow-right" class="size-3.5 transition-transform group-hover:translate-x-1" />
						</p>
					</div>
					<MicroGraphic name="orbit" spin class="hidden size-28 text-primary/70 sm:block" />
				</div>
			</NuxtLink>

			<!-- Quick reference -->
			<MicroPanel :index="2" :label="t('reference.title')" :meta="`[${pad(REFERENCE_SECTIONS.length, 2)}]`" :description="t('reference.homeDescription')">
				<ul class="divide-y divide-dashed divide-(--micro-line)">
					<li v-for="(section, i) in REFERENCE_SECTIONS" :key="section.id">
						<NuxtLink :to="`/reference#${section.id}`" class="group flex items-center gap-3 py-2 text-sm text-toned transition-colors hover:text-highlighted">
							<span class="micro text-dimmed">{{ pad(i + 1, 2) }}</span>
							<span class="flex-1">{{ t(`reference.sections.${section.id}`) }}</span>
							<UIcon name="i-lucide-arrow-up-right" class="size-3.5 text-dimmed transition-colors group-hover:text-highlighted" />
						</NuxtLink>
					</li>
				</ul>
			</MicroPanel>
		</div>

		<!-- Search prompt -->
		<button
			type="button"
			class="mt-4 flex w-full items-center gap-3 border border-dashed border-accented bg-elevated/40 px-4 py-3 text-start font-mono text-sm transition-colors hover:border-(--micro-mark) hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
			@click="searchOpen = true"
		>
			<span class="text-primary" aria-hidden="true">&gt;</span>
			<span class="micro-cursor min-w-0 flex-1 truncate text-muted">{{ t('home.search') }}</span>
			<span class="micro hidden text-dimmed sm:inline">{{ t('home.shortcut') }}</span>
			<UKbd value="/" />
		</button>

		<!-- Database index -->
		<MicroPanel :index="3" :label="t('home.database')" :meta="`[${pad(total)}]`" class="mt-4">
			<ul>
				<li v-for="(type, i) in ENTRY_TYPES" :key="type">
					<NuxtLink :to="`/${type}`" class="group flex items-baseline gap-3 py-2.5">
						<span class="micro w-6 shrink-0 text-dimmed">{{ pad(i + 1, 2) }}</span>
						<span class="micro w-9 shrink-0 text-muted transition-colors group-hover:text-primary">{{ TYPE_CODES[type] }}</span>
						<span class="min-w-0 shrink">
							<span class="font-medium text-highlighted">{{ t(`types.${type}`) }}</span>
							<span class="ms-2 hidden text-sm text-muted md:inline">{{ t(`typeDescriptions.${type}`) }}</span>
						</span>
						<span class="mx-1 min-w-6 flex-1 border-b border-dotted border-(--micro-line) transition-colors group-hover:border-(--micro-mark)" aria-hidden="true" />
						<span class="micro text-toned transition-colors group-hover:text-highlighted">[{{ pad(stats.counts[type]) }}]</span>
					</NuxtLink>
				</li>
			</ul>
		</MicroPanel>
	</UContainer>
</template>
