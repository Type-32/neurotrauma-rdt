<template>
	<div class="micro-grid flex min-h-dvh flex-col">
		<LayoutHeader />
		<UMain class="flex-1">
			<slot />
		</UMain>
		<LayoutStatusBar />
		<SearchPalette />
	</div>
</template>
