<template>
	<div>
		<MetroTextBox header="Punkte-Limit" :placeholder-text="defaultGameOptions.scoreLimit.toString()" v-model.number="gameOptions.scoreLimit" />
		
		<MetroTextBlock class="mb-3" text-style="sub-title">Decks</MetroTextBlock>
		<template v-if="!decks.length">
			<MetroProgressRing :active="true" />
		</template>
		<template v-if="decks.length">
			<p v-for="(deck, index) in decks" :key="index" :title="deck.description">{{ deck.name }}</p>
		</template>
	</div>
</template>

<script>
const axios = require("axios");
const SocketService = require("SocketService");

module.exports = {
	name: "CAHCreateGame",
	data: () => ({
		decks: []
	}),
	async mounted() {
		this.decks = await axios.get(`${SocketService.url}/cah/decks`).then(response => response.data);
	},
	methods: {
		test() {
			alert("Test");
		}
	},
	computed: {
		gameOptions() {
			return this.$parent.gameOptions;
		},
		defaultGameOptions() {
			return window.gameBundles["CAHGameBundle"].defaultGameOptions;
		}
	}
}
</script>