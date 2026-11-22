/**
 * The reader's language, applied after hydration.
 *
 * Pages are prerendered in English (routes have no locale prefix, so there is
 * one HTML file per page). If the browser started in Chinese, the first render
 * would differ from that HTML and Vue would report hydration mismatches. So the
 * app hydrates in English, then switches once the page is live: to the language
 * the reader chose before (cookie), else to Chinese when the browser prefers it.
 * The switch is a normal locale change: labels update and content refetches
 * from the Chinese collections.
 *
 * Every later switch is remembered in the same cookie the i18n module used, so
 * existing readers keep their choice.
 */
export default defineNuxtPlugin((nuxtApp) => {
	const COOKIE = 'i18n_locale'
	const cookie = useCookie<string | null>(COOKIE, { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax', path: '/' })
	const i18n = nuxtApp.$i18n

	const supported = (code: string | null | undefined): code is ContentLocale =>
		!!code && (CONTENT_LOCALES as readonly string[]).includes(code)

	nuxtApp.hook('i18n:localeSwitched', ({ newLocale }) => {
		cookie.value = newLocale
	})

	onNuxtReady(async () => {
		const preferred = supported(cookie.value)
			? cookie.value
			: navigator.languages.some(language => language.toLowerCase().startsWith('zh')) ? 'zh' : null
		if (preferred && preferred !== i18n.locale.value) await i18n.setLocale(preferred)
	})
})
