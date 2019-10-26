<template>
	<MetroPage page-id="create-game">
		<template v-if="this.gameBundles">
			<div class="row">
				<div class="col col-12 col-md-4">
					<MetroTextBlock class="mb-3" text-style="sub-title">Neues Spiel</MetroTextBlock>
					
					<MetroComboBox
						class="mb-3"
						header="Spielmodul"
						placeholder-text="Spielmodul auswählen"
						:items-source="bundleItems"
						v-model="selectedGameBundle"
						@input="gameBundleSelected"
					/>
					
					<MetroPasswordBox
						class="mb-3"
						header="Passwort"
						placeholder-text="Optional"
						v-model="gameOptions.password"
					/>
					<MetroButton class="mt-3" :disabled="!selectedGameBundle" @click="createGame">Spiel erstellen</MetroButton>
				</div>
				<div class="col col-12 col-md-8" style="padding: 0">
					<div class="row" style="flex-direction: column">
						<div class="col col-12 col-md-6" style="flex: 0">
							<MetroTextBlock class="mb-3" text-style="sub-title">Spiel-Einstellungen</MetroTextBlock>
							<MetroTextBox
								class="mb-3"
								header="Spieler-Limit"
								:placeholder-text="gameOptions.playerLimit.toString()"
								v-model.number="gameOptions.playerLimit"
								:disabled="!selectedGameBundle"
							/>
							
							<MetroTextBox
								class="mb-3"
								header="Zuschauer-Limit"
								:placeholder-text="gameOptions.spectatorLimit.toString()"
								v-model.number="gameOptions.spectatorLimit"
								:disabled="!selectedGameBundle"
							/>
						</div>
						
						<GameOptionsViewer :game-bundle="this.gameBundles[selectedGameBundle]" :game-options="gameOptions" />
					</div>
				</div>
			</div>
		</template>
	</MetroPage>
</template>

<script>
import CryptoJS from "crypto-js"

import SocketService from "@/scripts/SocketService"
import { EventDetail, EventType, GameInfo, MessageType } from "@/scripts/Constants"

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
				type: MessageType.CLIENT_EVENT,
				payload: {
					[EventDetail.EVENT]: EventType.GAME_CREATE,
					[EventDetail.GAME_BUNDLE]: this.selectedGameBundle,
					[EventDetail.GAME_OPTIONS]: JSON.stringify({
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
.page[data-page-id="create-game"] {
	& > .page-content {
		height: 100%;
		overflow-y: auto;
		
		.row {
			height: 100%;
			max-height: 100%;
			
			& > .col {
				padding: 0 5px;
			}
		}	
	}
}
</style>