export default class BlackCard {
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
		return this.text.replace(/(\_|\{.[0-9]*\})/g, '<span class="spacer"></span>');
	}
	
	public getRawText(): string {
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
	
	public getPick(rawPick: boolean = false): number {
		let underscores = this.getRawText().match(/\_/g) || [];
		let interpolations = (new Set(this.getRawText().match(/\{.[0-9]*\}/g))).size || 0;
		
		if (rawPick) return underscores.length + interpolations;
		return Math.max(underscores.length + interpolations, 1);
	}
	
	public getClientData(): object {
		return {
			id: this.getId(),
			text: this.getText(),
			rawText: this.getRawText(),
			deckId: this.getDeckId(),
			pick: this.getPick(),
			writeIn: this.isWriteIn(),
			append: !Boolean(this.getPick(true))
		}
	}
}