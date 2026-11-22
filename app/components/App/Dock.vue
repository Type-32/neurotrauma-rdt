<script setup lang="ts">
/**
 * The dock: the site's only navigation, floating at the bottom centre. A
 * search field ("What are you looking for?") beside three destinations.
 * Typing grows the dock upward into results, in place, instead of opening a
 * modal. "/" or Ctrl/⌘+K focuses it from anywhere; arrows move, Enter opens,
 * Esc closes.
 */
const { t, locale } = useI18n()
const route = useRoute()
const { ready, failed, load, search } = useSearch()

const term = ref('')
const focused = ref(false)
const active = ref(0)
const input = useTemplateRef<HTMLInputElement>('input')
const wide = useMediaQuery('(min-width: 640px)')
const placeholder = computed(() => wide.value ? t('dock.search') : t('dock.searchShort'))
const root = useTemplateRef<HTMLElement>('root')

const DESTINATIONS = [
	{ id: 'triage', to: '/', icon: 'i-lucide-heart-pulse' },
	{ id: 'reference', to: '/reference', icon: 'i-lucide-book-open' },
	{ id: 'database', to: '/afflictions', icon: 'i-lucide-library' },
] as const

const current = computed(() => {
	const path = route.path
	if (path === '/' || path === '/triage') return 'triage'
	if (path.startsWith('/reference')) return 'reference'
	return ENTRY_TYPES.some(type => path === `/${type}` || path.startsWith(`/${type}/`)) ? 'database' : null
})

const results = computed(() => {
	if (!term.value.trim() || !ready.value) return []
	return search(term.value, 8).map(({ record }) => ({
		record,
		names: entryNames({ title: record.nameZh, nameZh: record.nameZh, nameEn: record.nameEn }, locale.value),
	}))
})
const open = computed(() => focused.value && !!term.value.trim())
const status = computed(() => failed.value ? t('dock.failed') : !ready.value ? t('dock.loading') : !results.value.length ? t('dock.noResults') : '')

watch(term, () => { active.value = 0 })

function onFocus() {
	focused.value = true
	load()
}
function close() {
	focused.value = false
	term.value = ''
	input.value?.blur()
}
function go(path: string) {
	navigateTo(path)
	close()
}
function onKeydown(event: KeyboardEvent) {
	const count = results.value.length
	if (event.key === 'Escape') {
		event.preventDefault()
		close()
	}
	else if (event.key === 'ArrowDown' && count) {
		event.preventDefault()
		active.value = (active.value + 1) % count
	}
	else if (event.key === 'ArrowUp' && count) {
		event.preventDefault()
		active.value = (active.value - 1 + count) % count
	}
	else if (event.key === 'Enter' && results.value[active.value]) {
		event.preventDefault()
		go(results.value[active.value]!.record.path)
	}
}

onClickOutside(root, () => { focused.value = false })
watch(() => route.fullPath, close)

defineShortcuts({
	'/': (event: KeyboardEvent) => {
		event.preventDefault()
		input.value?.focus()
	},
	'meta_k': (event: KeyboardEvent) => {
		event.preventDefault()
		input.value?.focus()
	},
})
</script>

<template>
	<div class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-6">
		<!-- Wrapper: the corner brackets sit just outside the dock, which clips its own overflow. -->
		<div class="relative w-full max-w-xl">
			<div
				ref="root"
				class="dock pointer-events-auto w-full overflow-hidden rounded-xl border border-default shadow-[0_12px_40px_-12px_rgb(0_0_0/0.45)] backdrop-blur-xl"
			>
			<!-- Results grow the dock upward. -->
			<AnimatePresence>
				<Motion
					v-if="open"
					key="results"
					:initial="{ height: 0, opacity: 0 }"
					:animate="{ height: 'auto', opacity: 1 }"
					:exit="{ height: 0, opacity: 0 }"
					:transition="SPRING_SOFT"
					class="overflow-hidden"
				>
					<ul id="dock-results" role="listbox" class="max-h-[min(26rem,55dvh)] overflow-y-auto p-1.5">
						<li v-if="status" class="px-3 py-3 text-sm text-muted">{{ status }}</li>
						<li
							v-for="(hit, i) in results"
							:id="`dock-hit-${i}`"
							:key="hit.record.path"
							role="option"
							:aria-selected="i === active"
							class="relative"
						>
							<Motion
								v-if="i === active"
								layout-id="dock-hit"
								:transition="SPRING"
								class="absolute inset-0 rounded-lg bg-accented/70"
							/>
							<NuxtLink
								:to="hit.record.path"
								class="relative flex items-center gap-3 rounded-lg px-3 py-2.5"
								@mouseenter="active = i"
								@click="close"
							>
								<span
									class="size-1.5 shrink-0 rounded-full"
									:class="hit.record.lethal === 'lethal' ? 'bg-error' : hit.record.lethal === 'possibly-lethal' ? 'bg-warning' : 'bg-transparent'"
									aria-hidden="true"
								/>
								<span class="min-w-0 flex-1">
									<span class="block truncate text-base text-highlighted">{{ hit.names.primary }}</span>
									<span v-if="hit.names.secondary" class="block truncate text-sm text-muted">{{ hit.names.secondary }}</span>
								</span>
								<span class="micro shrink-0 text-dimmed">{{ t(`types.${hit.record.type}`) }}</span>
							</NuxtLink>
						</li>
					</ul>
					<div class="micro flex gap-4 border-t border-default px-4 py-2 text-dimmed">
						<span>↑↓ {{ t('dock.navigate') }}</span>
						<span>↵ {{ t('dock.open') }}</span>
						<span>esc {{ t('dock.close') }}</span>
					</div>
				</Motion>
			</AnimatePresence>

			<div class="flex items-center gap-1 p-1.5">
				<label class="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-2 transition-colors" :class="focused ? 'bg-accented/50' : 'hover:bg-accented/40'">
					<UIcon name="i-lucide-search" class="size-4 shrink-0 text-muted" />
					<input
						ref="input"
						v-model="term"
						type="search"
						role="combobox"
						:aria-expanded="open"
						aria-controls="dock-results"
						:aria-activedescendant="open && results.length ? `dock-hit-${active}` : undefined"
						:placeholder="placeholder"
						:aria-label="t('dock.search')"
						class="min-w-0 flex-1 bg-transparent text-base text-highlighted outline-none placeholder:text-muted"
						@focus="onFocus"
						@keydown="onKeydown"
					>
					<UKbd v-if="!focused" value="/" class="hidden sm:inline-flex" />
				</label>

				<nav class="flex shrink-0 items-center" aria-label="Main">
					<NuxtLink
						v-for="destination in DESTINATIONS"
						:key="destination.id"
						:to="destination.to"
						class="relative flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm transition-colors"
						:class="current === destination.id ? 'text-highlighted' : 'text-muted hover:text-highlighted'"
						:aria-current="current === destination.id ? 'page' : undefined"
						:aria-label="t(`dock.${destination.id}`)"
					>
						<Motion
							v-if="current === destination.id"
							layout-id="dock-current"
							:transition="SPRING"
							class="absolute inset-0 rounded-lg bg-accented"
						/>
						<UIcon :name="destination.icon" class="relative size-4" />
						<span class="relative hidden md:inline">{{ t(`dock.${destination.id}`) }}</span>
					</NuxtLink>
				</nav>
			</div>
			</div>
			<!-- Searching: the brackets close in on the dock. -->
			<MicroCorners :active="focused" />
		</div>
	</div>
</template>

<style scoped>
.dock {
	background: color-mix(in srgb, var(--ui-bg-elevated) 88%, transparent);
}
</style>
