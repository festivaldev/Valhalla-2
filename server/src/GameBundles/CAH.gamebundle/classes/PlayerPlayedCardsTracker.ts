import Player from "../../../classes/Player";
import User from "../../../classes/User";
import WhiteCard from "./WhiteCard";

export default class PlayerPlayedCardsTracker {
	private playerCardMap: Map<Player, Array<WhiteCard>> = new Map<Player, Array<WhiteCard>>();
	private reverseIdMap: Map<string, Player> = new Map<string, Player>();
	
	public addCard(player: Player, card: WhiteCard) {
		let cards: Array<WhiteCard> = this.playerCardMap.get(player);
		if (!cards) {
			cards = [];
			this.playerCardMap.set(player, cards);
		}
		
		this.reverseIdMap.set(card.getId(), player);
		cards.push(card);
	}
	
	public getPlayerForId(id: string): Player {
		return this.reverseIdMap.get(id);
	}
	
	public hasPlayer(player: Player): boolean {
		return this.playerCardMap.has(player);
	}
	
	public getCards(player: Player): Array<WhiteCard> {
		return this.playerCardMap.get(player);
	}
	
	public getCardsCount(player: Player): number {
		let cards: Array<WhiteCard> = this.playerCardMap.get(player);
		return cards ? cards.length : 0;
	}
	
	public remove(player: Player): Array<WhiteCard> {
		let cards: Array<WhiteCard> = this.playerCardMap.get(player);
		this.playerCardMap.delete(player);
		
		if (cards && cards.length) {
			cards.forEach(card => this.reverseIdMap.delete(card.getId()));
		}
		
		return cards;
	}
	
	public size(): number {
		return this.playerCardMap.size;
	}
	
	public playedPlayers(): Array<Player> {
		return Array.from(this.playerCardMap.keys());
	}
	
	public clear() {
		this.playerCardMap.clear();
		this.reverseIdMap.clear();
	}
	
	public cards(): Array<Array<WhiteCard>> {
		return Array.from(this.playerCardMap.values());
	}
	
	public cardsByUser(): Map<User, Array<WhiteCard>> {
		let cardsByUser = new Map<User, Array<WhiteCard>>();
		this.playerCardMap.forEach((value, key) => cardsByUser.set(key.getUser(), value));
		
		return cardsByUser;
	}
}