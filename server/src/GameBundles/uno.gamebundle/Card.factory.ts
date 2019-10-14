export class CardFactory {

    constructor(private options: CardFactoryOptions = CardFactoryOptions.Default) {}

    public generateCards(count: number): Uint8Array {
        let cards = new Uint8Array(count * 3);

        for (let i = 0; i < count; i++) {
            
        }

        return cards;
    }

}

export class CardFactoryOptions {

    public static Default: CardFactoryOptions;

    public cardFrequencies: Record<CardAction, number> = {
        [CardAction.None]: .5,
        [CardAction.PlusNumber]: .5,
    }

}

export enum CardAction {
    None,
    PlusNumber,
}