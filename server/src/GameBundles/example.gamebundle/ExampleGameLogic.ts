import IGameLogic from "../../classes/IGameLogic"
import Player from "../../classes/Player";
import User from "../../classes/User";
import Logger, { LogLevel } from "../../util/Logger";
import Game from "../../classes/Game";

export default class ExampleGameLogic implements IGameLogic {
	delegate: Game;
	
	constructor(delegate: Game) {
		this.delegate = delegate;
	}
	
	public handlePlayerJoin(player: Player) {
		Logger.log(`${player.getUser().getNickname()} joined example!`, LogLevel.Warn);
	}
	
	public handlePlayerLeave(player: Player) {
		Logger.log(`${player.getUser().getNickname()} left example!`, LogLevel.Warn);
	}
}