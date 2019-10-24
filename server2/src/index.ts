import dotenv from "dotenv";
import * as GameBundles from "./GameBundles";
import ConnectedUsers from "./classes/ConnectedUsers";
import GameManager from "./classes/GameManager";
import GameServer from "./classes/GameServer";
import HTTPServer from "./classes/HTTPServer";
import SocketServer from "./classes/SocketServer";

dotenv.config();

const httpServer = global.httpServer = new HTTPServer(+process.env.SERVER_PORT, GameBundles);
const connectedUsers = global.connectedUsers = new ConnectedUsers(+process.env.MAX_USERS);
const gameManager = global.gameManager = new GameManager(+process.env.MAX_GAMES, connectedUsers);
const gameServer = global.gameServer = new GameServer(connectedUsers, gameManager);
const socketServer = global.socketServer = new SocketServer(httpServer, gameServer);