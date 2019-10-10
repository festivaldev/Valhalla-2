<template>
	<MetroNavigationView pane-display-mode="top" pane-title="fuck" ref="navigation-view" show>
		<template slot="menu-items">
			<MetroNavigationViewItem content="Spiele" page-id="game-list" />
		</template>
		
		<template slot="pane-footer">
			<MetroNavigationViewItem icon="more" content="Mehr" @click.native="showMoreMenu" />
		</template>
		
		<MetroPage page-id="game-list">
			<p>{{gameList}}</p>
		</MetroPage>
	</MetroNavigationView>
</template>

<script>
import axios from "axios"

import SocketService from "@/scripts/SocketService"
import { LongPollEvent, LongPollResponse, MessageType } from "@/scripts/Constants"

export default {
	name: "Root",
	data: () => ({
		gameList: []
	}),
	mounted() {
		if (!SocketService.socket) return this.$router.replace("/login");
		
		this.$refs["navigation-view"].navigate("game-list");
		this.refreshGameList();
		
		SocketService.$on("message", this.onMessage);

	},
	beforeDestroy() {
		SocketService.$off("message", this.onMessage);
	},
	methods: {
		onMessage(message) {
			console.log(message);
			switch (message.type) {
				case MessageType.GAME_EVENT:
					switch (message.payload[LongPollResponse.EVENT]) {
						case LongPollEvent.GAME_LIST_REFRESH:
							this.refreshGameList();
							break;
						default: break;
					}
					break;
				case MessageType.GAME_PLAYER_EVENT:
					break;
				case MessageType.PLAYER_EVENT:
					break;
				default: break;
			}
		},
		showMoreMenu(e) {
			let flyout = new metroUI.MenuFlyout({
				items: [{
					icon: "game",
					text: "Spiel erstellen",
					action: this.createGame
				}, {
					icon: "refresh",
					text: "Aktualisieren",
					action: this.refreshGameList
				}]
			});
			
			flyout.showAt(e.target);
		},
		
		createGame() {
			SocketService.emit({
				type: "create-game",
				payload: {
					gameBundle: "ExampleGameBundle"
				}
			});
		},
		startGame() {
			// this.socket.emit("message", {
			// 	type: "start-game"
			// });
		},
		
		async refreshGameList() {
			this.gameList = await axios.get(`${SocketService.url}/gamelist`).then(response => response.data);
		}
	}
}
</script>

<style lang="less">

</style>