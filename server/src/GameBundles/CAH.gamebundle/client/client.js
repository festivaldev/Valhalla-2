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
			window.SocketService.emit({type:"start-game"});
		},
		playCard: (card) => {
			window.SocketService.emit({
				type: "game-event",
				payload: {
					event: "play-card",
					card: card
				}
			});
		}
	});
})()