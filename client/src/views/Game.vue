<template>
	<component v-if="childComponent" :is="childComponent" />
</template>

<script>
import SocketService from "@/scripts/SocketService"
import HTTPVueLoader from "@/scripts/HTTPVueLoader"
import { GameInfo } from '@/scripts/Constants'

export default {
	name: "Game",
	data: () => ({
		childComponent: null
	}),
	async beforeRouteLeave(to, from, next) {
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
			next(false);
		}
	},
	async mounted() {
		this.childComponent = await HTTPVueLoader.load(this.gameBundleGameURL, "game");
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