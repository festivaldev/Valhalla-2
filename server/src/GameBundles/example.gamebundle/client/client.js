/**
 * Example Game Bundle
 * Client Script
 * 
 * © 2019 Team FESTIVAL
 */

(() => {
	Object.assign(window.gameBundles["ExampleGameBundle"], {
		defaultGameOptions: {
			playerLimit: 1,
			spectatorLimit: 1,
			exampleProperty: true
		},
		test: () => {
			console.log("test");
		}
	});
})()