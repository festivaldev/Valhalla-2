<template>
	<MetroView view-id="main-view">
		<MetroPage page-id="game">
			<component v-if="childComponent" :is="childComponent" ref="child-component" />
			<div class="scoreboard" :class="{'visible': scoreboardVisible}" v-if="scoreboardComponent">
				<component :is="scoreboardComponent" ref="scoreboard-component" />
			</div>
		</MetroPage>
	</MetroView>
</template>

<script>
import SocketService from "@/scripts/SocketService"
import HTTPVueLoader from "@/scripts/HTTPVueLoader"
import { EventDetail, EventType, GameBundleInfo, GameInfo, GamePlayerInfo, MessageType } from '@/scripts/Constants'

export default {
	name: "Game",
	data: () => ({
		childComponent: null,
		scoreboardComponent: null,
		currentGame: window.currentGame,
		
		scoreboardVisible: false
	}),
	async beforeRouteLeave(to, from, next) {
		if (!SocketService.socket) {
			next();
		} else {
			let dialog = new metroUI.ContentDialog({
				title: "Spiel verlassen?",
				content: "Möchtest du das Spiel wirklich verlassen? Dein Fortschritt geht dabei verloren.",
				commands: [{text: "Abbrechen"},{text:"Ok", primary: true}]
			});
			
			if (await dialog.showAsync() == metroUI.ContentDialogResult.Primary) {
				SocketService.emit({
					type: MessageType.CLIENT_EVENT,
					payload: {
						[EventDetail.EVENT]: EventType.GAME_LEAVE
					}
				});
				next();
			} else {
				return next(false);
			}
		}
		
		this.currentGame = window.currentGame = null;
	},
	async mounted() {
		try {
			this.childComponent = await HTTPVueLoader.load(this.gameBundleGameURL, "game", {
				SocketService: SocketService,
				EventDetail: EventDetail,
				EventType: EventType,
				GameInfo: GameInfo,
				GamePlayerInfo: GamePlayerInfo,
				MessageType: MessageType,
			}, (data) => ({
				...data,
				currentGame: this.currentGame
			}));
		} catch (e) {
			console.log("[Error] Could not load game container");
		}
		
		try {	
			this.scoreboardComponent = await HTTPVueLoader.load(this.gameBundleScoreboardURL, "scoreboard", {
				GameBundleInfo: GameBundleInfo,
				GameInfo: GameInfo,
				GamePlayerInfo: GamePlayerInfo,
			}, (data) => ({
				...data,
				currentGame: this.currentGame
			}));
		} catch (e) {
			console.log("[Error] Could not load game scoreboard");
		}
		
		SocketService.$on("message", this.onMessage);
		
		window.addEventListener("keydown", this.onKeyDown);
		window.addEventListener("keyup", this.onKeyUp);
	},
	beforeDestroy() {
		SocketService.$off("message", this.onMessage);
		
		window.removeEventListener("keydown", this.onKeyDown);
		window.removeEventListener("keyup", this.onKeyUp);
	},
	methods: {
		onMessage(message) {
			console.log(message);
			const payload = message.payload;
			
			switch (message.type) {
				case MessageType.GAME_EVENT:
					if (payload[EventDetail.EVENT] == EventType.GAME_OPTIONS_CHANGED) {
						this.currentGame = payload[EventDetail.GAME_INFO];
						this.$refs["child-component"].currentGame = this.currentGame;
					}
					
					this.$refs["child-component"].handleGameEvent(payload);
					break;
				case MessageType.GAME_PLAYER_EVENT:
					switch (payload[EventDetail.EVENT]) {
						case EventType.GAME_PLAYER_JOIN:
							this.currentGame.players.push(payload[EventDetail.PLAYER_INFO]);
							break;
						case EventType.GAME_PLAYER_LEAVE:
							this.currentGame.players
								.splice(this.currentGame.players
									.indexOf(this.currentGame.players
										.find(player => player[GamePlayerInfo.SOCKET_ID] === payload[EventDetail.PLAYER_INFO][GamePlayerInfo.SOCKET_ID])), 1);
							break;
					}
					this.$refs["child-component"].handleGamePlayerEvent(payload);
					break;
			}
		},
		
		onKeyDown(event) {
			switch (event.keyCode) {
				case 9:
					event.preventDefault();
					this.scoreboardVisible = true;
					break;
				default: break
			}
		},
		onKeyUp(event) {
			switch (event.keyCode) {
				case 9:
					event.preventDefault();
					this.scoreboardVisible = false;
					break;
				default: break
			}
		}
	},
	computed: {
		gameBundleGameURL() {
			if (!this.currentGame) return;
			
			return `${SocketService.url}/${this.currentGame[GameInfo.GAME_BUNDLE].route}/game.vue`;
		},
		gameBundleScoreboardURL() {
			if (!this.currentGame) return;
			
			return `${SocketService.url}/${this.currentGame[GameInfo.GAME_BUNDLE].route}/scoreboard.vue`;
		}
	}
}
</script>

<style lang="less">
.page[data-page-id="game"] {
	& > .page-content {
		padding: 12px;
	}
	
	.scoreboard {
		display: flex;
		flex-direction: column;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate3d(-50%, -50%, 0);
		width: 1024px;
		max-width: calc(~"100% - 100px");
		min-height: 184px;
		max-height: 100%;
		padding: 18px 24px;
		background-color: var(--alt-high);
		box-shadow: inset 0 0 0 1px var(--base-low);
		z-index: 1100;
		visibility: visible;
		transition: visibility .1s;
		animation: dialog-in 250ms cubic-bezier(.215, .61, .355, 1);
		
		&:not(.visible) {
			pointer-events: none;
			visibility: hidden;
			animation: dialog-out .1s cubic-bezier(.55, .055, .675, .19) forwards;
		}
	}
}
</style>
