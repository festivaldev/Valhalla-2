import IGameLogic from "./IGameLogic";
import Game from "../classes/Game";

export default interface IGameBundle {
	displayName: string;
	bundleId: string;
	version: string;
	author: string;
	clientDir: string;
	clientScript: string;
	
	getInfo(): Object;
	
	gameLogic: IGameLogic;
	createGameLogicInstance(game: Game): IGameLogic;
}