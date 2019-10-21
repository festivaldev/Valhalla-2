<template>
	<div>
		<template v-if="currentGame.state == CAHGameState.LOBBY">
			<MetroTextBlock text-style="header" class="mb-4">Lobby</MetroTextBlock>
			
			<template v-if="isHost">
				<MetroTextBlock class="mb-3" v-if="currentGame.players.length < 3">Es werden noch {{ 3 - currentGame.players.length }} Spieler benötigt, um das Spiel starten zu können.</MetroTextBlock>
				<MetroButton :disabled="currentGame.players.length < 3 && false" @click="startGame">Spiel starten</MetroButton>
			</template>
			<template v-else>
				<MetroTextBlock>Auf den Host warten, um das Spiel zu starten.</MetroTextBlock>
			</template>
		</template>
		
		<template v-if="currentGame.state == CAHGameState.PLAYING">
			<div class="game-container">
				<div class="call-container">
					<div class="current-card">
						<div class="card call-card">
							<div class="card-content">
								<MetroTextBlock text-style="sub-title" v-html="blackCard.text"></MetroTextBlock>
							</div>
						</div>
					</div>
				</div>
				<div class="played-responses-container"></div>
			</div>
			
			<div class="card-holder">
				<div class="card-wrapper">
					<div class="card response-card" v-for="(card, index) in hand" :key="index" :style="{'left': `calc((85% / 9) * ${index})`, 'top': `${(9 - index) * 5}px`}">
						<div class="card-content">
							<MetroTextBlock v-html="card.text" />
						</div>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script>
const CAHErrorCode = {
	DO_NOT_HAVE_CARD: "You don't have that card",
	INVALID_CARD: "Invalid card specified",
	NO_CARD_SPECIFIED: "No card specified",
	NOT_JUDGE: "You are not the judge",
	NOT_YOUR_TURN: "It is not your turn to play a card",
	PLAYED_ALL_CARDS: "You already played all the necessary cards"
}

const CAHGamePlayerStatus = {
	HOST: "host",
	IDLE: "idle",
	JUDGE: "judge",
	JUDGING: "judging",
	PLAYING: "playing",
	WINNER: "winner",
	SPECTATOR: "spectator"
}

const CAHGameState = {
	JUDGING: "judging",
	LOBBY: "lobby",
	PLAYING: "playing",
	ROUND_OVER: "round-over"
};

const CAHLongPollResponse = {
	BLACK_CARD: "black-card",
	HAND: "hand",
	WHITE_CARDS: "white-cards",
	WINNING_CARD: "winning-card"
};

const CAHLongPollEvent = {
	GAME_BLACK_RESHUFFLE: "game-black-reshuffle",
	GAME_JUDGE_LEFT: "game-judge-left",
	GAME_WHITE_RESHUFFLE: "game-white-reshuffle",
	HAND_DEAL: "hand-deal"
};

const SocketService = require("SocketService");
const LongPollEvent = require("LongPollEvent");
const LongPollResponse = require("LongPollResponse");

module.exports = {
	name: "CAHGame",
	data: () => ({
		blackCard: null,
		hand: []
	}),
	methods: {
		startGame() {
			SocketService.emit({type:"start-game"})
		},
		playCard(card) {
			
		},
		judgeCard(card) {},
		handleGameEvent(message) {
			console.log(message);
			switch (message.payload.event) {
				case LongPollEvent.GAME_STATE_CHANGE:
					this.blackCard = message.payload[CAHLongPollResponse.BLACK_CARD];
					break;
				case CAHLongPollEvent.HAND_DEAL:
					this.hand = message.payload[CAHLongPollResponse.HAND];
					break;
				default: break;
			}
		},
		handleGamePlayerEvent(message) {}
	},
	computed: {
		CAHGameState() {
			return CAHGameState;
		},
		isHost() {
			return this.currentGame.host["socket-id"] == SocketService.socket.id
		}
	}
}
</script>

<style>
.card {
	position: relative;
	width: 250px;
	border-radius: 10px;
}

.card:before {
	content: '';
	display: block;
	padding-top: 140%;
}

.card .card-content {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 14px;
}

.card.call-card {
	background-color: #212121;
}

.card.call-card .card-content > p.text-block {
	color: #ffffff;
}

.card.call-card .card-content > p.text-block span.spacer {
	display: inline-block;
	height: 18px;
	width: 50px;
	box-shadow: 0 1px 0 0 #fff;
}

.card.response-card {
	background-color: var(--alt-high);
	box-shadow: 0 0 0 1px var(--base-low);
}

.game-container {
	display: flex;
}

.game-container .call-container {
	width: 250px;
	height: 100%;
	margin-right: 5px;
}

.game-container .played-responses-container {
	flex: 1;
	margin-left: 5px;
}

.card-holder {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 150px;
}

.card-holder .card-wrapper {
	position: relative;
	height: 100%;
	margin: 0 12px;
}

.card-holder .card {
	position: absolute;
	float: left;
	width: 15%;
	transition: top 250ms cubic-bezier(.215, .61, .355, 1), transform 250ms cubic-bezier(.215, .61, .355, 1);
}

.card-holder .card:hover {
	z-index: 20;
	top: 0 !important;
	transform: translate3d(0, -45%, 0);
}
</style>