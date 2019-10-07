import { Express } from "express";
import path from "path";

import IGameBundle from "../IGameBundle";
import Middleware from "./example.middleware";

export class ExampleGameBundle implements IGameBundle {
	displayName: string = "Example Game Bundle";
	bundleId: string = "ml.festival.example";
	version: string = "1.0";
	author: string = "Team FESTIVAL";
	clientDir: string = path.join(__dirname, "/client");
	clientScript: string = path.join(this.clientDir, "client.js");
	
	constructor(expressApp: Express) {
		expressApp.use("/example", Middleware);
	}
}