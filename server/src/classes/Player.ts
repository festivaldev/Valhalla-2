import User from "./User";

export default class Player {
	private user: User;
	private score: number;

	constructor(user: User) {
		this.user = user;
	}

	public getUser(): User {
		return this.user;
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
	
	public toString(): string {
		return `${this.user.toString()} (${this.score})`;
	}
}