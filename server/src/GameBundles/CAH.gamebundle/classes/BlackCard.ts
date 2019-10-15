export default class BlackCard {
	private id: string;
	private text: string;
	private deckId: string;
	
	constructor(id: string, text: string, deckId: string) {
		this.id = id;
		this.text = text;
		this.deckId = deckId;
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
	
	public getDeckId(): string {
		return this.deckId;
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
			append: this.getPick(true)
		}
	}
}