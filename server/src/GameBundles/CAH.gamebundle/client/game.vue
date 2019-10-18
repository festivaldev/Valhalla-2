<template>
	<div>
		<template v-if="currentGame.state == CAHGameState.LOBBY">
			<MetroTextBlock text-style="header">Game Lobby</MetroTextBlock>
			
			<MetroButton :disabled="currentGame.players.length < 3">Start Game</MetroButton>
		</template>
	</div>
</template>

<script>
const CAHGameState = {
	JUDGING: "judging",
	LOBBY: "lobby",
	PLAYING: "playing",
	ROUND_OVER: "round-over"
};

const SocketService = require("SocketService");

module.exports = {
	name: "CAHGame",
	data: () => ({
		
	}),
	methods: {
		startGame() {
			SocketService.emit({type:"start-game"})
		},
		handleGameEvent(message) {
			console.log(message);
		}
	},
	computed: {
		CAHGameState() {
			return CAHGameState;
		}
	}
}
</script>