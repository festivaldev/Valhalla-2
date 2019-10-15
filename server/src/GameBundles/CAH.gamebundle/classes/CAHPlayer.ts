import Player from "../../../classes/Player";
import WhiteCard from "./WhiteCard";

export default class CAHPlayer extends Player {
	private hand: Array<WhiteCard> = [];
	private score: number = 0;
	
	constructor(player: Partial<Player>) {
		super(player.getUser());
	}
	
	public getScore(): number {
		return this.score;
	}

	public increaseScore(offset: number) {
		this.score += offset;
	}

	public resetScore() {
		this.score = 0;
	}
	
	public getHand(): Array<WhiteCard> {
		return this.hand;
	}
	
	public toString(): string {
		return `${this.getUser().toString()} (${this.score})`;
	}
}