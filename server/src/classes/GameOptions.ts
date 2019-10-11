import { GameOptionData } from "./Constants";

export default class GameOptions {
	public playerLimit: number = 10;
	public spectatorLimit: number = 10;
	public scoreGoal: number = 8;
	public password: string = "";
	
	public update(newOptions: GameOptions) {
		this.playerLimit = newOptions.playerLimit;
		this.spectatorLimit = newOptions.spectatorLimit;
		this.scoreGoal = newOptions.scoreGoal;
		this.password = newOptions.password;
	}
	
	public serialize(includePassword: boolean = false) {
		let info: {[key: string]: any} = {
			[GameOptionData.PLAYER_LIMIT]: this.playerLimit,
			[GameOptionData.SPECTATOR_LIMIT]: this.spectatorLimit,
			[GameOptionData.SCORE_LIMIT]: this.scoreGoal
		}
		
		if (includePassword) {
			info[GameOptionData.PASSWORD] = this.password;
		}
		
		return info;
	}
	
	public deserialize(text: string): GameOptions {
		let options: GameOptions = new GameOptions();
		
		if (!text || !text.length) return options;
		
		let json = JSON.parse(text);
		
		options.playerLimit = json[GameOptionData.PLAYER_LIMIT];
		options.spectatorLimit = json[GameOptionData.SPECTATOR_LIMIT];
		options.scoreGoal = json[GameOptionData.SCORE_LIMIT];
		options.password = json[GameOptionData.PASSWORD];
		
		return options;
	}
}