<template>
	<MetroPage page-id="game-list">
		<p>{{ gameList }}</p>
	</MetroPage>
</template>

<script>
import axios from "axios"

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
			console.log(this.gameList);
		}
	}
}
</script>