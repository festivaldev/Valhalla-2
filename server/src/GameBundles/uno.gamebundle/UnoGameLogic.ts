import Game from "../../classes/Game";
import IGameLogic from "../IGameLogic"
import Logger, { LogLevel } from "../../util/Logger";
import Player from "../../classes/Player";
import User from "../../classes/User";

import { Deck } from "./Deck";

export default class UnoGameLogic implements IGameLogic {
    delegate: Game;
    
    public deck: Deck = new Deck();
    public drawStack: number = 0;
	
	constructor(delegate: Game) {
        this.delegate = delegate;
    }

    public getGameInfo(): object {
        return {};
	}

    public getPlayerInfo(player: Player): object {
        return {};
    }
	
	public handleGameEnd() {
		Logger.log(`Uno game with id ${this.delegate.getId()} ended`, LogLevel.WARN);
    }

    public handleGameEvent(user: User, payload: any) {
		
	}
    
	public async handleGameStart(user?: User): Promise<boolean> {
		Logger.log(`Starting Uno game with id ${this.delegate.getId()}`, LogLevel.WARN);
		
		return true;
	}
	
	public handlePlayerJoin(player: Player) {
        Logger.log(`${player.getUser().getNickname()} joined Uno!`, LogLevel.WARN);
        Logger.log(this.delegate.getInfo().toString(), LogLevel.DEBUG);
	}
	
	public handlePlayerLeave(player: Player) {
		Logger.log(`${player.getUser().getNickname()} left Uno!`, LogLevel.WARN);
	}
}