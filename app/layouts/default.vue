<template>
	<div class="relative flex min-h-dvh flex-col">
		<AppCorner />
		<!-- Bottom padding keeps content clear of the floating dock. -->
		<main class="flex-1 pb-36">
			<slot />
		</main>
		<AppDock />
	</div>
</template>
