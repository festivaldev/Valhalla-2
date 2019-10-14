<template>
	<component v-if="childComponent" :is="childComponent" ref="child-component" />
</template>

<script>
import SocketService from "@/scripts/SocketService"
import HTTPVueLoader from "@/scripts/HTTPVueLoader"
import { GameInfo, MessageType } from '@/scripts/Constants'

export default {
	name: "Game",
	data: () => ({
		childComponent: null
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
		this.childComponent = await HTTPVueLoader.load(this.gameBundleGameURL, "game");
		
		SocketService.$on("message", this.onMessage);
	},
	methods: {
		onMessage(message) {
			if (message.type == MessageType.GAME_EVENT) {
				this.$refs["child-component"].handleGameEvent(message);
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
		}
	}
}
</script>