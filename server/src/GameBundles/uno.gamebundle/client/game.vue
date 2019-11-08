<script>
    const SocketService = require("SocketService");
    const EventDetail = require("EventDetail");
    const EventType = require("EventType");
    const GameBundleInfo = require("GameBundleInfo");
    const GameInfo = require("GameInfo");
    const GamePlayerInfo = require("GamePlayerInfo");

    String.prototype.formatWithArray = function (format) {
        return this.replace(/\{([0-9])\}/g, (match, number) => typeof format[number] !== "undefined" ? format[number] : match);
    }

    module.exports = {
        name: "UnoGame",
        data: () => ({
        }),
        methods: {
            startGame() {
                this.gameBundle.startGame();
            },
            handleError(payload) {			
                new metroUI.ContentDialog({
                    title: "COCKFOTZE",
                    content: "FICKHURE",
                    commands: [{ text: "Ok", primary: true }]
                }).show();
                
                return true;
            },
            handleGameEvent(payload) {
                switch (payload[EventDetail.EVENT]) {
                    case EventType.GAME_STATE_CHANGE:
                    case EventType.GAME_ROUND_COMPLETE:
                    default: break;
                }
            },
            handleGamePlayerEvent(payload) {
                // switch (payload[EventDetail.EVENT]) {
                // 	case EventType.GAME_PLAY
                // }
            },
        },
        computed: {
            GameInfo() { return GameInfo },
            GamePlayerInfo() { return GamePlayerInfo },
            currentPlayer() {
                return this.currentGame[GameInfo.PLAYERS].find(player => player[GamePlayerInfo.SOCKET_ID] == SocketService.socket.id);
            },
            isHost() {
                return this.currentGame[GameInfo.HOST][GamePlayerInfo.SOCKET_ID] == this.currentPlayer[GamePlayerInfo.SOCKET_ID]
            },
            gameBundle() {
                return window.gameBundles[this.currentGame[GameInfo.GAME_BUNDLE][GameBundleInfo.NAME]];
            }
        }
    }
</script>

<template>
	<div id="uno-game-view">
		<template v-if="currentGame.state == 'LOBBY'">
			
		</template>
		
		<template v-if="currentGame.state == 'PLAYING'">
			
		</template>
	</div>
</template>

<style>
</style>