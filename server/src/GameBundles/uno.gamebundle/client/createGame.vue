<template>
	<fragment>
		<div class="col col-12 col-md-6" style="flex: 1">
			<!-- <MetroTextBox
				class="mb-3"
				header="Punkte-Limit"
				:placeholder-text="defaultGameOptions.scoreLimit.toString()"
				v-model.number="gameOptions.scoreLimit"
			/>

			<MetroTextBox
				class="mb-3"
				header="Leere Karten"
				:placeholder-text="defaultGameOptions.blanksInDeck.toString()"
				v-model.number="gameOptions.blanksInDeck"
			/>
			
			<MetroToggleSwitch
				class="mb-3"
				header="Schwarze Karten zufällig wählen"
				on-content="Ja"
				off-content="Nein"
				v-model="gameOptions.useRandomBlackCards" -->
			/>
		</div>
		<div class="col col-12 col-md-6" style="flex-basis: 100%">
			<MetroTextBlock class="mb-3" text-style="sub-title">Decks</MetroTextBlock>
		</div>
	</fragment>
</template>

<script>
const axios = require("axios");
const SocketService = require("SocketService");

module.exports = {
	name: "UnoCreateGame",
	data: () => ({
	}),
	methods: {
	},
	computed: {
		gameOptions() {
			return this.$parent.gameOptions;
		},
		defaultGameOptions() {
			return window.gameBundles["UnoGameBundle"].defaultGameOptions;
		}
	}
}
</script>