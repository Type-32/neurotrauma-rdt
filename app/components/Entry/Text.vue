<script setup lang="ts">
/**
 * Renders a section item's text: plain text with `[label](href)` links and
 * `**bold**`, which is all the imported items contain. Internal links use
 * ULink, so they navigate client-side.
 */
const props = defineProps<{ text: string }>()

type Token =
	| { kind: 'text', value: string }
	| { kind: 'bold', value: string }
	| { kind: 'link', label: string, href: string, external: boolean }

const TOKEN = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g

const tokens = computed<Token[]>(() => {
	const out: Token[] = []
	let last = 0
	for (const match of props.text.matchAll(TOKEN)) {
		if (match.index > last) out.push({ kind: 'text', value: props.text.slice(last, match.index) })
		if (match[1] !== undefined) {
			const href = match[2]!
			out.push({ kind: 'link', label: match[1], href, external: /^https?:\/\//.test(href) })
		}
		else {
			out.push({ kind: 'bold', value: match[3]! })
		}
		last = match.index + match[0].length
	}
	if (last < props.text.length) out.push({ kind: 'text', value: props.text.slice(last) })
	return out
})
</script>

<template>
	<span>
		<template v-for="(token, index) in tokens" :key="index">
			<ULink
				v-if="token.kind === 'link'"
				:to="token.href"
				:target="token.external ? '_blank' : undefined"
				class="font-medium text-primary hover:underline"
			>{{ token.label }}</ULink>
			<strong v-else-if="token.kind === 'bold'" class="font-semibold text-highlighted">{{ token.value }}</strong>
			<template v-else>{{ token.value }}</template>
		</template>
	</span>
</template>
