import IGameLogic from "../IGameLogic"
import Player from "../../classes/Player";
import Logger, { LogLevel } from "../../util/Logger";
import Game from "../../classes/Game";
import { MessageType } from "../../classes/Constants";

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
	
	public handleGameStart(): boolean {
		Logger.log(`Starting example game with id ${this.delegate.getId()}`, LogLevel.Warn);
		
		return true;
	}
	public handleGameEnd() {
		Logger.log(`Example game with id ${this.delegate.getId()} ended`, LogLevel.Warn);
	}
	
	public handleMessage(type: MessageType, masterData: Object) {}
}