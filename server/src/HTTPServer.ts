import bodyParser from "body-parser";
import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import http, { Server } from "http";
import fs from "fs";
import httpStatus from "http-status";

import { MainRouter } from "./router";
import IGameBundle from "./GameBundles/IGameBundle";
import Logger from "./util/Logger";
import Game from "./classes/Game";

export default class HTTPServer {
	expressApp: Express;
	httpServer: Server;
	gameBundles: { [bundleId: string] : IGameBundle } = {}
	gameScripts: string = ""
	
	constructor(port: number = 8080, gameBundles: Object) {
		this.expressApp = express();
		this.expressApp.set("json spaces", 4);
		
		this.expressApp.use(helmet());
		this.expressApp.use(cors());
		this.expressApp.use(bodyParser.json());
		this.expressApp.use("/", MainRouter);
		
		
        this.httpServer = http.createServer(this.expressApp).listen(port, () => {
            Logger.log(`Valhalla started on port ${port}!`);
		});
		
		this.gameScripts += `window.gameBundles = {};\n`;
		Object.entries(gameBundles).forEach(([bundleId, bundleClass]) => {
			this.gameBundles[bundleId] = new bundleClass(this.expressApp);
			
			this.gameScripts += `window.gameBundles["${bundleId}"] = ${JSON.stringify(this.gameBundles[bundleId].getInfo())};\n\n`;
			
			if (fs.existsSync(this.gameBundles[bundleId].clientScript)) {
				this.gameScripts += fs.readFileSync(this.gameBundles[bundleId].clientScript) + "\n\n";
			}
		});
		
		this.expressApp.use("/gameScripts.js", (req, res, next) => {
			res.header("Content-Type","application/javascript");
			res.status(httpStatus.OK).send(this.gameScripts);
		});
		
		this.expressApp.use("/gamelist", (req, res, next) => {
			let games: Array<Game> = global.socketServer.gameServer.getGameManager().getGameList();
			let gameList: Array<Object> = [];
			
			games.forEach(game => {
				if (game) {
					gameList.push({
						id: game.getId(),
						host: game.getHost().getNickname(),
						gameBundle: game.getGameBundle().displayName,
						gameInfo: game.getInfo()
					});
				}
			});
			
			res.status(httpStatus.OK).json(gameList);
		});
	}
}