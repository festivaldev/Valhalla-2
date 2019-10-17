import WhiteCard from "./WhiteCard";
import { Sequelize } from "sequelize";
import CAHGameOptions from "../CAHGameOptions";
import CardSet from "./CardSet";

export default class WhiteDeck {
	private database: Sequelize;
	private cardSets: Array<CardSet>;
	private numBlanks: number;
	
	private deck: Array<WhiteCard> = [];
	private _discard: Array<WhiteCard> = [];
	
	private lastBlankCardId: number = -1;
	
	constructor(database: Sequelize, cardSets: Array<CardSet>, numBlanks: number) {
		this.database = database;
		this.cardSets = cardSets;
		this.numBlanks = numBlanks;
	}
	
	public async loadCards() {
		return this.database.models.Response.findAll({
			order: [["createdAt", "DESC"]]
		}).then((responseList: Array<any>) => {
			responseList.forEach(responseObj => {
				// if (cardSets.indexOf(responseObj.get("deckId").toString()) >= 0) {
					let card: WhiteCard = new WhiteCard(responseObj["id"], responseObj["text"], responseObj["deckId"]);
					this.deck.push(card);
				// }
			});
			
			for (var i = 0; i < this.numBlanks && i < CAHGameOptions.MAX_BLANK_CARD_LIMIT; i++) {
				this.deck.push(new WhiteCard((--this.lastBlankCardId).toString(), "____", null, true));
			}

			this.deck.shuffle();
			return Promise.resolve(this);
		});
	}
	
	public getNextCard(): WhiteCard {
		if (this.deck.length == 0) {
			throw new Error("White deck is out of cards");
		}
		
		let card: WhiteCard = this.deck.pop();
		return card;
	}
	
	public discard(card: WhiteCard) {
		if (card) this._discard.push(card);
	}
	
	public reshuffle() {
		this._discard.shuffle();
		this.deck.concat(this._discard);
		this._discard = [];
	}
	
	public static isBlankCard(card: WhiteCard): boolean {
		return card.isWriteIn();
	}
	
	public totalCount(): number {
		return this.deck.length + this._discard.length;
	}
}