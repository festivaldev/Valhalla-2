<template>
	<MetroView view-id="main-view">
		<MetroPage page-id="game">
			<component v-if="childComponent" :is="childComponent" ref="child-component" />
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
		currentGame: window.currentGame
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
	},
	async mounted() {
		this.childComponent = await HTTPVueLoader.load(this.gameBundleGameURL, "game", {
			SocketService: SocketService,
			MessageType: MessageType,
			LongPollEvent: LongPollEvent,
			LongPollResponse: LongPollResponse
		}, (data) => ({
			...data,
			currentGame: this.currentGame
		}));
		
		SocketService.$on("message", this.onMessage);
	},
	methods: {
		onMessage(message) {
			if (message.type == MessageType.GAME_EVENT) {
				switch (message.payload.event) {
					case LongPollEvent.GAME_STATE_CHANGE:
						this.currentGame.state = message.payload[LongPollResponse.GAME_STATE];

						break;
					default: break;
				}
			}
		}
	},
	computed: {
		gameBundleGameURL() {
			if (!this.currentGame) return;
			
			return `${SocketService.url}/${this.currentGame[GameInfo.GAME_BUNDLE].route}/game.vue`;
		}
	}
}
</script>

<style lang="less">
.page[data-page-id="game"] {
	& > .page-content {
		padding: 12px;
	}
}
</style>