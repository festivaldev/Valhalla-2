/**
 * Uno Game Bundle
 * Client Script
 * 
 * © 2019 Team FESTIVAL
 */

(() => {
	Object.assign(window.gameBundles["UnoGameBundle"], {
		defaultGameOptions: {
			playerLimit: 4,
            spectatorLimit: 10,
            flags: {
                "hex": true,
            },
			variant: "classic",
		},
		test: () => {
			console.log("test");
		}
	});
})()