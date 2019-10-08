import Player from "./Player"
import User from "./User"
import ConnectedUsers from "./ConnectedUsers";
import GameManager from "./GameManager";
import IGameBundle from "../GameBundles/IGameBundle";
import IGameLogic from "./IGameLogic";
import Logger from "../util/Logger";
import { LongPollEvent, LongPollResponse, MessageType, GameInfo, GamePlayerInfo } from "./Constants";

export default class Game {
	private id: number;
	
	private players: Array<Player> = [];
	private spectators: Array<User> = [];
	private connectedUsers: ConnectedUsers;
	private gameManager: GameManager;
	private host: Player;
	private created: number = new Date().getTime();
	
	private gameBundle: IGameBundle;
	private gameLogic: IGameLogic;

	constructor(id: number, connectedUsers: ConnectedUsers, gameManager: GameManager, gameBundle: IGameBundle) {
		this.id = id;
		this.connectedUsers = connectedUsers;
		this.gameManager = gameManager;
		
		this.gameBundle = gameBundle;
		this.gameLogic = gameBundle.createGameLogicInstance(this);
	}

	public addPlayer(user: User) {
		Logger.log(`${user} has joined game ${this.id}`);
		// TODO: Enforce Player Limit
		
		user.joinGame(this);
		
		let player: Player = new Player(user);
		this.players.push(player);
		
		if (this.host == null) {
			this.host = player;
		}
		
		this.gameLogic.handlePlayerJoin(player);
		
		this.broadcastToPlayers(MessageType.GAME_PLAYER_EVENT, {
			[LongPollResponse.EVENT]: LongPollEvent.GAME_PLAYER_JOIN,
			[LongPollResponse.NICKNAME]: user.getNickname()
		});
	}

	public removePlayer(user: User): boolean {
		Logger.log(`Removing ${user} from game ${this.id}`);
		
		let player: Player = this.getPlayerForUser(user);
		
		if (null != player) {
			this.gameLogic.handlePlayerLeave(player);
			
			this.players.splice(this.players.indexOf(player), 1);
			user.leaveGame(this);
			
			this.broadcastToPlayers(MessageType.GAME_PLAYER_EVENT, {
				[LongPollResponse.EVENT]: LongPollEvent.GAME_PLAYER_LEAVE,
				[LongPollResponse.NICKNAME]: user.getNickname()
			});
			
			if (this.host == player) {
				if (this.players.length > 0) {
					this.host = this.players[0];
				} else {
					this.host = null;
				}
			}
			
			if (this.players.length == 0) {
				this.gameManager.destroyGame(this.id);
			}
			
			return this.players.length == 0;
		}
		
		return false;
	}

	public addSpectator(user: User) {
		Logger.log(`${user} has joined game ${this.id} as a spectator`);
		// TODO: Enforce Spectator Limit
		
		user.joinGame(this);
		this.spectators.push(user);
		
		this.broadcastToPlayers(MessageType.GAME_PLAYER_EVENT, {
			[LongPollResponse.EVENT]: LongPollEvent.GAME_SPECTATOR_JOIN,
			[LongPollResponse.NICKNAME]: user.getNickname()
		});
		
	}

	public removeSpectator(user: User) {
		Logger.log(`Removing spectator ${user} from game ${this.id}`);
		
		if (this.spectators.indexOf(user) < 0) {
			return;
		}
		
		this.spectators.splice(this.spectators.indexOf(user), 1);
		user.leaveGame(this);
		
		this.broadcastToPlayers(MessageType.GAME_PLAYER_EVENT, {
			[LongPollResponse.EVENT]: LongPollEvent.GAME_SPECTATOR_LEAVE,
			[LongPollResponse.NICKNAME]: user.getNickname()
		});
	}

	public broadcastToPlayers(type: MessageType, masterData: Object) {
		this.connectedUsers.broadcastToList(this.playersToUsers(), type, masterData);
	}

	public notifyPlayerInfoChange(player: Player) {
		this.broadcastToPlayers(MessageType.GAME_PLAYER_EVENT, {
			[LongPollResponse.EVENT]: LongPollEvent.GAME_PLAYER_INFO_CHANGE,
			[LongPollResponse.PLAYER_INFO]: this.getPlayerInfo(player)
		});
	}

	public notifyGameOptionsChanged() {
		this.broadcastToPlayers(MessageType.GAME_EVENT, {
			[LongPollResponse.EVENT]: LongPollEvent.GAME_OPTIONS_CHANGED,
			[LongPollResponse.GAME_INFO]: this.getInfo(true)
		});
	}
	
	public getHost(): User {
		if (this.host == null) {
			return null;
		}
		
		return this.host.getUser();
	}

	public getUsers(): Array<User> {
		return this.playersToUsers();
	}

	public getId(): number {
		return this.id;
	}
	
	public getPassword(): string {
		// TODO
		return null;
	}
	
	public updateGameSettings(newOptions: Object) {
		// TODO
		this.notifyGameOptionsChanged()
	}

	public getInfo(includePassword: boolean = false) {
		return {
			[GameInfo.ID]: this.id,
			[GameInfo.CREATED]: this.created,
			[GameInfo.HOST]: this.host.getUser().getNickname(),
			[GameInfo.GAME_OPTIONS]: {},	// TODO
			[GameInfo.HAS_PASSWORD]: false,	// TODO
			[GameInfo.PLAYERS]: this.players.map(player => player.getUser().getNickname()),
			[GameInfo.SPECTATORS]: this.spectators.map(user => user.getNickname())
		}
	}

	public getAllPlayerInfo(): Array<Object> {
		return this.players.map(player => this.getPlayerInfo(player));
	}

	public getPlayerInfo(player: Player): Object {
		return {
			[GamePlayerInfo.NAME]: player.getUser().getNickname,
			[GamePlayerInfo.SCORE]: player.getScore()
		}
	}

	public getPlayerForUser(user: User): Player {
		return this.players.find(player => player.getUser() == user) || null;
	}

	public playersToUsers(): Array<User> {
		let users: Array<User> = this.players.map(player => player.getUser());
		users.concat(this.spectators);
		
		return users;
	}
}