import Game from "../classes/Game";
import Player from "../classes/Player";
import User from "../classes/User";

export default interface IGameLogic {
	delegate: Game;
	
	handlePlayerJoin(player: Player): void;
	handlePlayerLeave(player: Player): void;
	
	handleSpectatorJoin?(user: User): void;
	handleSpectatorLeave?(user: User): void;
	
	handleGameStart(user?: User): Promise<boolean>;
	handleGameStartNextRound?(user?: User): boolean;
	handleGameStop?(user?: User): boolean;
	
	handleGameEvent(user: User, payload: object): void;
	
	getGameInfo(): object;
	getPlayerInfo(player: Player): object;
	getSpectatorInfo?(user: User): object;
}