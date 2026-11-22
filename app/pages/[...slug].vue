<script setup lang="ts">
// An entry, read first: the name, then what to do (first aid and treatment)
// in large type with nothing beside it. Everything else (what it leads to,
// effects, the full guide text) waits below, opened in place. Content follows
// https://content.nuxt.com/docs/integrations/i18n: the current locale's
// collection, falling back to the base locale (see app/utils/entries.ts).
import { withLeadingSlash } from 'ufo'

const route = useRoute()
const { locale, t } = useI18n()

const path = computed(() => {
	const slug = route.params.slug
	return withLeadingSlash(Array.isArray(slug) ? slug.join('/') : String(slug ?? ''))
})
const type = computed(() => path.value.split('/')[1])

const { data: page } = await useAsyncData(
	() => `entry-${locale.value}-${path.value}`,
	() => isEntryType(type.value) ? queryEntry(type.value, path.value, locale.value as ContentLocale) : Promise.resolve(null),
)

if (!page.value) {
	throw createError({ statusCode: 404, statusMessage: t('page.notFound'), message: t('page.notFoundDescription'), fatal: true })
}

const entryType = computed(() => type.value as EntryType)
const names = computed(() => page.value ? entryNames(page.value, locale.value) : { primary: '' })
const code = computed(() => page.value ? entryCode(entryType.value, page.value.category, page.value.order) : '')
const lethal = computed(() => page.value ? lethality(page.value) : null)

/** Type, plus the category when it says more than the type (not "Items / Items"). */
const headline = computed(() => {
	if (!page.value) return ''
	const typeLabel = t(`types.${entryType.value}`)
	const categories = CATEGORIES[entryType.value]
	const showCategory = entryType.value === 'afflictions' || (categories.length > 1 && page.value.category !== categories[0])
	return showCategory ? `${typeLabel} / ${t(`categories.${page.value.category}`)}` : typeLabel
})

// --- Sections: what leads, and what waits below -------------------------------------
/** Per type, the sections a medic came for. First aid and treatment always lead. */
const LEAD: Record<EntryType, readonly SectionKey[]> = {
	afflictions: ['firstAid', 'treatment'],
	symptoms: ['firstAid', 'treatment', 'causedBy'],
	items: ['firstAid', 'treatment', 'treats', 'effects'],
	procedures: ['firstAid', 'treatment', 'steps'],
	info: ['firstAid', 'treatment'],
}

const sections = computed(() => SECTION_KEYS
	.map(key => ({ key, items: page.value?.[key] as SectionItem[] | undefined }))
	.filter((section): section is { key: SectionKey, items: SectionItem[] } => !!section.items?.length))
const lead = computed(() => sections.value.filter(section => LEAD[entryType.value].includes(section.key)))
const rest = computed(() => sections.value.filter(section => !LEAD[entryType.value].includes(section.key)))
/** With nothing structured to lead with (most info entries), the guide text is the page. */
const textLeads = computed(() => !lead.value.length)

// --- Quiet details, on one line ------------------------------------------------------
const VISIBILITY = [
	{ tag: 'interface-visible', key: 'interface' },
	{ tag: 'scanner-visible', key: 'scanner' },
	{ tag: 'analyzer-visible', key: 'analyzer' },
] as const
const DETAIL_FLAGS: readonly Tag[] = ['essential', 'very-important', 'important', 'first-aid', 'mental-symptom', 'mechanic', 'surgery', 'niche', 'known-issue', 'translator-note', 'unfinished']

const details = computed(() => {
	const entry = page.value
	if (!entry) return []
	const out: string[] = []
	const shown = VISIBILITY.filter(v => entry.tags.includes(v.tag)).map(v => t(`triage.sources.${v.key}`))
	if (shown.length) out.push(shown.join(', '))
	else if (entry.tags.includes('not-visible')) out.push(t('tags.not-visible'))
	if (entry.skill?.medical !== undefined) out.push(entry.skill.medical === 0 ? t('entry.noSkillCheck') : t('entry.medicalSkill', { value: entry.skill.medical }))
	if (entry.skill?.mechanical !== undefined) out.push(t('entry.mechanicalSkill', { value: entry.skill.mechanical }))
	if (entry.source !== 'base') out.push(t(`sources.${entry.source}`))
	if (entry.alsoIn?.length) out.push(t('entry.alsoIn', { list: entry.alsoIn.map(c => t(`categories.${c}`)).join(', ') }))
	for (const flag of DETAIL_FLAGS) if (entry.tags.includes(flag)) out.push(t(`tags.${flag}`))
	return out
})

// --- Procedures --------------------------------------------------------------------
/** Every surgery opens and closes the same way; other procedures point to that one. */
const OPEN_CLOSE = '/procedures/open-close-surgery'
const showOpenClose = computed(() => entryType.value === 'procedures' && path.value !== OPEN_CLOSE)

const stepping = ref(false)
const steps = computed(() => (page.value?.steps as SectionItem[] | undefined ?? [])
	.map((item, i) => ({ id: String(i), text: item.text })))

const { reportUrl, editUrl } = useContentFeedback(() => page.value ? { path: path.value, title: page.value.title } : null)

useSeoMeta({ title: () => page.value?.title })
</script>

<template>
	<article v-if="page" class="mx-auto w-full max-w-3xl px-5 pt-[5vh] sm:px-8">
		<NuxtLink :to="`/${type}`" class="micro rise inline-flex items-center gap-2 text-dimmed transition-colors hover:text-highlighted">
			<UIcon name="i-lucide-arrow-left" class="size-3.5" />{{ headline }}
		</NuxtLink>

		<h1 class="rise mt-6 font-brand text-5xl font-semibold leading-[0.98] tracking-tight text-highlighted sm:text-7xl" style="--rise: 1">
			{{ names.primary }}
		</h1>
		<p class="rise mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xl" style="--rise: 2">
			<span v-if="lethal" :class="lethal === 'lethal' ? 'text-error' : 'text-warning'">
				{{ lethal === 'lethal' ? t('entry.lethal') : t('entry.possiblyLethal') }}
			</span>
			<span v-if="names.secondary" class="text-muted">{{ names.secondary }}</span>
		</p>
		<p class="rise mt-3 text-sm leading-relaxed text-dimmed" style="--rise: 2">
			<template v-for="detail in details" :key="detail">{{ detail }}<span class="mx-2" aria-hidden="true">·</span></template>
			<span class="font-mono text-xs">{{ code }}</span>
		</p>

		<p v-if="showOpenClose" class="rise mt-8 text-base text-muted" style="--rise: 3">
			{{ t('checklist.openCloseTitle') }}.
			<NuxtLink :to="OPEN_CLOSE" class="text-highlighted underline decoration-dotted underline-offset-4 hover:text-primary">{{ t('checklist.openCloseLink') }}</NuxtLink>
		</p>

		<!-- What a medic came for -->
		<div v-if="lead.length" class="mt-14 space-y-14">
			<section v-for="(section, i) in lead" :key="section.key" class="rise" :style="{ '--rise': i + 3 }">
				<h2 class="micro" :class="section.key === 'firstAid' ? 'text-primary' : 'text-muted'">{{ t(`sections.${section.key}`) }}</h2>

				<template v-if="section.key === 'steps'">
					<ol class="mt-4 space-y-3">
						<li v-for="(item, n) in section.items" :key="n" class="flex gap-4 text-xl leading-relaxed text-highlighted">
							<span class="w-6 shrink-0 pt-1 text-end font-mono text-sm text-dimmed">{{ n + 1 }}</span>
							<EntryText :text="item.text" />
						</li>
					</ol>
					<Motion
						as="button"
						type="button"
						:while-press="PRESS"
						class="mt-8 inline-flex items-center gap-3 rounded-md bg-primary px-6 py-3.5 text-lg font-medium text-inverted transition-opacity hover:opacity-90"
						@click="stepping = true"
					>
						<UIcon name="i-lucide-play" class="size-5" />
						{{ t('entry.startSteps') }}
						<span class="font-mono text-sm opacity-70">{{ t('entry.steps', section.items.length) }}</span>
					</Motion>
				</template>
				<EntrySection
					v-else
					class="mt-4"
					:items="section.items"
					:size="section.key === 'firstAid' || section.key === 'treatment' || section.key === 'causedBy' ? 'lead' : 'body'"
					:urgent="section.key === 'firstAid'"
				/>
			</section>
		</div>

		<!-- With nothing structured to lead with, the guide text is the page. -->
		<div v-if="textLeads" class="rise mt-12" style="--rise: 3">
			<ContentRenderer :value="page" />
		</div>

		<!-- Everything else, below the fold, opened in place -->
		<div v-if="rest.length || !textLeads" class="mt-24 border-t border-default">
			<UCollapsible v-for="section in rest" :key="section.key" :unmount-on-hide="false" class="border-b border-default">
				<button type="button" class="group flex w-full items-center gap-4 py-5 text-start">
					<span class="flex-1 text-xl text-highlighted">{{ t(`sections.${section.key}`) }}</span>
					<span class="font-mono text-sm text-dimmed">{{ section.items.length }}</span>
					<UIcon name="i-lucide-chevron-down" class="size-5 text-muted transition-transform duration-200 group-data-[state=open]:rotate-180" />
				</button>
				<template #content>
					<EntrySection class="pb-8" :items="section.items" />
				</template>
			</UCollapsible>

			<!-- Kept in the DOM when closed, so the browser's find still sees it. -->
			<UCollapsible v-if="!textLeads" :unmount-on-hide="false" class="border-b border-default">
				<button type="button" class="group flex w-full items-center gap-4 py-5 text-start">
					<span class="flex-1 text-xl text-highlighted">{{ t('entry.fullText') }}</span>
					<UIcon name="i-lucide-chevron-down" class="size-5 text-muted transition-transform duration-200 group-data-[state=open]:rotate-180" />
				</button>
				<template #content>
					<ContentRenderer :value="page" class="pb-10" />
				</template>
			</UCollapsible>
		</div>

		<p class="mt-16 text-sm text-dimmed">
			{{ t('feedback.prompt') }}
			<ULink :to="reportUrl" target="_blank" class="ms-2 text-muted underline decoration-dotted underline-offset-4 hover:text-highlighted">{{ t('feedback.report') }}</ULink>
			<span class="mx-2" aria-hidden="true">·</span>
			<ULink :to="editUrl" target="_blank" class="text-muted underline decoration-dotted underline-offset-4 hover:text-highlighted">{{ t('feedback.edit') }}</ULink>
		</p>

		<ClientOnly>
			<AnimatePresence>
				<StepThrough
					v-if="stepping"
					key="steps"
					:title="names.primary"
					:steps="steps"
					:done-description="t('entry.doneProcedure')"
					@close="stepping = false"
				/>
			</AnimatePresence>
		</ClientOnly>
	</article>
</template>
