/**
 * Shared motion presets. Motion explains change: whatever is touched reacts,
 * and whatever changes as a result travels to its new place. Everything is
 * short (under 300 ms to settle) and never blocks input. MotionConfig in
 * app.vue sets reducedMotion="user", which turns transform and layout
 * animations off for readers who ask for less motion.
 */

/** Snappy spring for things the user moves directly: presses, picks, reorders. */
export const SPRING = { type: 'spring', stiffness: 560, damping: 40, mass: 0.7 } as const

/** Softer spring for things that move as a consequence: answers, panels. */
export const SPRING_SOFT = { type: 'spring', stiffness: 320, damping: 34, mass: 0.9 } as const

/** Fast ease for fades and small slides. */
export const EASE = { duration: 0.18, ease: [0.22, 1, 0.36, 1] } as const

/** Pressed buttons and words sink slightly. */
export const PRESS = { scale: 0.95 } as const

/** Enter / exit for items that appear in place. */
export const APPEAR = {
	initial: { opacity: 0, y: 8 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -6 },
} as const
