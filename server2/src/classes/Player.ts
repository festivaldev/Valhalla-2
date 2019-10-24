import User from "./User";

export default class Player {
	private user: User;

	constructor(user: User) {
		this.user = user;
	}

	public getUser(): User {
		return this.user;
	}
	
	public toString(): string {
		return `${this.user.toString()}`;
	}
}