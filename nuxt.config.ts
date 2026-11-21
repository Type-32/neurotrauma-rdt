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
		'motion-v/nuxt'
	],

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
			routes: ['/', '/search-index.json', ...ENTRY_TYPES.map(type => `/${type}`), ...contentRoutes()],
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
		},
	},

	compatibilityDate: '2026-06-05',
})
