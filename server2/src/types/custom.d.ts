import ConnectedUsers from "../classes/ConnectedUsers";
import GameManager from "../classes/GameManager";
import GameServer from "../classes/GameServer";
import HTTPServer from "../classes/HTTPServer";
import SocketServer from "../classes/SocketServer";

declare global {
	namespace NodeJS {
		interface Global {
			connectedUsers: ConnectedUsers;
			gameManager: GameManager;
			gameServer: GameServer;
			httpServer: HTTPServer;
			socketServer: SocketServer;
		}
	}
}