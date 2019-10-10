/**
 * Example Game Bundle
 * Client Script
 * 
 * © 2019 Team FESTIVAL
 */

(() => {
	Object.assign(gameBundles["ExampleGameBundle"], {
		defaultGameOptions: {
			scoreLimit: 8,
			playerLimit: 10,
			spectatorLimit: 10,
			blankCardLimit: 0
		},
		test: () => {
			console.log("test");
		}
	});
})()