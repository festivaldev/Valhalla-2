import { Express } from "express";
import path from "path";

import Game from "../../classes/Game";
import GameOptions from "../../classes/GameOptions";
import IGameBundle from "../IGameBundle";
import IGameLogic from "../IGameLogic";
import Middleware from "./Uno.middleware";
import UnoGameLogic from "./UnoGameLogic";
import UnoGameOptions from "./UnoGameOptions";
import Player from "../../classes/Player";

import { UnknownCard } from "./models/Card";
import { Deck, DeckOptions } from "./Deck";
import { DrawNumeralCard, NumeralCard } from "./cards";
import { PlayableMove } from "./models/PlayableMove";

export class UnoGameBundle implements IGameBundle {
	author: string = "Team FESTIVAL";
	clientDir: string = path.join(__dirname, "/client");
	clientScript: string = path.join(this.clientDir, "client.js");
	bundleId: string = "ml.festival.uno";
	displayName: string = "Uno";
	gameLogic: IGameLogic;
	route: string = "uno";
	version: string = "0.0.1";	
	
	constructor(expressApp: Express) {
        expressApp.use(`/${this.route}`, Middleware);
        
        const d = new Deck();
        d.generateCards(10);
	}
	
	getInfo(): object {
		return {
			author: this.author,
			bundleId: this.bundleId,
			displayName: this.displayName,
			name: this.constructor.name,
			route: this.route,
			version: this.version,
		}
    }
	
	getOptions(): GameOptions {
		return new UnoGameOptions();
	}
    
    getPlayerInfo(player: Player): object {
        return {};
    }
	
	createGameLogicInstance(game: Game): UnoGameLogic {
		return new UnoGameLogic(game);
	}
}