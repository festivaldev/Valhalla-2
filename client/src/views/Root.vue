<template>
	<MetroNavigationView pane-display-mode="top" pane-title="fuck" ref="navigation-view">
		<template slot="menu-items">
			<MetroNavigationViewItem content="Spiele" page-id="game-list" />
		</template>
		
		<MetroPage page-id="game-list">
			<MetroTextBlock text-style="header">Spiele</MetroTextBlock>
		</MetroPage>
		
		<MetroPage page-id="settings">
			<MetroTextBlock text-style="sub-header">Einstellungen</MetroTextBlock>
			<MetroBackgroundThemeSelector />
			<MetroAccentColorSelector />
		</MetroPage>
	</MetroNavigationView>
</template>

<script>
import io from "socket.io-client"

export default {
	name: "Root",
	mounted() {
		this.$refs["navigation-view"].navigate("game-list");
	},
	methods: {
		createGame() {
			this.socket.emit("message", {
				type: "create-game",
				payload: {
					gameBundle: "ExampleGameBundle"
				}
			});
		},
		startGame() {
			this.socket.emit("message", {
				type: "start-game"
			});
		}
	}
}
</script>

<style lang="less">

</style>