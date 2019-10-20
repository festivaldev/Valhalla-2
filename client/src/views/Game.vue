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
import { GameInfo, LongPollEvent, LongPollResponse, MessageType } from '@/scripts/Constants'

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
					type: "leave-game"
				});
				next();
			} else {
				return next(false);
			}
		}
		
		SocketService.$off("message", this.onMessage);
		
		window.removeEventListener("keydown", this.onKeyDown);
		window.removeEventListener("keyup", this.onKeyUp);
	},
	async mounted() {
		this.childComponent = await HTTPVueLoader.load(this.gameBundleGameURL, "game", {
			SocketService: SocketService,
			MessageType: MessageType,
			LongPollEvent: LongPollEvent,
			LongPollResponse: LongPollResponse
		});
		
		this.scoreboardComponent = await HTTPVueLoader.load(this.gameBundleScoreboardURL, "scoreboard", null, (data) => ({
			...data,
			currentGame: this.currentGame
		}));
		
		SocketService.$on("message", this.onMessage);
		
		window.addEventListener("keydown", this.onKeyDown);
		window.addEventListener("keyup", this.onKeyUp);
	},
	methods: {
		onMessage(message) {
			if (message.type == MessageType.GAME_EVENT) {
				this.$refs["child-component"].handleGameEvent(message);
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
		currentGame() {
			return window.currentGame;
		},
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
