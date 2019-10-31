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
import { ErrorCode, ErrorMessage, EventDetail, EventType, GameInfo, MessageType } from "@/scripts/Constants"

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
		testComponent: null
	}),
	mounted() {
		if (!SocketService.socket) return this.$router.replace("/login");
		SocketService.$on("message", this.onMessage);
		
		this.$refs["navigation-view"].navigate("game-list");
	},
	beforeDestroy() {
		SocketService.$off("message", this.onMessage);
	},
	methods: {
		onMessage(message) {
			// console.log(message);
			const payload = message.payload;
			
			switch (message.type) {
				case MessageType.ERROR:
					new metroUI.ContentDialog({
						title: "Fehler",
						content: ErrorMessage[Object.keys(ErrorCode).find(key => ErrorCode[key] == payload[EventDetail.ERROR])],
						commands: [{ text: "Ok", primary: true }]
					}).show()
					break;
				case MessageType.CLIENT_EVENT:
					switch (payload[EventDetail.EVENT]) {
						case EventType.GAME_LIST_REFRESH:
							this.$refs["game-list"].refreshGameList();
							break;
						case EventType.GAME_JOIN:
							window.currentGame = payload[EventDetail.GAME_INFO];
							this.$router.push(`/game/${window.currentGame[GameInfo.ID]}`);
							break;
						case EventType.GAME_LEAVE:
							window.currentGame = null;
							break;
					}
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