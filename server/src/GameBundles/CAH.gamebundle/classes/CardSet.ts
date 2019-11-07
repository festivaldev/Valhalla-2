import BlackCard from "./BlackCard";
import WhiteCard from "./WhiteCard";

export default class CardSet {
	private id: string;
	private name: string;
	private description: string;
	
	private blackCards: Array<BlackCard> = [];
	private whiteCards: Array<WhiteCard> = [];
	
	constructor(id: string, name: string, description: string) {
		this.id = id;
		this.name = name;
		this.description = description;
	}
	
	public getId(): string {
		return this.id;
	}
	
	public getName(): string {
		return this.name;
	}
	
	public setName(name: string) {
		this.name = name;
	}
	
	public getDescription(): string {
		return this.description;
	}
	
	public setDescription(description: string) {
		this.name = name;
	}
	
	public getBlackCards(): Array<BlackCard> {
		return this.blackCards;
	}
	
	public getWhiteCards(): Array<WhiteCard> {
		return this.whiteCards;
	}
}