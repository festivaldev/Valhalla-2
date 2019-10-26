import IGameLogic from "../IGameLogic";
import { EventDetail, EventType, MessageType } from "../../classes/Constants";
import Game from "../../classes/Game";
import User from "../../classes/User";
import Player from "../../classes/Player";


export default class ExampleGameLogic implements IGameLogic {
	public delegate: Game;
	
	constructor(game: Game) {
		this.delegate = game;
	}
	
	handlePlayerJoin(player: Player) {}
	handlePlayerLeave(player: Player) {}
	
	handleSpectatorJoin?(user: User) {}
	handleSpectatorLeave?(user: User) {}
	
	async handleGameStart(user?: User): Promise<boolean> {
		return false;
	}
	handleGameStartNextRound?(user?: User): boolean {
		return false;
	}
	handleGameStop?(user?: User): boolean {
		return false;
	}
	
	handleGameEvent(user: User, payload: object) {
		console.log(payload);
		this.delegate.broadcastToPlayers(MessageType.GAME_EVENT, {
			[EventDetail.EVENT]: "debug",
			fuck: (Math.random() >= 0.5) ? "this" : "that"
		});
	}
	
	getGameInfo(): object {
		return {};
	}
	getPlayerInfo(player: Player): object {
		return {};
	}
	getSpectatorInfo?(user: User): object {
		return {};
	}
}