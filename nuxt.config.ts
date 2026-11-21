// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: [
		'@nuxt/content',
		'@nuxt/ui',
		'@type32/nuxt-ui-extras',
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

	routeRules: {
		'/': {prerender: true}
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
