import useragent, { Agent } from "useragent"
import Game from "./Game";

export default class User {
	private nickname: string;
	private socketId: string;
    private lastHeardFrom: number;
    private lastUserAction: number;
    private connectedAt: number = new Date().getTime();
    private currentGame: Game;
    private hostname: string;
    private _isAdmin: boolean;
    private clientLanguage: string;
    private agent: Agent;

    private valid: boolean = true;

    constructor(nickname: string, socketId: string, hostname: string, isAdmin: boolean, clientLanguage: string, clientAgent: string) {
		this.nickname = nickname;
		this.socketId = socketId;
        this.hostname = hostname;
        this._isAdmin = isAdmin;
        this.clientLanguage = clientLanguage == null ? "" : clientLanguage;
        this.agent = useragent.parse(clientAgent)
    }

	public emitMessage(message: any) {
		global.socketServer.socket.to(this.socketId).emit("message", JSON.stringify(message));
	}

    public isAdmin(): boolean {
        return this._isAdmin;
	}
	
	public getSocketId(): string {
		return this.socketId;
	}

    public getNickname(): string {
        return this.nickname;
    }

    public getHostname(): string {
        return this.hostname;
    }

    public getAgentName(): string {
        return this.agent.toString();
    }

    public getAgentType(): string {
        return this.agent.device.toString();
    }

    public getAgentOS(): string {
        return this.agent.os.toString();
    }

    public getAgentLanguage(): string {
        return this.clientLanguage.split(",")[0];
	}
	
	public toString(): string {
		return this.nickname;
	}

    public contactedServer() {
        this.lastHeardFrom = new Date().getTime();
    }

    public getLastHeardFrom(): number {
        return this.lastHeardFrom;
    }

    public userDidSomething() {
        this.lastUserAction = new Date().getTime();
    }

    public getLastUserAction(): number {
        return this.lastUserAction;
    }

    public getConnectedAt(): number {
        return this.connectedAt;
    }

    public isValid(): boolean {
        return this.valid;
    }
    
    public isValidFromHost(currentHostname: string): boolean {
        let addrValid: boolean = this.hostname.localeCompare(currentHostname) == 0;
        
        return this.isValid() && addrValid;
    }
    
    public noLongerValid() {
        if (this.currentGame != null) {
			let game = this.currentGame;
			game.removePlayer(this);
			game.removeSpectator(this);
        }
        
        this.valid = false;
    }

    public getGame(): Game {
        return this.currentGame;
    }

    joinGame(game: Game) {
        if (this.currentGame != null) {
            throw new Error("User is already in a game");
        }
        
        this.currentGame = game;
    }

    leaveGame(game: Game) {
        if (this.currentGame == game) {
            this.currentGame = null;
        }
    }
}