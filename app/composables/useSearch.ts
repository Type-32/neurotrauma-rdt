/**
 * The search index and palette state, shared app-wide. The index is the
 * prerendered /search-index.json: downloaded once, when the dock's search is first focused, then
 * searched in the browser with no further requests.
 */
let searchFn: ReturnType<typeof createSearch> | null = null
let loading: Promise<void> | null = null

export function useSearch() {
	const ready = useState('search-ready', () => false)
	const failed = useState('search-failed', () => false)

	/** Downloads and indexes the records, once. Safe to call repeatedly. */
	function load(): Promise<void> {
		if (searchFn) return Promise.resolve()
		loading ??= $fetch<SearchRecord[]>('/search-index.json')
			.then((records) => {
				searchFn = createSearch(records)
				ready.value = true
				failed.value = false
			})
			.catch(() => {
				failed.value = true
				loading = null // allow a retry on the next focus
			})
		return loading
	}

	function search(query: string, limit?: number): SearchResult[] {
		return searchFn ? searchFn(query, limit) : []
	}

	return { ready, failed, load, search }
}
