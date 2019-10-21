import Game from "../classes/Game";
import Player from "../classes/Player";
import User from "../classes/User";
import { MessageType } from "../classes/Constants";


export default interface IGameLogic {
	delegate: Game;
	
	handlePlayerJoin(player: Player): void;
	handlePlayerLeave(player: Player): void;
	
	handleSpectatorJoin?(user: User): void;
	handleSpectatorLeave?(user: User): void;
	
	handleGameStart(user?: User): boolean;
	handleGameStartNextRound?(user?: User): boolean;
	handleGameRoundComplete?(): void;
	handleGameEnd(): void;
	
	handleMessage(user: User, type: MessageType, masterData: Object): void;
	
	getInfo(): object;
	getPlayerInfo(player: Player): object;
}