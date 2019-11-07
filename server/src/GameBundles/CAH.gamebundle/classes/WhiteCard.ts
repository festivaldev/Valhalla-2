export default class WhiteCard {
	private id: string;
	private text: string;
	private deckId: string;
	private writeIn: boolean;
	
	constructor(id: string, text: string, deckId: string, writeIn: boolean = false) {
		this.id = id;
		this.text = text;
		this.deckId = deckId;
		this.writeIn = writeIn;
	}
	
	public getId(): string {
		return this.id;
	}
	
	public getText(): string {
		return this.text;
	}
	
	public setText(text: string) {
		this.text = text;
	}
	
	public getDeckId(): string {
		return this.deckId;
	}
	
	public isWriteIn(): boolean {
		return this.writeIn;
	}
	
	public getClientData(): object {
		return {
			id: this.getId(),
			text: this.getText(),
			deckId: this.getDeckId(),
			writeIn: this.isWriteIn()
		}
	}
	
	public static getFaceDownCardClientData(): object {
		return {
			id: "-1",
			text: "",
			deckId: "",
			writeIn: false
		}
	}
	
}