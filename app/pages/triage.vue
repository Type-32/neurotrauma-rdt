<script setup lang="ts">
// Triage moved to the home page. Old links (including shared patients, ?f=…)
// land here and are sent on with their query intact.
const route = useRoute()
onMounted(() => navigateTo({ path: '/', query: route.query }, { replace: true }))
</script>

<template>
	<div />
</template>
