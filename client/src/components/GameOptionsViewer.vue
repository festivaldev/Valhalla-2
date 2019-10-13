<template>
	<div>
		<component v-if="childComponent" :is="childComponent" />
	</div>
</template>

<script>
import axios from "axios"

import SocketService from "@/scripts/SocketService"
import HTTPVueLoader from "@/scripts/HTTPVueLoader"

export default {
	name: "GameOptionsViewer",
	props: {
		gameBundle: null,
		gameOptions: null
	},
	data: () => ({
		childComponent: null
	}),
	computed: {
		gameBundleOptionsURL() {
			if (!this.gameBundle) return;
			
			return `${SocketService.url}/${this.gameBundle.route}/createGame.vue`;
		}
	},
	watch: {
		gameBundle: async function (newBundle, oldBundle) {
			this.childComponent = null;
			this.childComponent = await HTTPVueLoader.load(this.gameBundleOptionsURL, "gameBundleOptions");
		}
	}
}
</script>