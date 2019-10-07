import dotenv from "dotenv";

dotenv.config();

import HTTPServer from "./HTTPServer";
import SocketServer from "./SocketServer";
import * as GameBundles from "./GameBundles";

import GameServer, {GameManager} from "./classes/Server";
import ConnectedUsers from "./classes/ConnectedUsers";

const httpServer = new HTTPServer(+process.env.SERVER_PORT, GameBundles);
const gameServer = new GameServer(new ConnectedUsers(), new GameManager());
const socketServer = new SocketServer(httpServer, gameServer);