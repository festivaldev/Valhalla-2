import { Express } from "express";
import path from "path";

import IGameBundle from "../IGameBundle";
import Middleware from "./Uno.middleware";
import IGameLogic from "../IGameLogic";
import UnoGameLogic from "./UnoGameLogic";
import UnoGameOptions from "./UnoGameOptions";
import Game from "../../classes/Game";
import GameOptions from "../../classes/GameOptions";

export class UnoGameBundle implements IGameBundle {
	displayName: string = "Uno";
	bundleId: string = "ml.festival.uno";
	version: string = "0.0.1";
	author: string = "Team FESTIVAL";
	route: string = "uno";
	clientDir: string = path.join(__dirname, "/client");
	clientScript: string = path.join(this.clientDir, "client.js");
	
	getInfo(): Object {
		return {
			name: this.constructor.name,
			displayName: this.displayName,
			bundleId: this.bundleId,
			version: this.version,
			author: this.author,
			route: this.route
		}
	}
	
	gameLogic: IGameLogic;
	
	constructor(expressApp: Express) {
        expressApp.use(`/${this.route}`, Middleware);
	}
	
	getOptions(): GameOptions {
		return new UnoGameOptions();
	}
	
	createGameLogicInstance(game: Game): UnoGameLogic {
		return new UnoGameLogic(game);
	}
}