import { DrawNumeralCard, DrawNumeralWildCard, NumeralCard, WildCard, ReverseDirectionCard, SkipTurnCard } from "./cards";

import { Blueprint } from "./models/Blueprint";
import { Card, UnknownCard } from "./models/Card";
import { ColorVariant } from "./variants";
import { PlayableMove } from "./models/PlayableMove";

export class Deck {

    constructor(private options: DeckOptions = new DeckOptions()) {
        this.options.init();
    }

    public generateCards(count: number): Uint8Array {
        let cards = new Uint8Array(count * 3);

        for (let i = 0; i < count; i++) {
            let r = Math.random();
            //Math.random() * myArray.length>>0
        }

        return cards;
    }

    public getTypedCard(card: UnknownCard): Card {
        if (card.type >= this.options.blueprints.length) {
            return card;
        }

        return Object.assign(new this.options.blueprints[card.type].f(card.type), card);
    }

}

export class DeckOptions {

    public blueprints: Blueprint<Card>[] = [
        new Blueprint(NumeralCard, [ColorVariant.Red, ColorVariant.Blue, ColorVariant.Yellow, ColorVariant.Green], "0-9", [
            new PlayableMove(NumeralCard, "* | * > = | ="),
            new PlayableMove(DrawNumeralCard, "* | * > = | *", true),
            new PlayableMove(ReverseDirectionCard, "* | * > = | *"),
            new PlayableMove(SkipTurnCard, "* | * > = | *"),
            new PlayableMove(WildCard, "* | * > = | *"),
            new PlayableMove(DrawNumeralWildCard, "* | * > = | *", true),
        ], (1 / 108) * 4 * 19),
        new Blueprint(DrawNumeralCard, [ColorVariant.Red, ColorVariant.Blue, ColorVariant.Yellow, ColorVariant.Green], "2", [], (1 / 108) * 4 * 2),
        new Blueprint(ReverseDirectionCard, [ColorVariant.Red, ColorVariant.Blue, ColorVariant.Yellow, ColorVariant.Green], "*", [], (1 / 108) * 4 * 2),
        new Blueprint(SkipTurnCard, [ColorVariant.Red, ColorVariant.Blue, ColorVariant.Yellow, ColorVariant.Green], "*", [], (1 / 108) * 4 * 2),
        new Blueprint(WildCard, [ColorVariant.Black], "*", [], (1 / 108) * 4),
        new Blueprint(DrawNumeralWildCard, [ColorVariant.Black], "*", [], (1 / 108) * 4),
    ];

    public init(): void {
        let v = 0;

        this.blueprints.filter(_ => _.f && _.c > 0 && _.c <= 1).forEach(blueprint => {
            blueprint.r = v += blueprint.c;

            if (v > 1) {
                v = 0;
                this.blueprints.forEach(_ => _.c = undefined);
            }
        });

        const vr = v;
        const equalF = this.blueprints.filter(_ => !_.c || _.c <= 0 || _.c > 1);

        equalF.forEach(blueprint => {
            blueprint.c = (1 - vr) / equalF.length;
            blueprint.r = v += blueprint.c;
        });

        if (Math.ceil(this.blueprints[this.blueprints.length - 1].r) != 1) {
            v = 0;
            this.blueprints.forEach(blueprint => {
                blueprint.c = 1 / this.blueprints.length;
                blueprint.r = v += blueprint.c;
            });
        }

        for (let i = 0; i < this.blueprints.length; i++) {
            this.blueprints[i].t = i;
        }
    }

}