import GameOptions from "../../classes/GameOptions";

export default class CAHGameOptions extends GameOptions {
	public static MIN_SCORE_LIMIT: number = 4;
	public static DEFAULT_SCORE_LIMIT: number = 8;
	public static MAX_SCORE_LIMIT: number = 69;
	public static MIN_PLAYER_LIMIT: number = 3;
	public static DEFAULT_PLAYER_LIMIT: number = 10;
	public static MAX_PLAYER_LIMIT: number = 20;
	public static MIN_SPECTATOR_LIMIT: number = 0;
	public static DEFAULT_SPECTATOR_LIMIT: number = 10;
	public static MAX_SPECTATOR_LIMIT: number = 20;
	public static MIN_BLANK_CARD_LIMIT: number = 0;
	public static DEFAULT_BLANK_CARD_LIMIT: number = 0;
	public static MAX_BLANK_CARD_LIMIT: number = 30;
	public static MIN_BLACK_CARD_LIMIT: number = 3;
	public static DEFAULT_BLACK_CARD_LIMIT: number = 4;
	public static MAX_BLACK_CARD_LIMIT: number = 10;
	
	public playerLimit: number = CAHGameOptions.DEFAULT_PLAYER_LIMIT;
	public spectatorLimit: number = CAHGameOptions.DEFAULT_SPECTATOR_LIMIT;
	public scoreGoal: number = CAHGameOptions.DEFAULT_SCORE_LIMIT;
	public blanksInDeck: number = CAHGameOptions.DEFAULT_BLANK_CARD_LIMIT;
	public useRandomBlackCards: boolean = true;
	public allowCustomBlackCards: boolean = false;
	public numberOfBlackCardsToShow: number = CAHGameOptions.DEFAULT_BLACK_CARD_LIMIT;
	public cardSetIds: Array<string> = [];
	// public scoreGoal: boolean = true;
	
	public update(newOptions: CAHGameOptions) {
		super.update(newOptions);
		
		this.scoreGoal = newOptions.scoreGoal;
		this.blanksInDeck = newOptions.blanksInDeck;
		this.useRandomBlackCards = newOptions.useRandomBlackCards;
		this.allowCustomBlackCards = newOptions.allowCustomBlackCards;
		this.numberOfBlackCardsToShow = newOptions.numberOfBlackCardsToShow;
		this.cardSetIds = newOptions.cardSetIds;
	}
	
	public serialize(includePassword: boolean = false): Object {
		let info: {[key: string]: any} = super.serialize(includePassword);
		
		info.scoreGoal = this.scoreGoal;
		info.blanksInDeck = this.blanksInDeck;
		info.useRandomBlackCards = this.useRandomBlackCards;
		info.allowCustomBlackCards = this.allowCustomBlackCards;
		info.numberOfBlackCardsToShow = this.numberOfBlackCardsToShow;
		info.cardSetIds = this.cardSetIds;
		
		return info;
	}
	
	public deserialize(text: string): CAHGameOptions {
		let options: CAHGameOptions = super.deserialize(text) as CAHGameOptions;
		let json = JSON.parse(text);
		
		// if (json.cardSets) {
		// 	let cardSetsParsed: Array<string> = json.cardSets.split(",");
		// 	cardSetsParsed.forEach(cardSetId => {
		// 		options.cardSetIds.push(cardSetId);
		// 	});
		// }
		
		options.scoreGoal = Math.max(CAHGameOptions.MIN_SCORE_LIMIT, Math.min(CAHGameOptions.MAX_SCORE_LIMIT, parseInt(json.scoreLimit)));
		options.blanksInDeck = Math.max(CAHGameOptions.MIN_BLANK_CARD_LIMIT, Math.min(CAHGameOptions.MAX_BLANK_CARD_LIMIT, parseInt(json.blanksInDeck)));
		options.useRandomBlackCards = json.useRandomBlackCards;
		options.allowCustomBlackCards = json.allowCustomBlackCards;
		options.numberOfBlackCardsToShow = Math.max(CAHGameOptions.MIN_BLACK_CARD_LIMIT, Math.min(CAHGameOptions.MAX_BLACK_CARD_LIMIT, parseInt(json.numberOfBlackCardsToShow)));
		options.cardSetIds = json.cardSets || [];
		
		return options;
	}
}