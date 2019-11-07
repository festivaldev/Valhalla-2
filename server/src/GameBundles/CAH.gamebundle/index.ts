import { Express } from "express";
import fs from "fs";
import httpStatus from "http-status";
import path from "path";
import { Sequelize } from "sequelize";
import serveStatic from "serve-static";

import { GameBundleInfo } from "../../classes/Constants";
import Game from "../../classes/Game";
import IGameBundle from "../IGameBundle";
import CAHGameLogic from "./CAHGameLogic";
import CAHGameOptions from "./CAHGameOptions";
import CAHPlayer from "./classes/CAHPlayer";

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
	public name: string = this.constructor.name;
	public displayName: string = "Cards Against Humanity";
	public version: string = "1.0";
	public author: string = "Team FESTIVAL";
	
	public route: string = "cah";
	public clientDir: string = path.join(__dirname, "/client");
	public clientScript: string = path.join(this.clientDir, "client.js");
	
	private sequelize: Sequelize;
	private database: {[modelId: string]: any};
	
	constructor(expressApp: Express) {
		if (!fs.existsSync(this.clientDir)) {
			fs.symlinkSync(path.join(__dirname, "../../../src/GameBundles/CAH.gamebundle/client"), this.clientDir);
		}
		
		expressApp.use(`/${this.route}`, serveStatic(this.clientDir));
		
		if (!fs.existsSync(path.join(__dirname, "cards.sqlite3"))) {
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
		
		expressApp.get(`/${this.route}/decks`, async (req, res) => {
			this.database.models.Deck.findAll().then((deckList: Array<any>) => {
				res.status(httpStatus.OK).send(deckList);
			});
		});
	}
	
	public getBundleInfo(): Object {
		return {
			[GameBundleInfo.NAME]: this.name,
			[GameBundleInfo.DISPLAY_NAME]: this.displayName,
			[GameBundleInfo.VERSION]: this.version,
			[GameBundleInfo.AUTHOR]: this.author,
			[GameBundleInfo.ROUTE]: this.route
		}
	}
	
	public getPlayerInfo(player: CAHPlayer): object {
		return {}
	}
	
	public getDefaultOptions(): CAHGameOptions {
		return new CAHGameOptions();
	}
	
	public createGameLogicInstance(game: Game): CAHGameLogic {
		return new CAHGameLogic(game, this.database.models);
	}
}