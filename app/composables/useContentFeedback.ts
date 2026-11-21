/**
 * "Report a problem" and "Edit on GitHub" links for an entry. Reporting opens
 * a new GitHub issue with the entry filled in; editing opens the entry's
 * markdown file in GitHub's editor. The repository and branch come from
 * runtimeConfig.public.repository (NUXT_PUBLIC_REPOSITORY_URL / _BRANCH).
 *
 * The issue only carries the entry's title and path, nothing about the reader.
 */
export function useContentFeedback(entry: MaybeRefOrGetter<{ path: string, title: string } | null>) {
	const { repository } = useRuntimeConfig().public
	const { t } = useI18n()

	const reportUrl = computed(() => {
		const value = toValue(entry)
		if (!value) return repository.url
		const params = new URLSearchParams({
			title: `[Content] ${value.title}`,
			body: [
				`**${t('feedback.issueEntry')}:** ${value.title}`,
				`**${t('feedback.issuePage')}:** ${value.path}`,
				`**${t('feedback.issueFile')}:** content/${BASE_CONTENT_LOCALE}${value.path}.md`,
				'',
				`**${t('feedback.issueWhat')}:**`,
				'',
				'',
				`**${t('feedback.issueSource')}:**`,
				'',
			].join('\n'),
		})
		return `${repository.url}/issues/new?${params}`
	})

	const editUrl = computed(() => {
		const value = toValue(entry)
		return value ? `${repository.url}/edit/${repository.branch}/content/${BASE_CONTENT_LOCALE}${value.path}.md` : repository.url
	})

	return { reportUrl, editUrl }
}
