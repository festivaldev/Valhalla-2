import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import http from "http";

dotenv.config();

//#region HTTP Server
import HTTPServer from "./HTTPServer"
const server = new HTTPServer(process.env.SERVER_PORT);
//#endregion