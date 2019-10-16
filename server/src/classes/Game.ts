import Player from "./Player"
import User from "./User"
import ConnectedUsers from "./ConnectedUsers";
import GameManager from "./GameManager";
import IGameBundle from "../GameBundles/IGameBundle";
import IGameLogic from "../GameBundles/IGameLogic";
import Logger from "../util/Logger";
import { LongPollEvent, LongPollResponse, MessageType, GameInfo, GamePlayerInfo, ErrorCode } from "./Constants";
import GameOptions from "./GameOptions";

export default class Game {
	private id: number;
	
	private players: Array<Player> = [];
	private spectators: Array<User> = [];
	private connectedUsers: ConnectedUsers;
	private gameManager: GameManager;
	private host: Player;
	private options: GameOptions;
	private created: number = new Date().getTime();
	
	private gameBundle: IGameBundle;
	private gameLogic: IGameLogic;

	constructor(id: number, connectedUsers: ConnectedUsers, gameManager: GameManager, gameBundle: IGameBundle) {
		this.id = id;
		this.connectedUsers = connectedUsers;
		this.gameManager = gameManager;
		
		this.gameBundle = gameBundle;
		this.gameLogic = gameBundle.createGameLogicInstance(this);
		
		this.options = gameBundle.getOptions();
	}

	public addPlayer(user: User): ErrorCode {
		Logger.log(`${user} has joined game ${this.id}`);

		if (this.options.playerLimit >= 3 && this.players.length >= this.options.playerLimit) {
			return ErrorCode.GAME_FULL
		}
		
		let player: Player = new Player(user);
		this.players.push(player);
		
		if (this.host == null) {
			this.host = player;
		}
		
		let errorCode: ErrorCode = user.joinGame(this);
		if (null != errorCode) return errorCode;
		
		this.gameLogic.handlePlayerJoin(player);
		
		this.broadcastToPlayers(MessageType.GAME_PLAYER_EVENT, {
			[LongPollResponse.EVENT]: LongPollEvent.GAME_PLAYER_JOIN,
			[LongPollResponse.NICKNAME]: user.getNickname()
		});
		
		return null;
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
		
		if (this.spectators.length >= this.options.spectatorLimit) {
			// TODO: Enforce Spectator Limit
		}
		
		user.joinGame(this);
		this.spectators.push(user);
		
		this.broadcastToPlayers(MessageType.GAME_PLAYER_EVENT, {
			[LongPollResponse.EVENT]: LongPollEvent.GAME_SPECTATOR_JOIN,
			[LongPollResponse.NICKNAME]: user.getNickname()
		});
		
	}

	public removeSpectator(user: User) {
		if (this.spectators.indexOf(user) < 0) {
			return;
		}
		Logger.log(`Removing spectator ${user} from game ${this.id}`);
		
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
	
	public getHostPlayer(): Player {
		if (this.host == null) {
			return null;
		}
		
		return this.host;
	}

	public getUsers(): Array<User> {
		return this.playersToUsers();
	}

	public getId(): number {
		return this.id;
	}
	
	public getPassword(): string {
		return this.options.password;
	}
	
	public updateGameSettings(newOptions: GameOptions) {
		this.options.update(newOptions);
		this.notifyGameOptionsChanged();
	}

	public getInfo(includePassword: boolean = false): Object {
		return {
			[GameInfo.ID]: this.id,
			[GameInfo.CREATED]: this.created,
			[GameInfo.HOST]: this.host.getUser().getNickname(),
			[GameInfo.GAME_BUNDLE]: this.gameBundle.getInfo(),
			[GameInfo.GAME_OPTIONS]: this.options.serialize(includePassword),
			[GameInfo.HAS_PASSWORD]: this.options.password != null && this.options.password.length,
			[GameInfo.PLAYERS]: this.players.map(player => player.getUser().getNickname()),
			[GameInfo.SPECTATORS]: this.spectators.map(user => user.getNickname())
		}
	}
	
	public getGameBundle(): IGameBundle {
		return this.gameBundle;
	}
	
	public getGameLogic(): IGameLogic {
		return this.gameLogic;
	}

	public getAllPlayerInfo(): Array<Object> {
		return this.players.map(player => this.getPlayerInfo(player));
	}

	public getPlayerInfo(player: Player): Object {
		return {
			[GamePlayerInfo.NAME]: player.getUser().getNickname(),
			...this.gameBundle.getPlayerInfo(player),
			...this.gameLogic.getPlayerInfo(player)
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
	
	public getGameManager(): GameManager {
		return this.gameManager;
	}
	
	public start(): boolean {
		let started = this.gameLogic.handleGameStart();
		
		if (started) {
			Logger.log(`Starting game ${this.getId()} with ${this.players.length} player(s) (of ${this.options.playerLimit}), ${this.spectators.length} spectator(s) (of ${this.options.spectatorLimit})`);
			
			if (this.gameLogic.handleGameStartNextRound) {
				this.gameLogic.handleGameStartNextRound();
			}
			this.gameManager.broadcastGameListRefresh();
		}
		
		return started;
	}
}