import IGameBundle from "../GameBundles/IGameBundle";
import IGameLogic from "../GameBundles/IGameLogic";
import Logger from "../util/Logger";
import ConnectedUsers from "./ConnectedUsers";
import { ErrorCode, EventDetail, EventType, GameInfo, GamePlayerInfo, MessageType } from "./Constants";
import GameManager from "./GameManager";
import GameOptions from "./GameOptions";
import Player from "./Player";
import User from "./User";

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
	
	constructor(id: number, connectedUsers: ConnectedUsers, gameManager: GameManager, gameBundle: IGameBundle, gameOptions: any) {
		this.id = id;
		this.connectedUsers = connectedUsers;
		this.gameManager = gameManager;
		
		this.gameBundle = gameBundle;
		this.gameLogic = gameBundle.createGameLogicInstance(this);
		
		this.options = gameBundle.getDefaultOptions().deserialize(gameOptions);
	}
	
	public async start(user: User) {
		if (this.getHost() != user) {
			throw new Error(ErrorCode.NOT_GAME_HOST);
		}
		
		let started = await this.gameLogic.handleGameStart(user);
		
		if (started) {
			Logger.log(`Starting game ${this.getId()} with ${this.players.length} player(s) (of ${this.options.playerLimit}), ${this.spectators.length} spectator(s) (of ${this.options.spectatorLimit})`);
			
			if (this.gameLogic.handleGameStartNextRound) {
				this.gameLogic.handleGameStartNextRound(user);
			}
			this.gameManager.broadcastGameListRefresh();
		}
	}
	
	public updateGameSettings(newOptions: GameOptions) {
		this.options.update(newOptions);
		this.notifyGameOptionsChanged();
	}
	
	
	public addPlayer(user: User): string {
		Logger.log(`${user} has joined game ${this.id}`);

		if (/*this.options.playerLimit >= 3 && */this.players.length >= this.options.playerLimit) {
			throw new Error(ErrorCode.GAME_FULL);
		}
		
		let player: Player = new Player(user);
		this.players.push(player);
		
		if (this.host == null) {
			this.host = player;
		}
		
		this.gameLogic.handlePlayerJoin(player);
		
		user.joinGame(this);
		
		this.broadcastToPlayers(MessageType.GAME_PLAYER_EVENT, {
			[EventDetail.EVENT]: EventType.GAME_PLAYER_JOIN,
			[EventDetail.PLAYER_INFO]: this.getAllPlayerInfo()
		});
		this.gameManager.broadcastGameListRefresh();
		
		return null;
	}
	
	public removePlayer(user: User) {
		Logger.log(`Removing ${user} from game ${this.id}`);
		
		let player: Player = this.getPlayerForUser(user);
		
		if (null != player) {
			this.gameLogic.handlePlayerLeave(player);
			
			this.players.splice(this.players.indexOf(player), 1);
			user.leaveGame(this);
			
			this.broadcastToPlayers(MessageType.GAME_PLAYER_EVENT, {
				[EventDetail.EVENT]: EventType.GAME_PLAYER_LEAVE,
				[EventDetail.PLAYER_INFO]: this.getAllPlayerInfo()
			});
			
			if (this.host == player) {
				if (this.players.length > 0) {
					this.host = this.players[0];
					this.notifyGameOptionsChanged();
				} else {
					this.host = null;
				}
			}
			
			if (this.players.length == 0) {
				this.gameManager.destroyGame(this.id);
			} else {
				this.gameManager.broadcastGameListRefresh();
			}
		}
	}
	
	public addSpectator(user: User): string {
		Logger.log(`${user} has joined game ${this.id} as a spectator`);
		
		if (this.spectators.length >= this.options.spectatorLimit) {
			return ErrorCode.GAME_FULL;
		}
		
		user.joinGame(this);
		this.spectators.push(user);
		
		this.broadcastToPlayers(MessageType.GAME_PLAYER_EVENT, {
			[EventDetail.EVENT]: EventType.GAME_SPECTATOR_JOIN,
			[EventDetail.SPECTATOR_INFO]: this.getAllSpectatorInfo()
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
			[EventDetail.EVENT]: EventType.GAME_SPECTATOR_LEAVE,
			[EventDetail.SPECTATOR_INFO]: this.getAllSpectatorInfo()
		});
	}
	
	
	
	public broadcastToPlayers(type: string, payload: Object) {
		this.connectedUsers.broadcastToList(this.playersToUsers(), type, payload);
	}

	public notifyPlayerInfoChange(player: Player) {
		this.broadcastToPlayers(MessageType.GAME_PLAYER_EVENT, {
			[EventDetail.EVENT]: EventType.GAME_PLAYER_INFO_CHANGE,
			[EventDetail.PLAYER_INFO]: this.getPlayerInfo(player)
		});
	}

	public notifyGameOptionsChanged() {
		this.broadcastToPlayers(MessageType.GAME_EVENT, {
			[EventDetail.EVENT]: EventType.GAME_OPTIONS_CHANGED,
			[EventDetail.GAME_INFO]: this.getInfo(true)
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
	
	public getInfo(includePassword: boolean = false): Object {
		return {
			[GameInfo.ID]: this.id,
			[GameInfo.CREATED]: this.created,
			[GameInfo.HOST]: this.getPlayerInfo(this.host),
			[GameInfo.GAME_BUNDLE]: this.gameBundle.getBundleInfo(),
			[GameInfo.GAME_OPTIONS]: this.options.serialize(includePassword),
			[GameInfo.HAS_PASSWORD]: (this.options.password != null && this.options.password.length > 0),
			[GameInfo.PLAYERS]: this.players.map(player => this.getPlayerInfo(player)),
			[GameInfo.SPECTATORS]: this.spectators.map(user => user.getNickname()),
			...this.gameLogic.getGameInfo()
		}
	}
	
	public getGameBundle(): IGameBundle {
		return this.gameBundle;
	}
	
	public getGameLogic(): IGameLogic {
		return this.gameLogic;
	}
	
	public getGameOptions(): GameOptions {
		return this.options;
	}

	public getAllPlayerInfo(): Array<Object> {
		return this.players.map(player => this.getPlayerInfo(player));
	}

	public getPlayerInfo(player: Player): Object {
		return {
			[GamePlayerInfo.NAME]: player.getUser().getNickname(),
			[GamePlayerInfo.SOCKET_ID]: player.getUser().getSocketId(),
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
	
	public getAllSpectatorInfo(): Array<object> {
		return this.spectators.map(spectator => this.getSpectatorInfo(spectator));
	}
	
	public getSpectatorInfo(spectator: User): object {
		return {
			[GamePlayerInfo.NAME]: spectator.getNickname(),
			[GamePlayerInfo.SOCKET_ID]: spectator.getSocketId(),
		}
	}
}