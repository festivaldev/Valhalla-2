import { Blueprint } from "./models/Blueprint";
import { Card } from "./models/Card";
import { NumeralCard, DrawNumeralCard } from "./models/Cards";

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

    public cardBlueprints: Blueprint<Card>[] = [
        { f: DrawNumeralCard.create, p: 50 },
        { f: NumeralCard.create, p: 50 },
    ];

}