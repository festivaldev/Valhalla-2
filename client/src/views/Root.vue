<template>
	<MetroNavigationView pane-display-mode="top" pane-title="fuck" ref="navigation-view" show>
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

export default {
	name: "Root",
	components: {
		GameList,
		CreateGame
	},
	data: () => ({
		gameList: [],
		test: "ExampleGameBundle"
	}),
	mounted() {
		if (!SocketService.socket) return this.$router.replace("/login");
		
		this.$refs["navigation-view"].navigate("game-list");
		
		// SocketService.$on("message", this.onMessage);

	},
	beforeDestroy() {
		// SocketService.$off("message", this.onMessage);
	},
	methods: {
		onMessage(message) {
			switch (message.type) {
				case MessageType.GAME_EVENT:
					break;
				case MessageType.GAME_PLAYER_EVENT:
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