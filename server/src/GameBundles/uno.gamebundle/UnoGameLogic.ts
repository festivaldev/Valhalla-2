import IGameLogic from "../IGameLogic"
import Player from "../../classes/Player";
import Logger, { LogLevel } from "../../util/Logger";
import Game from "../../classes/Game";
import { MessageType } from "../../classes/Constants";

export default class UnoGameLogic implements IGameLogic {
    delegate: Game;
	
	constructor(delegate: Game) {
        this.delegate = delegate;
    }
	
	public handlePlayerJoin(player: Player) {
        Logger.log(`${player.getUser().getNickname()} joined Uno!`, LogLevel.Warn);
        Logger.log(this.delegate.getInfo().toString(), LogLevel.Debug);
	}
	
	public handlePlayerLeave(player: Player) {
		Logger.log(`${player.getUser().getNickname()} left Uno!`, LogLevel.Warn);
	}
	
	public handleGameStart(): boolean {
		Logger.log(`Starting Uno game with id ${this.delegate.getId()}`, LogLevel.Warn);
		
		return true;
	}
	public handleGameEnd() {
		Logger.log(`Uno game with id ${this.delegate.getId()} ended`, LogLevel.Warn);
	}
	
	public handleMessage(type: MessageType, masterData: Object) {
		this.delegate.broadcastToPlayers(MessageType.GAME_EVENT, {
			fuck: (Math.random() < .5 ? "this" : "that")
		});
	}
}