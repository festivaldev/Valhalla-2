<template>
	<MetroPage page-id="create-game">
		<template v-if="this.gameBundles">
			<MetroTextBlock text-style="sub-header">Neues Spiel</MetroTextBlock>
			
			<MetroComboBox placeholder-text="Spielmodul auswählen" :items-source="bundleItems" v-model="selectedGameBundle" @input="gameBundleSelected" />
			<GameOptionsViewer :game-bundle="this.gameBundles[selectedGameBundle]" :game-options="gameOptions" />
			<p>{{gameOptions}}</p>

			<MetroButton :disabled="!selectedGameBundle">Spiel erstellen</MetroButton>
		</template>
	</MetroPage>
</template>

<script>
import GameOptionsViewer from "@/components/GameOptionsViewer"

export default {
	name: "CreateGame",
	components: {
		GameOptionsViewer
	},
	data: () => ({
		selectedGameBundle: "",
		gameOptions: {}
	}),
	methods: {
		gameBundleSelected() {
			this.gameOptions = {...this.gameBundles[this.selectedGameBundle].defaultGameOptions}
		}
	},
	computed: {
		gameBundles() {
			return window.gameBundles;
		},
		bundleItems() {
			return Object.keys(this.gameBundles).map(bundle => ([
				bundle,
				this.gameBundles[bundle].displayName
			])).reduce((list, bundle) => ({
				...list,
				[bundle[0]]: bundle[1]
			}), {});
		}
	}
}
</script>

<style lang="less">

</style>