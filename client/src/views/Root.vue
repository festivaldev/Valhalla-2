<template>
	<MetroNavigationView pane-display-mode="top" pane-title="fuck" ref="navigation-view">
		<template slot="menu-items">
			<MetroNavigationViewItem content="Spiele" page-id="game-list" />
		</template>
		
		<template slot="pane-footer">
			<MetroNavigationViewItem icon="more" content="Mehr" @click.native="showMoreMenu" />
		</template>
	
		<GameList ref="game-list" />
		<CreateGame />
	</MetroNavigationView>
</template>

<script>
import SocketService from "@/scripts/SocketService"
import { MessageType } from "@/scripts/Constants"

import GameList from "@/pages/GameList"
import CreateGame from "@/pages/CreateGame"
import { GameInfo, LongPollResponse, LongPollEvent } from '@/scripts/Constants'

export default {
	name: "Root",
	components: {
		GameList,
		CreateGame
	},
	data: () => ({
		gameList: [],
		testComponent: null
	}),
	async mounted() {
		if (!SocketService.socket) return this.$router.replace("/login");
		SocketService.$on("message", this.onMessage);
		
		this.$refs["navigation-view"].navigate("game-list");
	},
	beforeDestroy() {
		SocketService.$off("message", this.onMessage);
	},
	methods: {
		onMessage(message) {
			console.log(message);
			switch (message.type) {
				case MessageType.GAME_EVENT:
					break;
				case MessageType.GAME_PLAYER_EVENT:
					switch (message.payload[LongPollResponse.EVENT]) {
						case LongPollEvent.GAME_JOIN:
							window.currentGame = message.payload[LongPollResponse.GAME_INFO];
							this.$router.push(`/game/${message.payload[LongPollResponse.GAME_INFO][GameInfo.ID]}`)
							break;
						default: break;
					}
					break;
				case MessageType.PLAYER_EVENT:
					break;
				default: break;
			}
		},
		showMoreMenu(e) {
			let test = "ExampleGameBundle";
			
			let flyout = new metroUI.MenuFlyout({
				items: [{
					icon: "game",
					text: "Spiel erstellen",
					action: () => {
						this.$refs["navigation-view"].navigate("create-game");
					}
				}, {
					icon: "refresh",
					text: "Aktualisieren",
					action: () => {
						this.$refs["game-list"].refreshGameList();
					}
				}]
			});
			
			flyout.showAt(e.target);
		}
	},
	computed: {
		gameBundles() {
			return window.gameBundles;
		}
	}
}
</script>

<style lang="less">

</style>