<script setup lang="ts">
/**
 * Text that "decodes" into place: Latin characters cycle through glyphs and
 * settle left to right. Only for codes and labels, never for content a medic
 * reads (names, treatments). Renders the final text on the server and with
 * reduced motion; screen readers always get the final text.
 */
const props = withDefaults(defineProps<{
	text: string
	/** Milliseconds to fully decode. */
	duration?: number
	delay?: number
}>(), { duration: 420, delay: 0 })

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/<>+*'
const shown = ref(props.text)
const motion = usePreferredReducedMotion()
let frame = 0

function decode() {
	cancelAnimationFrame(frame)
	if (motion.value === 'reduce') {
		shown.value = props.text
		return
	}
	const chars = [...props.text]
	const start = performance.now() + props.delay
	const tick = (now: number) => {
		const progress = Math.min(1, Math.max(0, (now - start) / props.duration))
		const settled = Math.floor(progress * chars.length)
		shown.value = chars
			// Spaces, slashes and non-Latin characters (Chinese) never scramble.
			.map((char, i) => i < settled || /[\s/]|[^\x20-\x7E]/.test(char) ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])
			.join('')
		if (progress < 1) frame = requestAnimationFrame(tick)
	}
	frame = requestAnimationFrame(tick)
}

onMounted(decode)
watch(() => props.text, decode)
onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>

<template>
	<span :aria-label="text"><span aria-hidden="true">{{ shown }}</span></span>
</template>
