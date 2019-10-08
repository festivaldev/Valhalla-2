import Player from "./Player";
import User from "./User";
import Game from "./Game";

export default interface IGameLogic {
	delegate: Game;
	
	handlePlayerJoin(player: Player): void;
	handlePlayerLeave(player: Player): void;
	
	handleSpectatorJoin?(user: User): void;
	handleSpectatorLeave?(user: User): void;
}