import Game from "./Game";
import IGameBundle from "../GameBundles/IGameBundle";
import ConnectedUsers from "./ConnectedUsers";
import User from "./User";
import Logger, { LogLevel } from "../util/Logger";
import { MessageType, LongPollResponse, LongPollEvent } from "./Constants";

export default class GameManager {
	private maxGames: number = 20;
	private games: Map<number, Game> = new Map<number, Game>();
	private connectedUsers: ConnectedUsers;
	
	private nextId: number = 0;
	
	constructor(maxGames: number, connectedUsers: ConnectedUsers) {
		this.maxGames = maxGames;
		this.connectedUsers = connectedUsers;
	}

	private createGame(gameBundle: IGameBundle): Game {
		if (this.games.entries.length >= this.maxGames) return null;
		
		let game: Game = new Game(this.get(), this.connectedUsers, this, gameBundle);
		if (game.getId() < 0) return null;
		
		this.games.set(game.getId(), game);
		return game;
	}

	public createGameWithPlayer(user: User, gameBundle: IGameBundle): Game {
		let game = this.createGame(gameBundle);
		if (game == null) return null;
		
		try {
			game.addPlayer(user);
			Logger.log(`Created new game ${game.getId()} by user ${user}.`);
		} catch (e) {
			Logger.log(e, LogLevel.Error);
			this.destroyGame(game.getId());
		}
		
		this.broadcastGameListRefresh();
		return game;
	}
	
	public destroyGame(gameId: number) {
		let game: Game = this.games.get(gameId);
		if (game == null) return;
		
		this.games.delete(gameId);
		if (this.nextId == -1 || this.games.has(this.nextId)) {
			this.nextId = gameId;
		}
		
		let usersToRemove: Array<User> = game.getUsers();
		usersToRemove.forEach(user => {
			game.removePlayer(user);
			game.removeSpectator(user);
		});
		
		Logger.log(`Destroyed game ${game.getId()}`);
		this.broadcastGameListRefresh();
	}
	
	public broadcastGameListRefresh() {
		this.connectedUsers.broadcastToAll(MessageType.GAME_EVENT, {
			[LongPollResponse.EVENT]: LongPollEvent.GAME_LIST_REFRESH
		});
	}
	
	public get(): number {
		if (this.games.entries.length >= this.maxGames) return -1;
		if (this.games.has(this.nextId) && this.nextId >= 0) {
			let ret: number = this.nextId = this.candidateGameId(this.nextId);
			return ret;
		} else {
			let ret: number = this.candidateGameId();
			this.nextId = this.candidateGameId(ret);
			return ret;
		}
	}
	
	private candidateGameId(skip: number = -1): number {
		let maxGames = this.maxGames;
		if (this.games.entries.length >= maxGames) return -1;
		for (var i = 0; i < maxGames; i++) {
			if (i == skip) continue;
			if (!this.games.has(i)) return i;
		}
		
		return -1;
	}
	
	public getGameList(): Array<Game> {
		return [...this.games.values()];
	}
	
	public getGame(id: number): Game {
		return this.games.get(id);
	}
}