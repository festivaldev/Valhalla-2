import Player from "../../../classes/Player";
import WhiteCard from "./WhiteCard";
import User from "../../../classes/User";

export default class CAHPlayer extends Player {
	private hand: Array<WhiteCard> = [];
	private score: number = 0;
	
	private player: Player;
	
	constructor(player: Player) {
		super(player.getUser());
		this.player = player;
	}
	
	public getUser(): User {
		return this.player.getUser();
	}
	
	public getPlayer(): Player {
		return this.player;
	}
	
	public getScore(): number {
		return this.score;
	}

	public increaseScore(offset: number = 1) {
		this.score += offset;
	}

	public resetScore() {
		this.score = 0;
	}
	
	public getHand(): Array<WhiteCard> {
		return this.hand;
	}
	
	public setHand(hand: Array<WhiteCard>) {
		this.hand = hand;
	}
	
	public toString(): string {
		return `${this.getUser().toString()} (${this.score})`;
	}
}