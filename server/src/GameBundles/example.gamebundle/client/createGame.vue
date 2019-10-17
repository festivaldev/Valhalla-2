<template>
	<div>
		<MetroTextBox header="Punkte-Limit" :placeholder-text="defaultGameOptions.scoreLimit.toString()" v-model.number="gameOptions.scoreLimit" />
		
		<MetroCheckBox v-model="gameOptions.exampleProperty" content="Beispiel-Eigenschaft" />
		<p>{{SocketService.url}}</p>
	</div>
</template>

<script>
const SocketService = require("SocketService");

module.exports = {
	name: "ExampleCreateGame",
	methods: {
		test() {
			alert("Test");
		}
	},
	computed: {
		SocketService() {
			return SocketService;
		},
		gameOptions() {
			return this.$parent.gameOptions;
		},
		defaultGameOptions() {
			return window.gameBundles["ExampleGameBundle"].defaultGameOptions;
		}
	}
}
</script>