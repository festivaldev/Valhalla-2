<template>
	<div class="scoreboard-content">
		<MetroTextBlock text-style="sub-title">Spiel von {{ currentGame[GameInfo.HOST][GamePlayerInfo.NAME] }} – Punkte</MetroTextBlock>
		<MetroTextBlock text-style="caption">{{ currentGame[GameInfo.GAME_BUNDLE][GameBundleInfo.DISPLAY_NAME] }}</MetroTextBlock>
		<table>
			<thead>
				<tr>
					<th><MetroTextBlock text-style="base">Spielername</MetroTextBlock></th>
					<th><MetroTextBlock text-style="base" text-alignment="right">Socket-ID</MetroTextBlock></th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(player, index) in currentGame.players" :key="index">
					<td>
						<MetroStackPanel orientation="horizontal" horizontal-alignment="left" vertical-alignment="center">
							<MetroPersonPicture :display-name="player.name" style="width: 32px; height: 32px; margin-right: 8px" />
							<MetroTextBlock>{{ player[GamePlayerInfo.NAME] }}</MetroTextBlock>
						</MetroStackPanel>
					</td>
					<td>
						<MetroTextBlock text-alignment="right">{{ player[GamePlayerInfo.SOCKET_ID] }}</MetroTextBlock>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
const GameBundleInfo = require("GameBundleInfo");
const GameInfo = require("GameInfo");
const GamePlayerInfo = require("GamePlayerInfo");

module.exports = {
	name: "ExampleScoreboard",
	data: () => ({}),
	computed: {
		GameBundleInfo() { return GameBundleInfo },
		GameInfo() { return GameInfo },
		GamePlayerInfo() { return GamePlayerInfo },
	}
}
</script>

<style>
.scoreboard-content table {
	width: 100%;
	margin-top: 16px;
}

.scoreboard-content table tbody tr td {
	padding: 8px 0;
}

.scoreboard-content table tr th:nth-child(1),
.scoreboard-content table tr td:nth-child(1) {
	width: 50%;
}

.scoreboard-content table tr th:nth-child(2),
.scoreboard-content table tr th:nth-child(3),
.scoreboard-content table tr td:nth-child(2),
.scoreboard-content table tr td:nth-child(3) {
	width: 25%;
}
</style>