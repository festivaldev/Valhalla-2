/**
 * Example Game Bundle
 * Client Script
 * 
 * © 2019 Team FESTIVAL
 */

(() => {
	Object.assign(window.gameBundles["ExampleGameBundle"], {
		defaultGameOptions: {
			scoreLimit: 8,
			playerLimit: 10,
			spectatorLimit: 10,
			exampleProperty: true
		},
		test: () => {
			console.log("test");
		}
	});
})()