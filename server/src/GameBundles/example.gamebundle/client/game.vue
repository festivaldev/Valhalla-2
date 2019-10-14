<template>
	<div>
		<MetroTextBlock text-style="caption">Game</MetroTextBlock>
		<MetroButton @click="sendShit">Test</MetroButton>
	</div>
</template>

<script>
module.exports = {
	name: "ExampleGame",
	methods: {
		sendShit() {
			window.SocketService.emit({
				type: "game-event"
			})
		},
		handleGameEvent(message) {
			alert(`fuck ${message.payload["fuck"]}`);
		}
	},
	computed: {
		gameBundle() {
			return window.gameBundles["ExampleGameBundle"]
		}
	}
}
</script>