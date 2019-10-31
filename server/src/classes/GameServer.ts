import ConnectedUsers from "./ConnectedUsers";
import GameManager from "./GameManager";

export default class GameServer {
	private connectedUsers: ConnectedUsers;
	private gameManager: GameManager;
	
	constructor(connectedUsers: ConnectedUsers, gameManager: GameManager) {
		this.connectedUsers = connectedUsers;
		this.gameManager = gameManager;
	}
	
	public getConnectedUsers(): ConnectedUsers {
		return this.connectedUsers;
	}
	
	public getGameManager(): GameManager {
		return this.gameManager;
	}
}