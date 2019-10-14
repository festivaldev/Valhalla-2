<template>
	<MetroPage page-id="create-game">
		<template v-if="this.gameBundles">
			<MetroTextBlock class="mb-3" text-style="sub-title">Neues Spiel</MetroTextBlock>
			
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
					
					<MetroTextBlock class="mt-5 mb-3" text-style="sub-title">Spiel-Einstellungen</MetroTextBlock>
					<MetroTextBox
						header="Spieler-Limit"
						:placeholder-text="gameOptions.playerLimit.toString()"
						v-model.number="gameOptions.playerLimit"
						:disabled="!selectedGameBundle"
						style="margin-bottom: 8px"
					/>
					
					<MetroTextBox
						header="Zuschauer-Limit"
						:placeholder-text="gameOptions.spectatorLimit.toString()"
						v-model.number="gameOptions.spectatorLimit"
						:disabled="!selectedGameBundle"
						style="margin-bottom: 8px"
					/>
					
					<GameOptionsViewer :game-bundle="this.gameBundles[selectedGameBundle]" :game-options="gameOptions" />

					<MetroButton class="mt-3" :disabled="!selectedGameBundle" @click="createGame">Spiel erstellen</MetroButton>
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
		selectedGameBundle: null,
		gameOptions: {
			playerLimit: 0,
			spectatorLimit: 0,
			password: ""
		},
	}),
	methods: {
		gameBundleSelected() {
			this.gameOptions = {
				...this.gameOptions,
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