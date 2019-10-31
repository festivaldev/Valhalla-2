import Game from "../classes/Game";
import GameOptions from "../classes/GameOptions";
import IGameLogic from "./IGameLogic";
import Player from "../classes/Player";

export default interface IGameBundle {
	name: string;
	displayName: string;
	version: string;
	author: string;
	
	route: string;
	clientDir: string;
	clientScript: string;
	
	getBundleInfo(): object;
	getPlayerInfo(player: Player): object;
	getDefaultOptions(): GameOptions;
	createGameLogicInstance(game: Game): IGameLogic;
}