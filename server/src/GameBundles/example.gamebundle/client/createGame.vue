<template>
	<div>
		<MetroTextBox header="Spieler-Limit" :placeholder-text="defaultGameOptions.playerLimit.toString()" v-model="gameOptions.playerLimit" />
		<MetroTextBox header="Zuschauer-Limit" :placeholder-text="defaultGameOptions.spectatorLimit.toString()" v-model="gameOptions.spectatorLimit" />
		<MetroTextBox header="Punkte-Limit" :placeholder-text="defaultGameOptions.scoreLimit.toString()" v-model="gameOptions.scoreLimit" />
		
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