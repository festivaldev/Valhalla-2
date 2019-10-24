import IGameLogic from "../IGameLogic";
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
	
	handleGameStart(user?: User): boolean {
		return false;
	}
	handleGameStartNextRound?(user?: User): boolean {
		return false;
	}
	handleGameStop?(user?: User): boolean {
		return false;
	}
	
	handleGameEvent(user: User, payload: object) {}
	
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