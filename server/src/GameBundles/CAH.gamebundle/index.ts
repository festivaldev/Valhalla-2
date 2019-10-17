import { Express } from "express";
import fs from "fs";
import path from "path";
import serveStatic from "serve-static";
import { Sequelize } from "sequelize";
import crypto from "crypto";

import IGameBundle from "../IGameBundle";
import IGameLogic from "../IGameLogic";
import CAHGameLogic from "./CAHGameLogic";
import CAHGameOptions from "./CAHGameOptions";
import Game from "../../classes/Game";
import GameOptions from "../../classes/GameOptions";
import Logger, { LogLevel } from "../../util/Logger";
import BlackDeck from "./classes/BlackDeck";
import WhiteDeck from "./classes/WhiteDeck";
import PlayerPlayedCardsTracker from "./classes/PlayerPlayedCardsTracker";
import Player from "../../classes/Player";
import CAHPlayer from "./classes/CAHPlayer";
import { GamePlayerInfo } from "../../classes/Constants";
import httpStatus from "http-status";

const models = require("./models");

Array.prototype.shuffle = function() {
	for (var i = this.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var t = this[i];
		this[i] = this[j];
		this[j] = t;
	}
}

export class CAHGameBundle implements IGameBundle {
	displayName: string = "Cards Against Humanity";
	bundleId: string = "ml.festival.cah";
	version: string = "1.0";
	author: string = "Team FESTIVAL";
	route: string = "cah";
	clientDir: string = path.join(__dirname, "/client");
	clientScript: string = path.join(this.clientDir, "client.js");
	
	private sequelize: Sequelize;
	private database: {[modelId: string]: any};
	
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
		if (!fs.existsSync(this.clientDir)) {
			fs.symlinkSync(path.join(__dirname, "../../../src/GameBundles/CAH.gamebundle/client"), this.clientDir);
		}
		
		expressApp.use(`/${this.route}`, serveStatic(this.clientDir));
		
		if (!fs.existsSync(path.join(__dirname, "cards.sqlite3"))) {
			// Logger.log("[CAH] did not find card database. Did you forget to symlink into dist?", LogLevel.Error);
			// return;
			fs.symlinkSync(path.join(__dirname, "../../../src/GameBundles/CAH.gamebundle/cards.sqlite3"), path.join(__dirname, "cards.sqlite3"));
		}
		
		this.sequelize = new Sequelize({
			storage: path.join(__dirname, "cards.sqlite3"),
			dialect: "sqlite",
			logging: false
		});
		
		this.database = {
			models: {},
			sequelize: this.sequelize,
			Sequelize: Sequelize
		};
		
		Object.keys(models).forEach(model => {
			this.database.models[model] = models[model](this.sequelize, Sequelize);
		});
		Object.keys(this.database.models).forEach(modelName => {
			if (this.database.models[modelName].associate) {
				this.database.models[modelName].asscociate(this.database.models);
			}
		});
		
		this.database.sequelize.sync();
		
		// (async () => {
		// 	let test0 = await Promise.all(Array.prototype.concat(
		// 		new BlackDeck(this.database.sequelize, []).loadCards(),
		// 		new WhiteDeck(this.database.sequelize, [], 8).loadCards()
		// 	));
			
		// 	let test1 = new PlayerPlayedCardsTracker();
		// 	let test2 = new Player(null);
			
		// 	test1.addCard(test2, test0[1].getNextCard());
		// })()
	}
	
	getOptions(): GameOptions {
		return new CAHGameOptions();
	}
	
	public getPlayerInfo(player: CAHPlayer): object {
		return {
			[GamePlayerInfo.SCORE]: player.getScore()
		}
	}
	
	createGameLogicInstance(game: Game): CAHGameLogic {
		return new CAHGameLogic(game, this.database);
	}
}