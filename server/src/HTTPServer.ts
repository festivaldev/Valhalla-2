import bodyParser from "body-parser";
import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import http, { Server } from "http";

import { MainRouter } from "./router";

export class HTTPServer {
    expressApp: Express;
    httpServer: Server;

    constructor(port: number = 8080) {
        this.expressApp = express();

        this.expressApp.use(helmet());
        this.expressApp.use(cors());
        this.expressApp.use(bodyParser.json());
        this.expressApp.use("/", MainRouter);

        this.httpServer = http.createServer(this.expressApp).listen(port, () => {
            console.log(`\x1b[34m[INFO]\x1b[0m Valhalla started on port ${port}!`);
        });
    }
}