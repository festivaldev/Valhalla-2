import IGameLogic from "./IGameLogic";
import Game from "../classes/Game";
import GameOptions from "../classes/GameOptions";

export default interface IGameBundle {
	displayName: string;
	bundleId: string;
	version: string;
	author: string;
	route: string;
	clientDir: string;
	clientScript: string;
	
	getInfo(): Object;
	
	getOptions(): GameOptions;
	
	gameLogic: IGameLogic;
	createGameLogicInstance(game: Game): IGameLogic;
}