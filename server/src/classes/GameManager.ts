import ConnectedUsers from "./ConnectedUsers";
import { ErrorCode, EventDetail, EventType, MessageType } from "./Constants";
import Game from "./Game";
import User from "./User";
import IGameBundle from "../GameBundles/IGameBundle";
import Logger, { LogLevel } from "../util/Logger";

export default class GameManager {
	private maxGames: number;
	private games: Map<number, Game> = new Map<number, Game>();
	private connectedUsers: ConnectedUsers;
	
	private nextGameId = 0;
	
	constructor(maxGames: number, connectedUsers: ConnectedUsers) {
		this.maxGames = maxGames;
		this.connectedUsers = connectedUsers;
	}
	
	private createGame(gameBundle: IGameBundle, gameOptions: any): Game {
		if (this.games.size >= this.maxGames) throw new Error(ErrorCode.TOO_MANY_GAMES);
		
		let game: Game = new Game(this.get(), this.connectedUsers, this, gameBundle, gameOptions);
		if (game.getId() < 0) throw new Error(ErrorCode.SERVER_ERROR);
		
		this.games.set(game.getId(), game);
		return game;
	}
	
	public createGameWithPlayer(user: User, gameBundle: IGameBundle, gameOptions: any): Game {
		let game: Game = this.createGame(gameBundle, gameOptions);
		if (game == null) throw new Error(ErrorCode.SERVER_ERROR);
		
		try {
			game.addPlayer(user);
			Logger.log(`Created new game ${game.getId()} by user ${user}.`);
		} catch (e) {
			// Logger.log(e, LogLevel.ERROR);
			this.destroyGame(game.getId());
			throw new Error(e.message);
		}
		
		this.broadcastGameListRefresh();
		return game;
	}
	
	public destroyGame(gameId: number) {
		let game: Game = this.games.get(gameId);
		if (game == null) return;
		
		this.games.delete(gameId);
		if (this.nextGameId == -1 || this.games.has(this.nextGameId)) {
			this.nextGameId = gameId;
		}
		
		let usersToRemove: Array<User> = game.getUsers();
		usersToRemove.forEach(user => {
			game.removePlayer(user);
			game.removeSpectator(user);
		});
		
		Logger.log(`Destroyed game ${game.getId()}`);
		this.broadcastGameListRefresh();
	}
	
	public get(): number {
		if (this.games.entries.length >= this.maxGames) return -1;
		if (this.games.has(this.nextGameId) && this.nextGameId >= 0) {
			let ret: number = this.nextGameId = this.candidateGameId(this.nextGameId);
			return ret;
		} else {
			let ret: number = this.candidateGameId();
			this.nextGameId = this.candidateGameId(ret);
			return ret;
		}
	}
	
	private candidateGameId(skip: number = -1): number {
		let maxGames = this.maxGames;
		if (this.games.size >= maxGames) return -1;
		for (var i = 0; i < maxGames; i++) {
			if (i == skip) continue;
			if (!this.games.has(i)) return i;
		}
		
		return -1;
	}
	
	public broadcastGameListRefresh() {
		this.connectedUsers.broadcastToAll(MessageType.CLIENT_EVENT, {
			[EventDetail.EVENT]: EventType.GAME_LIST_REFRESH
		});
	}
	
	public getGameList(): Array<Game> {
		return [...this.games.values()];
	}
	
	public getGame(id: number): Game {
		return this.games.get(id);
	}
}