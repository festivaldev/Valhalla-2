import dotenv from "dotenv";
import seedrandom from "seedrandom";

dotenv.config();
seedrandom((new Date().getTime().toString()), { global: true });

import HTTPServer from "./HTTPServer";
import SocketServer from "./SocketServer";
import * as GameBundles from "./GameBundles";

import GameServer from "./classes/Server";
import ConnectedUsers from "./classes/ConnectedUsers";
import GameManager from "./classes/GameManager";

const httpServer = new HTTPServer(+process.env.SERVER_PORT, GameBundles);

const connectedUsers = new ConnectedUsers();
const gameServer = new GameServer(connectedUsers, new GameManager(20, connectedUsers));
const socketServer = new SocketServer(httpServer, gameServer);

global.socketServer = socketServer;