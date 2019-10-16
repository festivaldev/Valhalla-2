import BlackCard from "./BlackCard";
import { Sequelize } from "sequelize";
import CardSet from "./CardSet";

export default class BlackDeck {
	private database: Sequelize;
	private cardSets: Array<CardSet>;
	
	
	private deck: Array<BlackCard> = [];
	private _discard: Array<BlackCard> = [];
	
	constructor(database: Sequelize, cardSets: Array<CardSet>) {
		this.database = database;
		this.cardSets = cardSets
	}
	
	public async loadCards() {
		this.database.models.Call.findAll({
			order: [["createdAt", "DESC"]]
		}).then((callList: Array<any>) => {
			callList.forEach(callObj => {
				// if (cardSets.indexOf(callObj.get("deckId").toString()) >= 0) {
					let card: BlackCard = new BlackCard(callObj["id"], callObj["text"], callObj["deckId"]);
					this.deck.push(card);
				// }
			});
			
			this.deck.shuffle();
			return Promise.resolve(this);
		});
	}
	
	public getNextCard(): BlackCard {
		if (this.deck.length == 0) {
			throw new Error("Black deck is out of cards");
		}
		
		let card: BlackCard = this.deck.pop();
		return card;
	}
	
	public discard(card: BlackCard) {
		if (card) this._discard.push(card);
	}
	
	public reshuffle() {
		this._discard.shuffle();
		this.deck.concat(this._discard);
		this._discard = [];
	}
	
	public totalCount(): number {
		return this.deck.length + this._discard.length;
	}
}