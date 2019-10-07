import dotenv from "dotenv";

dotenv.config();

import HTTPServer from "./HTTPServer";
import * as GameBundles from "./GameBundles";

const httpServer = new HTTPServer(+process.env.SERVER_PORT, GameBundles);
