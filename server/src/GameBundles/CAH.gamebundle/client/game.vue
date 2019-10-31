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
		
		<template v-if="currentGame.state == CAHGameState.PLAYING || currentGame.state == CAHGameState.JUDGING">
			<div class="game-container">
				<div class="call-container" v-show="currentGame.state == CAHGameState.PLAYING">
					<div class="current-card" v-if="this.blackCard">
						<div class="card call-card">
							<div class="card-content">
								<MetroTextBlock text-style="sub-title" v-html="blackCard.text.replace(/\n/g, '<br>')"></MetroTextBlock>
							</div>
						</div>
					</div>
				</div>
				<div class="played-responses-container" v-show="currentGame.state == CAHGameState.JUDGING" :disabled="!isJudge">
					<div class="card response-card mb-2 mr-2" :class="{'winning': cards[0].id == winningCard}" v-for="(cards, index) in whiteCards" :key="index" @click="judgeCard(cards)">
						<div class="card-content">
							<MetroTextBlock text-style="sub-title" v-html="combineCards(cards)" :class="{'contrast-text': cards[0].id == winningCard}" />
						</div>
					</div>
				</div>
			</div>
			
			<template v-if="currentGame.state == CAHGameState.PLAYING">
				<MetroTextBlock class="mt-3" v-if="isJudge">Du bist der Juror.<br>Warte auf die anderen Spieler, um eine Karte auszuwählen.</MetroTextBlock>
				<MetroButton v-if="!isJudge" class="mt-3 system-accent-color" @click="playCard(selectedCard)" :disabled="!selectedCard">Auswahl bestätigen</MetroButton>
			</template>
		
			<template v-if="currentGame.state == CAHGameState.JUDGING">
				<MetroTextBlock class="mt-3" v-if="isJudge">Du bist der Juror.<br>Wähle eine Karte, die gewinnen soll.</MetroTextBlock>
				<MetroTextBlock class="mt-3" v-if="!isJudge">Warte auf den Juror, dass er eine Karte auswählt.</MetroTextBlock>
				
				
			</template>
			
			<div class="card-holder" v-if="this.hand.length" :disabled="currentGame.state != CAHGameState.PLAYING || isJudge || blackCard.pick <= 0">
				<transition-group name="played" tag="div" class="card-wrapper">
					<div class="card response-card" :class="{'selected-card': selectedCard === card}" v-for="(card, index) in hand" :key="card.id" @click="selectCard(card)" :style="{'left': `calc((85% / 9) * ${index})`, 'top': `${(9 - index) * 5}px`}">
						<div class="card-content">
							<MetroTextBlock v-html="card.text" />
						</div>
					</div>
				</transition-group>
			</div>
		</template>
	</div>
</template>

<script>
const SocketService = require("SocketService");
const EventDetail = require("EventDetail");
const EventType = require("EventType");
const GameBundleInfo = require("GameBundleInfo");
const GameInfo = require("GameInfo");
const GamePlayerInfo = require("GamePlayerInfo");


const CAHErrorCode = {
	DO_NOT_HAVE_CARD: "doNotHaveCard",
	INVALID_CARD: "invalidCard",
	INVALID_STATE: "invalidState",
	NO_CARD_SPECIFIED: "noCardSpecified",
	NOT_ENOUGH_CARDS: "notEnoughCards",
	NOT_JUDGE: "notJudge",
	NOT_YOUR_TURN: "notYourTurn",
	PLAYED_ALL_CARDS: "playedAllCards"
}

const CAHErrorMessage = {
	DO_NOT_HAVE_CARD: "Du kannst diese Karte nicht spielen, da du sie nicht besitzt.",
	INVALID_CARD: "Du hast eine ungültige Karte angegeben.",
	INVALID_STATE: "Das Spiel befindet sich nicht im erwarteten Zustand. Kontaktiere den Entwickler des Spielmoduls, um diesen Fehler zu beheben.",
	NO_CARD_SPECIFIED: "Du hast keine Karte angegeben.",
	NOT_ENOUGH_CARDS: "Das Kartendeck beinhaltet zu wenige Karten. Füge weitere Decks hinzu, um das Spiel zu starten",
	NOT_JUDGE: "Du bist nicht der Juror.",
	NOT_YOUR_TURN: "Du kannst diese Karte nicht spielen, weil du nicht an der Reihe bist.",
	PLAYED_ALL_CARDS: "Du hast bereits alle benötigten Karten gespielt."
}

const CAHEventDetail = {
	BLACK_CARD: "blackCard",
	HAND: "hand",
	JUDGE_INDEX: "judgeIndex",
	WHITE_CARDS: "whiteCards",
	WINNING_CARD: "winningCard"
}

const CAHEventType = {
	GAME_BLACK_RESHUFFLE: "gameBlackReshuffle",
	GAME_JUDGE_LEFT: "gameJudgeLeft",
	GAME_WHITE_RESHUFFLE: "gameWhiteReshuffle",
	HAND_DEAL: "handDeal",
	JUDGE_CARD: "judgeCard",
	PLAY_CARD: "playCard"
}

const CAHGameInfo = {
	STATE: "state"
}

const CAHGamePlayerInfo = {
	SCORE: "score",
	STATUS: "status"
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
	ROUND_OVER: "roundOver"
}


String.prototype.formatWithArray = function (format) {
	return this.replace(/\{([0-9])\}/g, (match, number) => typeof format[number] !== "undefined" ? format[number] : match);
}

module.exports = {
	name: "CAHGame",
	data: () => ({
		blackCard: null,
		whiteCards: null,
		judgeIndex: null,
		hand: [],
		
		selectedCard: null,
		winningCard: null
	}),
	methods: {
		startGame() {
			this.gameBundle.startGame();
		},
		selectCard(card) {
			if (this.currentGame[GameInfo.PLAYERS][this.judgeIndex][GamePlayerInfo.SOCKET_ID] == this.currentPlayer[GamePlayerInfo.SOCKET_ID]) return;
			
			if (this.selectedCard === card) {
				this.selectedCard = null;
				return;
			}
			
			this.selectedCard = card;
		},
		async playCard(card) {
			if (this.currentGame[GameInfo.PLAYERS][this.judgeIndex][GamePlayerInfo.SOCKET_ID] == this.currentPlayer[GamePlayerInfo.SOCKET_ID]) return;

			this.selectedCard = null;
			this.hand.splice(this.hand.indexOf(this.hand.find(_ => _.id == card.id)), 1);
			this.blackCard.pick--;
			// return;

			if (card.writeIn) {
				let dialog = new metroUI.ContentDialog({
					title: "Leere Karte",
					content: "<div class='text-box'>\
						<label>Gib den Text ein, der auf der Karte stehen soll:</label>\
						<textarea type='text' placeholder='Benötigt' name='card-text' required></textarea>\
					</div>",
					commands: [{ text: "Abbrechen" }, { text: "Ok", primary: true }]
				});
				
				if (await dialog.showAsync() == metroUI.ContentDialogResult.Primary) {
					let _card = Object.assign({}, card);
					_card.text = dialog.text["card-text"];
					this.gameBundle.playCard(_card);
				}
			} else {
				this.gameBundle.playCard(card);
			}
		},
		judgeCard(cards) {
			if (this.currentGame[GameInfo.PLAYERS][this.judgeIndex][GamePlayerInfo.SOCKET_ID] != this.currentPlayer[GamePlayerInfo.SOCKET_ID]) return;
			
			this.gameBundle.judgeCard(cards[0]);
		},
		handleError(payload) {
			if (Object.values(CAHErrorCode).indexOf(payload[EventDetail.ERROR]) < 0) return false;
			
			new metroUI.ContentDialog({
				title: "Fehler",
				content: CAHErrorMessage[Object.keys(CAHErrorCode).find(key => CAHErrorCode[key] == payload[EventDetail.ERROR])],
				commands: [{ text: "Ok", primary: true }]
			}).show()
			
			return true;
		},
		handleGameEvent(payload) {
			switch (payload[EventDetail.EVENT]) {
				case EventType.GAME_STATE_CHANGE:
					this.currentGame[CAHGameInfo.STATE] = payload[EventDetail.GAME_STATE];
					this.currentGame.players = payload[EventDetail.PLAYER_INFO];
					this.blackCard = payload[CAHEventDetail.BLACK_CARD] || this.blackCard;
					this.whiteCards = payload[CAHEventDetail.WHITE_CARDS];
					
					this.judgeIndex = payload[CAHEventDetail.JUDGE_INDEX] != undefined ? payload[CAHEventDetail.JUDGE_INDEX] : this.judgeIndex;
					
					break;
				case CAHEventType.HAND_DEAL:
					this.hand = payload[CAHEventDetail.HAND];
					break;
				case EventType.GAME_ROUND_COMPLETE:
					let roundWinner = this.currentGame.players.find(player => player[GamePlayerInfo.SOCKET_ID] == payload[EventDetail.ROUND_WINNER][GamePlayerInfo.SOCKET_ID]);
					if (!roundWinner) return;
					// roundWinner[CAHGamePlayerInfo.SCORE]++;
					// roundWinner[CAHGamePlayerInfo.STATUS] = CAHGamePlayerStatus.WINNER;
					
					this.winningCard = payload[CAHEventDetail.WINNING_CARD];
					
					if (roundWinner[GamePlayerInfo.SOCKET_ID] == this.currentPlayer[GamePlayerInfo.SOCKET_ID]) {
						new metroUI.Notification({
							title: "Du hast einen Punkt bekommen",
							content: "Deine Karte wurde vom Juror ausgewählt. Dafür bekommst du einen Punkt."
						}).show()
					}

					break;
				case CAHEventType.GAME_JUDGE_LEFT:
					this.currentGame.players = payload[EventDetail.PLAYER_INFO];
					break;
				default: break;
			}
		},
		handleGamePlayerEvent(payload) {
			// switch (payload[EventDetail.EVENT]) {
			// 	case EventType.GAME_PLAY
			// }
		},
		
		combineCards(whiteCards) {
			let output = "";
			let blackCardText = this.blackCard.rawText.split("_");
			
			if (blackCardText.length > 1) {
			blackCardText.forEach((text, index) => {
				output += text;
				
				if (whiteCards[index]) {
					output += `<span class="highlight">${whiteCards[index].text.replace(/\n/g, '<br>')}</span>`;
				}
			});
			} else {
				output = this.blackCard.rawText;
			}
			
			output = output.formatWithArray(whiteCards.map(whiteCard => {
				return `<span class="highlight">${whiteCard.text.replace(/\n/g, '<br>')}</span>`;
			}));

			return output;
		}
	},
	computed: {
		CAHGameState() { return CAHGameState },
		GameInfo() { return GameInfo },
		GamePlayerInfo() { return GamePlayerInfo },
		currentPlayer() {
			return this.currentGame[GameInfo.PLAYERS].find(player => player[GamePlayerInfo.SOCKET_ID] == SocketService.socket.id);
		},
		isHost() {
			console.log(this.currentPlayer);
			return this.currentGame[GameInfo.HOST][GamePlayerInfo.SOCKET_ID] == this.currentPlayer[GamePlayerInfo.SOCKET_ID]
		},
		isJudge() {
			// return this.currentGame[GameInfo.PLAYERS][this.judgeIndex][GamePlayerInfo.SOCKET_ID] == this.currentPlayer[GamePlayerInfo.SOCKET_ID]
			return this.currentPlayer[CAHGamePlayerInfo.STATUS] == CAHGamePlayerStatus.JUDGE || this.currentPlayer[CAHGamePlayerInfo.STATUS] == CAHGamePlayerStatus.JUDGING;
		},
		gameBundle() {
			return window.gameBundles[this.currentGame[GameInfo.GAME_BUNDLE][GameBundleInfo.NAME]];
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
	pointer-events: none;
}

.card .card-content .text-block * {
	max-width: 100%;
	font-size: inherit;
	color: inherit;
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
	box-shadow: inset 0 0 0 1px var(--base-low);
}

.card.response-card .text-block span.highlight {
	font-size: inherit;
	font-weight: inherit;
	color: var(--system-accent-color);
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
	display: flex;
	flex-wrap: wrap;
	margin-left: 5px;
}

.game-container .played-responses-container[disabled] {
	pointer-events: none;
}

body:not(.touch) .game-container .played-responses-container .card.response-card:hover {
	box-shadow: inset 0 0 0 1px var(--system-accent-color);
	cursor: pointer;
}

.game-container .played-responses-container .card.response-card.winning {
	background-color: var(--system-accent-color) !important;
}

.game-container .played-responses-container .card.response-card.winning .text-block span.highlight {
	color: inherit;
}

.card-holder {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 150px;
	transition: transform 250ms cubic-bezier(.215, .61, .355, 1);
}

.card-holder[disabled] {
	pointer-events: none;
	transition: transform 250ms 400ms cubic-bezier(.215, .61, .355, 1);
	transform: translate3d(0, 100%, 0);
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
	transition: top 250ms cubic-bezier(.215, .61, .355, 1), transform 250ms cubic-bezier(.215, .61, .355, 1), opacity 250ms cubic-bezier(.215, .61, .355, 1);
}

body:not(.touch) .card-holder .card:hover,
.card-holder .card.selected-card {
	top: 0 !important;
	transform: translate3d(0, -45%, 0);
}

body:not(.touch) .card-holder .card:hover {
	z-index: 21;
}

.card-holder .card.selected-card {
	z-index: 20;
	box-shadow: inset 0 0 0 1px var(--system-accent-color);
}

.card-holder .card.played-leave-to {
	pointer-events: none;
	top: 0 !important;
	transform: translate3d(0, -95%, 0) !important;
	opacity: 0;
}
</style>