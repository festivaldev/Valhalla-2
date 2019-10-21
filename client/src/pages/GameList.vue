<template>
	<MetroPage page-id="game-list">
		<template v-if="!gameList.length">
			<MetroTextBlock>Es sind derzeit keine Spiele verfügbar, denen du beitreten könntest.</MetroTextBlock>
		</template>
		
		<!-- <template v-if="gameList.length"> -->
			<MetroGridView :items-source="gameList" :is-item-click-enabled="true" @itemClick="gridViewItemClicked">
				<template slot="item-template" slot-scope="{ local }">
					<MetroStackPanel orientation="vertical">
						<div>
							<MetroTextBlock text-style="base">Spiel von {{ local.host }}</MetroTextBlock>
							<MetroTextBlock>{{ local.gameInfo["game-bundle"].displayName }}</MetroTextBlock>
						</div>
						
						<div class="row">
							<div class="col col-6">
								<MetroTextBlock>Spieler: {{ local.gameInfo.players.length }} / {{ local.gameInfo["game-options"].playerLimit }}</MetroTextBlock>
								<MetroTextBlock>Zuschauer: {{ local.gameInfo.spectators.length }} / {{ local.gameInfo["game-options"].spectatorLimit }}</MetroTextBlock>
							</div>
							<div class="col col-6" style=" display: flex; justify-content: flex-end; align-items: flex-end;">
								<MetroSymbolIcon icon="report-hacked" v-if="local.gameInfo['has-password']" />
							</div>
						</div>
					</MetroStackPanel>
				</template>
			</MetroGridView>
		<!-- </template> -->
	</MetroPage>
</template>

<script>
import axios from "axios"
import CryptoJS from "crypto-js"

import SocketService from "@/scripts/SocketService"
import { LongPollEvent, LongPollResponse, MessageType } from "@/scripts/Constants"

export default {
	name: "GameList",
	data: () => ({
		gameList: []
	}),
	mounted() {
		SocketService.$on("message", this.onMessage);
		
		this.refreshGameList();
	},
	beforeDestroy() {
		SocketService.$off("message", this.onMessage);
	},
	methods: {
		onMessage(message) {
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
		async refreshGameList() {
			this.gameList = await axios.get(`${SocketService.url}/gamelist`).then(response => response.data);
		},
		
		async gridViewItemClicked(sender, game, index) {
			if (game.gameInfo["has-password"]) {
				let dialog = new metroUI.ContentDialog({
					title: "Passwort benötigt",
					content: () => (
						<div>
							<MetroTextBlock style="margin-bottom: 8px">Gib das Passwort ein, um diesem Spiel beizutreten.</MetroTextBlock>
							<MetroPasswordBox header="Passwort" placeholder-text="Benötigt" name="password" />
						</div>
					),
					commands: [{ text: "Abbrechen" }, { text: "Spiel beitreten", primary: true }]
				});
				
				if (await dialog.showAsync() == metroUI.ContentDialogResult.Primary) {
					SocketService.emit({
						type: "join-game",
						payload: {
							gameId: game.id,
							password: CryptoJS.SHA512(dialog.text.password).toString(CryptoJS.enc.Hex)
						}
					});
				}
			} else {
				SocketService.emit({
					type: "join-game",
					payload: {
                        gameId: game.id,
					}
				});
			}
		}
	}
}
</script>

<style lang="less">
.page[data-page-id="game-list"] {
	.grid-view .grid-view-item {
		width: 280px;
		height: 140px;
		box-shadow: inset 0 0 0 2px var(--list-low);
		
		.grid-view-item-content {
			height: 100%;
			padding: 8px;
			
			& > .stack-panel {
				height: 100%;
				justify-content: space-between;
			}
		}
	}
}
</style>