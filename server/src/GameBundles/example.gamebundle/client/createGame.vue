<template>
	<div>
		<MetroTextBox header="Spieler-Limit" :placeholder-text="defaultGameOptions.playerLimit.toString()" v-model.number="gameOptions.playerLimit" />
		<MetroTextBox header="Zuschauer-Limit" :placeholder-text="defaultGameOptions.spectatorLimit.toString()" v-model.number="gameOptions.spectatorLimit" />
		<MetroTextBox header="Punkte-Limit" :placeholder-text="defaultGameOptions.scoreLimit.toString()" v-model.number="gameOptions.scoreLimit" />
		
		<MetroCheckBox v-model="gameOptions.exampleProperty" content="Beispiel-Eigenschaft" />
	</div>
</template>

<script>
module.exports = {
	name: "ExampleCreateGame",
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
			return window.gameBundles["ExampleGameBundle"].defaultGameOptions;
		}
	}
}
</script>