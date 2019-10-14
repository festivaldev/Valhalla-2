<template>
	<MetroPage page-id="create-game">
		<template v-if="this.gameBundles">
			<MetroTextBlock text-style="title" style="margin-bottom: 8px">Neues Spiel</MetroTextBlock>
			
			<div class="row">
				<div class="col col-12 col-md-3">
					<MetroComboBox
						header="Spielmodul"
						placeholder-text="Spielmodul auswählen"
						:items-source="bundleItems"
						v-model="selectedGameBundle"
						@input="gameBundleSelected"
						style="margin-bottom: 8px"
					/>
					<MetroPasswordBox
						header="Passwort"
						placeholder-text="Optional"
						v-model="gameOptions.password"
						style="margin-bottom: 8px"
					/>
					
					<GameOptionsViewer :game-bundle="this.gameBundles[selectedGameBundle]" :game-options="gameOptions" />
					<p>{{gameOptions}}</p>

					<MetroButton :disabled="!selectedGameBundle" @click="createGame">Spiel erstellen</MetroButton>
				</div>
			</div>
		</template>
	</MetroPage>
</template>

<script>
import CryptoJS from "crypto-js"

import SocketService from "@/scripts/SocketService"

import GameOptionsViewer from "@/components/GameOptionsViewer"

export default {
	name: "CreateGame",
	components: {
		GameOptionsViewer
	},
	data: () => ({
		selectedGameBundle: "",
		gameOptions: {
			password: ""
		}
	}),
	methods: {
		gameBundleSelected() {
			this.gameOptions = {
				...this.gameBundles[this.selectedGameBundle].defaultGameOptions,
				password: this.gameOptions.password
			}
		},
		createGame() {
			SocketService.emit({
				type: "create-game",
				payload: {
					gameBundle: this.selectedGameBundle,
					gameOptions: JSON.stringify({
						...this.gameOptions,
						password: this.gameOptions.password ? CryptoJS.SHA512(this.gameOptions.password).toString(CryptoJS.enc.Hex) : undefined
					})
				}
			});
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