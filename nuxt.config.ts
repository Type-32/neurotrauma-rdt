import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { ENTRY_TYPES } from './shared/utils/content'

const LOCALES = ['en', 'zh'] as const
const DEFAULT_LOCALE = 'en'

/**
 * Every content entry as a route to prerender. Routes have no locale prefix,
 * so each entry is one route whatever the language. Entries are read from
 * content/en (the base set), since content/zh only holds overrides of the
 * same paths.
 */
function contentRoutes(): string[] {
	const base = join(import.meta.dirname, 'content', DEFAULT_LOCALE)
	return readdirSync(base, { recursive: true, encoding: 'utf8' })
		.filter(file => file.endsWith('.md'))
		.map(file => `/${file.replace(/\\/g, '/').replace(/\.md$/, '')}`)
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: [
		'@nuxt/ui',
		'@type32/nuxt-ui-extras',
		// After @nuxt/ui, or Nuxt UI's prose components aren't used for markdown.
		'@nuxt/content',
		'@nuxt/image',
		'@nuxtjs/i18n',
		'@type32/nuxt-cs-utils',
		'@vueuse/nuxt',
		'motion-v/nuxt',
		'@vite-pwa/nuxt',
		'@nuxt/eslint',
	],

	/**
	 * Installable and offline. The service worker precaches what every page
	 * needs (app code, fonts, the content database dumps, the search and triage
	 * indexes, and the SPA shell), about 5 MB, not all 20 MB of prerendered HTML.
	 * Offline, a page that isn't cached loads the shell (200.html), which renders
	 * it from the cached content database. Pages visited online are cached too.
	 */
	pwa: {
		registerType: 'autoUpdate',
		manifest: {
			name: 'Neurotrauma RDT',
			short_name: 'NT RDT',
			description: 'Rapid diagnosis and treatment reference for the Barotrauma Neurotrauma mod.',
			lang: 'en',
			theme_color: '#16a34a',
			background_color: '#ffffff',
			display: 'standalone',
			start_url: '/',
			icons: [
				{ src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
				{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
				{ src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
				{ src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
			],
		},
		maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
		generateSW: {
			globPatterns: [
				// Not *.json: the module adds _nuxt/builds/**/*.json itself, and a second entry with
				// a different revision would stop the service worker from installing.
				'_nuxt/**/*.{js,css,wasm,woff2}',
				// Interface translations, loaded lazily by @nuxtjs/i18n; without them labels show as keys offline.
				'_i18n/**/messages.json',
				'*.{png,svg,ico}',
				'__nuxt_content/**/sql_dump.txt',
				'search-index.json',
				'triage-index.json',
				'200.html',
				'index.html',
				'triage/index.html',
				'reference/index.html',
				'{afflictions,symptoms,items,procedures,info}/index.html',
			],
			// Build ids (?_b=), content versions (?v=) and triage selections (?f=) don't change the file.
			ignoreURLParametersMatching: [/.*/],
			// No blanket fallback: it would answer every navigation with the shell, even online.
			// The page rule below falls back to the shell only when the network fails.
			navigateFallback: null,
			runtimeCaching: [
				{
					// Entry pages: prerendered HTML when online (cached as you go); offline, the
					// cached copy, or the SPA shell, which renders the entry from the cached content database.
					urlPattern: ({ request }) => request.mode === 'navigate',
					handler: 'NetworkFirst',
					options: {
						cacheName: 'pages',
						networkTimeoutSeconds: 3,
						expiration: { maxEntries: 300 },
						plugins: [{
							// The module precaches 200.html under its clean URL, /200; try both names.
							handlerDidError: async () =>
								(await caches.match('/200', { ignoreSearch: true }))
								?? (await caches.match('/200.html', { ignoreSearch: true }))
								?? Response.error(),
						}],
					},
				},
				{
					urlPattern: /\/_payload\.json/,
					handler: 'StaleWhileRevalidate',
					options: { cacheName: 'payloads', expiration: { maxEntries: 300 } },
				},
			],
		},
		client: {
			installPrompt: true,
		},
	},

	devtools: {
		enabled: true
	},

	vite: {
		optimizeDeps: {
			include: [
				'zod',
				'@internationalized/date',
			]
		},
	},

	css: ['~/assets/css/main.css'],

	content: {
		experimental: {
			// Use Node's built-in node:sqlite instead of compiling better-sqlite3.
			sqliteConnector: 'native',
		},
	},

	i18n: {
		// No locale in URLs: /afflictions/x is the same link in every language,
		// and the chosen locale is remembered in a cookie. Content is still
		// separate per locale (content/en, content/zh) with fallback to en;
		// see content.config.ts.
		strategy: 'no_prefix',
		defaultLocale: DEFAULT_LOCALE,
		locales: [
			{ code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
			{ code: 'zh', language: 'zh-CN', name: '中文', file: 'zh.json' },
		] satisfies Array<{ code: typeof LOCALES[number], language: string, name: string, file: string }>,
		detectBrowserLanguage: {
			useCookie: true,
			cookieKey: 'i18n_locale',
		},
	},

	nitro: {
		prerender: {
			routes: ['/', '/triage', '/reference','/search-index.json', '/triage-index.json',...ENTRY_TYPES.map(type => `/${type}`), ...contentRoutes()],
		},
	},

	image: {
		domains: [],
		provider: 'none',
	},

	runtimeConfig: {
		public: {
			siteName: 'Neurotrauma RDT',
			siteUrl: '',
			// Where "Report a problem" and "Edit on GitHub" point.
			repository: {
				url: 'https://github.com/Type-32/neurotrauma-rdt',
				branch: 'dev',
			},
		},
	},

	compatibilityDate: '2026-06-05',
})
