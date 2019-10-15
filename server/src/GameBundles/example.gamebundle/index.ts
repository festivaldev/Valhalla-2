import { Express } from "express";
import path from "path";

import IGameBundle from "../IGameBundle";
import Middleware from "./example.middleware";
import IGameLogic from "../IGameLogic";
import ExampleGameLogic from "./ExampleGameLogic";
import ExampleGameOptions from "./ExampleGameOptions";
import Game from "../../classes/Game";
import GameOptions from "../../classes/GameOptions";
import Player from "../../classes/Player";

export class ExampleGameBundle implements IGameBundle {
	displayName: string = "Example Game Bundle";
	bundleId: string = "ml.festival.example";
	version: string = "1.0";
	author: string = "Team FESTIVAL";
	route: string = "example";
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
		return new ExampleGameOptions();
	}
	
	getPlayerInfo(player: Player): object {
		return {};
	}
	
	createGameLogicInstance(game: Game): ExampleGameLogic {
		return new ExampleGameLogic(game);
	}
}