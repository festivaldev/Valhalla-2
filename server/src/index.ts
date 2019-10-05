import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import http from "http";

// Run this first to ensure all occurencies are set

dotenv.config();

import { MainRouter } from "./router";

const app = express();

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use("/", MainRouter);

http.createServer(app).listen(process.env.SERVER_PORT, () => console.log("Valhalla started!"));