import { Express } from "express";
import fs from "fs";
import path from "path";
import serveStatic from "serve-static";

import IGameBundle from "../IGameBundle";
import ExampleGameLogic from "./ExampleGameLogic";
import ExampleGameOptions from "./ExampleGameOptions";
import { GameBundleInfo } from "../../classes/Constants";
import Game from "../../classes/Game";
import Player from "../../classes/Player";

export class ExampleGameBundle implements IGameBundle {
	public name: string = this.constructor.name;
	public displayName: string = "Example Game Bundle";
	public version: string = "1.0";
	public author: string = "Team FESTIVAL";
	
	public route: string = "example";
	public clientDir: string = path.join(__dirname, "/client");
	public clientScript: string = path.join(this.clientDir, "client.js");
	
	constructor(expressApp: Express) {
		if (!fs.existsSync(this.clientDir)) {
			fs.symlinkSync(path.join(__dirname, "../../../src/GameBundles/example.gamebundle/client"), this.clientDir);
		}
		
		expressApp.use(`/${this.route}`, serveStatic(this.clientDir));
	}
	
	public getBundleInfo(): object {
		return {
			[GameBundleInfo.NAME]: this.name,
			[GameBundleInfo.DISPLAY_NAME]: this.displayName,
			[GameBundleInfo.VERSION]: this.version,
			[GameBundleInfo.AUTHOR]: this.author,
			[GameBundleInfo.ROUTE]: this.route
		}
	}
	
	public getPlayerInfo(player: Player): object {
		return;
	}
	
	public getDefaultOptions(): ExampleGameOptions {
		return new ExampleGameOptions();
	}
	
	public createGameLogicInstance(game: Game): ExampleGameLogic {
		return new ExampleGameLogic(game);
	}
}