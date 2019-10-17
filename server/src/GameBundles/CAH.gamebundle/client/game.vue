<template>
	<div>
		<MetroTextBlock text-style="header">CAH Prototype</MetroTextBlock>
		<MetroButton @click="startGame">Start Game (Test)</MetroButton>
	</div>
</template>

<script>
const SocketService = require("SocketService");

module.exports = {
	name: "CAHGame",
	methods: {
		startGame() {
			SocketService.emit({type:"start-game"})
		},
		handleGameEvent(message) {
			console.log(message);
		}
	}
}
</script>