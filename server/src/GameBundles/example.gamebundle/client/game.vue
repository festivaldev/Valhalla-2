<template>
	<div>
		<MetroTextBlock text-style="sub-title">Example Game</MetroTextBlock>
		<MetroButton @click="sendEvent">Send Event!</MetroButton>
		
		<p>{{currentGame}}</p>
	</div>
</template>

<script>
const SocketService = require("SocketService");
const EventDetail = require("EventDetail");
const EventType = require("EventType");
const GameInfo = require("GameInfo");
const MessageType = require("MessageType");

module.exports = {
	name: "ExampleGame",
	data: () => ({}),
	methods: {
		handleGameEvent(payload) {
			console.log(payload);
			console.log(this.currentGame);
			switch (payload[EventDetail.EVENT]) {
				case "debug":
					new metroUI.ContentDialog({
						title: "Fuck this or that?",
						content: `It's ${payload.fuck} this time`,
						commands: [{ text: "Ok", primary: true }]
					}).show();
					break;
			}
		},
		handleGamePlayerEvent(payload) {
			console.log(payload);
		},
		
		sendEvent() {
			SocketService.emit({
				type: MessageType.GAME_EVENT,
				payload: {
					[EventDetail.EVENT]: "debug"
				}
			});
		}
	}
}
</script>