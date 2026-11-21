<script setup lang="ts">
/**
 * A framed panel with a numbered micro-label header ("02 // CHECK NEXT"),
 * optional meta on the right, and a hairline that draws in under the header.
 * Tone colours the corner brackets and label: primary for urgent, success
 * for done, info for prompts.
 */
const props = withDefaults(defineProps<{
	label: string
	index?: number
	meta?: string
	description?: string
	tone?: 'default' | 'primary' | 'success' | 'info'
	as?: string
}>(), { index: undefined, meta: undefined, description: undefined, tone: 'default', as: 'section' })

const TONES = {
	default: { frame: 'var(--micro-mark)', label: 'text-highlighted' },
	primary: { frame: 'var(--ui-primary)', label: 'text-primary' },
	success: { frame: 'var(--ui-success)', label: 'text-success' },
	info: { frame: 'var(--ui-info)', label: 'text-info' },
} as const

const tone = computed(() => TONES[props.tone])
</script>

<template>
	<component
		:is="as"
		class="micro-frame bg-elevated/70 px-4 pb-4 pt-3"
		:style="{ '--frame-color': tone.frame, '--frame-size': tone.frame === TONES.default.frame ? '9px' : '12px' }"
	>
		<header class="flex items-center justify-between gap-3 pb-2">
			<h2 class="micro" :class="tone.label">
				<span v-if="index !== undefined" class="text-dimmed">{{ String(index).padStart(2, '0') }} //</span> {{ label }}
			</h2>
			<span v-if="meta || $slots.meta" class="micro text-dimmed"><slot name="meta">{{ meta }}</slot></span>
		</header>
		<MicroRule :delay="0.1 + (index ?? 0) * 0.05" />
		<p v-if="description" class="mt-2 text-xs text-muted">{{ description }}</p>
		<div class="mt-3">
			<slot />
		</div>
	</component>
</template>
