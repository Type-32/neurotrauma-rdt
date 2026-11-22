import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { type ContentLocale, ENTRY_TYPES } from './shared/utils/content'

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
		'@nuxt/eslint',
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
		// No locale in URLs: /afflictions/x is the same link in every language.
		// Content is still separate per locale (content/en, content/zh) with
		// fallback to en; see content.config.ts.
		strategy: 'no_prefix',
		defaultLocale: DEFAULT_LOCALE,
		locales: [
			{ code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
			{ code: 'zh', language: 'zh-CN', name: '中文', file: 'zh.json' },
		] satisfies Array<{ code: ContentLocale, language: string, name: string, file: string }>,
		// Off: every page is prerendered in English, and the browser must hydrate
		// in that same language or Vue reports mismatches. The reader's language
		// (cookie, else the browser's) is applied right after hydration by
		// app/plugins/locale.client.ts, which also remembers it.
		detectBrowserLanguage: false,
		experimental: {
			// Always write /_i18n/<hash>/<locale>/messages.json at build time, whatever the deploy
			// preset. The module only does this on its own when Nitro reports a static build, and
			// switching language fetches these files.
			prerenderMessages: true,
		},
	},

	nitro: {
		prerender: {
			routes: [
				'/',
				'/triage',
				'/reference',
				'/search-index.json',
				'/triage-index.json',
				...ENTRY_TYPES.map(type => `/${type}`),
				...contentRoutes(),
			],
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
