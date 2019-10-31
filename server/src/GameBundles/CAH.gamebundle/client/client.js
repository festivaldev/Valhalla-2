/**
 * Cards Against Humanity
 * Client Script
 * 
 * © 2019 Team FESTIVAL
 */

(() => {
	Object.assign(window.gameBundles["CAHGameBundle"], {
		defaultGameOptions: {
			scoreLimit: 8,
			playerLimit: 10,
			spectatorLimit: 10,
			blanksInDeck: 0,
			cardSets: []
		},
		startGame: () => {
			window.SocketService.emit({
				type: "clientEvent",
				payload: {
					event: "gameStart"
				}
			});
		},
		playCard: (card) => {
			window.SocketService.emit({
				type: "gameEvent",
				payload: {
					event: "playCard",
					card: card
				}
			});
		},
		judgeCard: (card) => {
			window.SocketService.emit({
				type: "gameEvent",
				payload: {
					event: "judgeCard",
					card: card
				}
			});
		}
	});
})()