import ConnectedUsers from "./ConnectedUsers"
import GameManager from "./GameManager"

export default class Server {
    private users: ConnectedUsers
    private gameManager: GameManager;
    
    constructor(connectedUsers: ConnectedUsers, gameManager: GameManager) {
        this.users = connectedUsers;
        this.gameManager = gameManager;
    }
    
    public getConnectedUsers() {
        return this.users;
    }
    
    public getGameManager() {
        return this.gameManager;
    }
}