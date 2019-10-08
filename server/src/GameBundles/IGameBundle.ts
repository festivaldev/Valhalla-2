import IGameLogic from "../classes/IGameLogic";
import Game from "../classes/Game";

export default interface IGameBundle {
	displayName: string;
	bundleId: string;
	version: string;
	author: string;
	clientDir: string;
	clientScript: string;
	
	gameLogic: IGameLogic;
	createGameLogicInstance(game: Game): IGameLogic;
}