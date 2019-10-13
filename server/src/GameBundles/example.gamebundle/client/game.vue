<template>
	<div>
		<MetroTextBlock text-style="caption">Game</MetroTextBlock>
		<MetroButton @click="gameBundle.test">Test</MetroButton>
	</div>
</template>

<script>
module.exports = {
	name: "ExampleGame",
	computed: {
		gameBundle() {
			return window.gameBundles["ExampleGameBundle"]
		}
	}
}
</script>