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
import { GameBundleInfo } from "../../classes/Constants";

export class UnoGameBundle implements IGameBundle {    
	author: string = "vainamov";
	displayName: string = "Uyesn't";
    name: string = this.constructor.name;
	version: string = "0.0.2";

	route: string = "uno";
	clientDir: string = path.join(__dirname, "/client");
	clientScript: string = path.join(this.clientDir, "client.js");
	
	constructor(expressApp: Express) {
        expressApp.use(`/${this.route}`, Middleware);
        
        const d = new Deck();
        d.generateCards(20000);
	}
	
	createGameLogicInstance(game: Game): UnoGameLogic {
		return new UnoGameLogic(game);
	}
	
	getBundleInfo(): object {
		return {
			[GameBundleInfo.NAME]: this.name,
			[GameBundleInfo.DISPLAY_NAME]: this.displayName,
			[GameBundleInfo.VERSION]: this.version,
			[GameBundleInfo.AUTHOR]: this.author,
			[GameBundleInfo.ROUTE]: this.route
		}
    }
	
	getDefaultOptions(): GameOptions {
		return new UnoGameOptions();
	}
    
    getPlayerInfo(player: Player): object {
        return {};
    }
}