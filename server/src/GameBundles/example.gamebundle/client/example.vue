<template>
	<p>{{ currentDate }}</p>
</template>

<script>
module.exports = {
	name: "Example",
	computed: {
		currentDate() {
			return new Date().toLocaleString();
		}
	}
}
</script>