<template>
	<div>
		<component v-if="childComponent" :is="childComponent" />
	</div>
</template>

<script>
import axios from "axios"

import SocketService from "@/scripts/SocketService"

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
			
			return `${SocketService.url}/${this.gameBundle.route}/createGame.html`;
		}
	},
	watch: {
		gameBundle: async function (newBundle, oldBundle) {
			this.childComponent = null;
			let htmlText = await axios.get(this.gameBundleOptionsURL).then(response => response.data);
			
			this.childComponent = {
				template: htmlText,
				data: () => ({
					delegate: this.$parent.$parent,
					gameBundle: this.gameBundle,
					gameOptions: this.gameOptions
				})
			}
		}
	}
}
</script>