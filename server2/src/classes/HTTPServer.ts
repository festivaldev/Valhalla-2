import bodyParser from "body-parser";
import cors from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import fs from "fs";
import helmet from "helmet";
import http, { Server } from "http";
import httpStatus from "http-status";

import Game from "./Game";
import IGameBundle from "../GameBundles/IGameBundle";
import Logger from "../util/Logger";

export default class HTTPServer {
	private expressApp: Express;
	private httpServer: Server;
	private gameBundles: { [bundleId: string] : IGameBundle } = {};
	private gameScripts: string = "";
	
	constructor(port: number = 8080, gameBundles: object) {
		this.expressApp = express();
		this.expressApp.set("json spaces", 4);
		
		this.expressApp.use(bodyParser.json());
		this.expressApp.use(cors());
		this.expressApp.use(helmet());
		
		this.httpServer = http.createServer(this.expressApp).listen(port, () => {
			Logger.log(`Valhalla started on port ${port}!`);
		});
		
		
		this.gameScripts += "window.gameBundles = {};\n";
		Object.entries(gameBundles).forEach(([bundleId, bundleClass]) => {
			this.gameBundles[bundleId] = new bundleClass(this.expressApp);
			
			this.gameScripts += `window.gameBundles["${bundleId}"] = ${JSON.stringify(this.gameBundles[bundleId].getBundleInfo())};\n\n`;
			
			if (this.gameBundles[bundleId].clientScript && fs.existsSync(this.gameBundles[bundleId].clientScript)) {
				this.gameScripts += fs.readFileSync(this.gameBundles[bundleId].clientScript) + "\n\n";
			}
		});
		
		
		this.expressApp.get("/gameScripts.js", (req: Request, res: Response) => {
			res
				.status(httpStatus.OK)
				.contentType("application/javascript")
				.send(this.gameScripts);
		});
		
		this.expressApp.get("/gamelist", (req: Request, res: Response) => {
			let games: Array<Game> = global.gameManager.getGameList();
			let gameList: Array<object> = [];
			
			games.forEach(game => {
				if (game) {
					gameList.push(game.getInfo());
				}
			});
			
			res
				.status(httpStatus.OK)
				.json(gameList);
		});
	}
	
	public getExpressApp(): Express {
		return this.expressApp;
	}
	
	public getHTTPServer(): Server {
		return this.httpServer;
	}
	
	public getGameBundles(): { [bundleId: string] : IGameBundle } {
		return this.gameBundles;
	}
}