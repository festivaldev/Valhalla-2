import bodyParser from "body-parser";
import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import http, { Server as httpServer } from "http";
import fs from "fs";

import { MainRouter } from "./router";

export default class HTTPServer {
	expressApp: Express;
	httpServer: httpServer;
	
	constructor(port: string = "8080") {
		this.expressApp = express();
		
		this.expressApp.use(helmet());
		this.expressApp.use(cors());
		this.expressApp.use(bodyParser.json());
		this.expressApp.use("/", MainRouter);
		
		this.httpServer = http.createServer(this.expressApp).listen(port, () => {
			console.log(`\x1b[34m[INFO]\x1b[0m Valhalla started on port ${process.env.SERVER_PORT}!`)
		});
	}
}