import bcrypt from "bcryptjs";
import { GameOptionData } from "../classes/Constants";

export default class GameOptions {
	public password: string;
	public playerLimit: number;
	public spectatorLimit: number;
	
	public update(options: GameOptions) {
		this.password = options.password;
		this.playerLimit = options.playerLimit;
		this.spectatorLimit = options.spectatorLimit;
	}
	
	public serialize(includePassword: boolean = false): object {
		let info: {[key: string]: any} = {
			[GameOptionData.PLAYER_LIMIT]: this.playerLimit,
			[GameOptionData.SPECTATOR_LIMIT]: this.spectatorLimit
		};
		
		if (includePassword) {
			info[GameOptionData.PASSWORD] = this.password;
		}
		
		return info;
	}
	
	public deserialize(text: string): GameOptions {
		let options: GameOptions = new GameOptions();
		
		if (!text || !text.length) return options;
		
		let json = JSON.parse(text);
		
		options.playerLimit = parseInt(json[GameOptionData.PLAYER_LIMIT]) || options.playerLimit;
		options.spectatorLimit = parseInt(json[GameOptionData.SPECTATOR_LIMIT]) || options.spectatorLimit;
		
		if (json[GameOptionData.PASSWORD]) {
			let salt = bcrypt.genSaltSync(10);
			let hashedPassword = bcrypt.hashSync(json[GameOptionData.PASSWORD], salt);
			
			options.password = hashedPassword;
		}
		
		return options;
	}
}