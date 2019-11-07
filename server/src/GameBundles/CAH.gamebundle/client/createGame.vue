<template>
	<fragment>
		<div class="col col-12 col-md-6" style="flex: 1">
			<MetroTextBox
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
				v-model="gameOptions.useRandomBlackCards"
			/>
			
			<MetroToggleSwitch
				class="mb-3"
				header="Eigene schwarze Karten erlauben"
				on-content="Ja"
				off-content="Nein"
				v-model="gameOptions.allowCustomBlackCards"
				:disabled="gameOptions.useRandomBlackCards"
			/>
			<MetroTextBox
				class="mb-3"
				header="Maximale Anzahl schwarzer Karten"
				:placeholder-text="defaultGameOptions.numberOfBlackCardsToShow.toString()"
				v-model.number="gameOptions.numberOfBlackCardsToShow"
				:disabled="gameOptions.useRandomBlackCards"
			/>
		</div>
		<div class="col col-12 col-md-6" style="flex-basis: 100%">
			<MetroTextBlock class="mb-3" text-style="sub-title">Decks</MetroTextBlock>
			<template v-if="!decks.length">
				<MetroProgressRing :active="true" />
			</template>
			<template v-if="decks.length">
				<MetroCheckBox v-for="(deck, index) in decks" :name="deck.id" :key="index" :content="deck.name" @input="mapItemChanged($event)" :disabled="true" :title="deck.description" />
			</template>
		</div>
	</fragment>
</template>

<script>
const axios = require("axios");
const SocketService = require("SocketService");

module.exports = {
	name: "CAHCreateGame",
	data: () => ({
		decks: [],
		selectedDecks: new Map()
	}),
	async mounted() {
		this.decks = await axios.get(`${SocketService.url}/cah/decks`).then(response => response.data);
	},
	methods: {
		mapItemChanged(e) {
			this.selectedDecks.set(e.target.name, e.target.checked)
			const _decks = [...this.selectedDecks.entries()].filter(([k, v]) => Boolean(v)).map(([k, v]) => k);
			
			this.gameOptions["cardSets"] = _decks;
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