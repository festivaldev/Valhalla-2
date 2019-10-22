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

            let blueprint = this.options.blueprints.find(_ => _.r - _.c <= r && r < _.r);

            let variant = blueprint.vt[Math.random() * blueprint.vt.length >> 0];
            let value = blueprint.vl[Math.random() * blueprint.vl.length >> 0];

            console.log(`Card: ${i} / Roll: ${r} / Blueprint: ${blueprint.f.name} (${(blueprint.r - blueprint.c).toFixed(4)} - ${blueprint.r.toFixed(4)}) / VT: ${variant} / VL: ${value}`);
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

const moveAny = "* | * > * | *";
const moveEqualVl = "* | * > * | =";
const moveEqualVt = "* | * > = | *";

export class DeckOptions {

    public blueprints: Blueprint<Card>[] = [
        new Blueprint(NumeralCard, [ColorVariant.Red, ColorVariant.Blue, ColorVariant.Yellow, ColorVariant.Green], "0-9", [
            new PlayableMove(NumeralCard, moveEqualVl), // Play any value on matching variants
            new PlayableMove(NumeralCard, moveEqualVt), // Play any variant on matching values
            new PlayableMove(DrawNumeralCard, moveEqualVt),
            new PlayableMove(ReverseDirectionCard, moveEqualVt),
            new PlayableMove(SkipTurnCard, moveEqualVt),
            new PlayableMove(WildCard, moveAny),
            new PlayableMove(DrawNumeralWildCard, moveAny),
        ], (1 / 108) * 4 * 19),
        new Blueprint(DrawNumeralCard, [ColorVariant.Red, ColorVariant.Blue, ColorVariant.Yellow, ColorVariant.Green], "2", [
            new PlayableMove(NumeralCard, moveEqualVt, true),
            new PlayableMove(DrawNumeralCard, moveAny),
            new PlayableMove(ReverseDirectionCard, moveEqualVt, true),
            new PlayableMove(SkipTurnCard, moveEqualVt, true),
            new PlayableMove(WildCard, moveAny, true),
            new PlayableMove(DrawNumeralWildCard, moveAny, true),
        ], (1 / 108) * 4 * 2),
        new Blueprint(ReverseDirectionCard, [ColorVariant.Red, ColorVariant.Blue, ColorVariant.Yellow, ColorVariant.Green], "*", [
            new PlayableMove(NumeralCard, moveEqualVt),
            new PlayableMove(DrawNumeralCard, moveEqualVt),
            new PlayableMove(ReverseDirectionCard, moveAny),
            new PlayableMove(SkipTurnCard, moveEqualVt),
            new PlayableMove(WildCard, moveAny),
            new PlayableMove(DrawNumeralWildCard, moveAny),
        ], (1 / 108) * 4 * 2),
        new Blueprint(SkipTurnCard, [ColorVariant.Red, ColorVariant.Blue, ColorVariant.Yellow, ColorVariant.Green], "*", [
            new PlayableMove(NumeralCard, moveEqualVt),
            new PlayableMove(DrawNumeralCard, moveEqualVt),
            new PlayableMove(ReverseDirectionCard, moveEqualVt),
            new PlayableMove(SkipTurnCard, moveAny),
            new PlayableMove(WildCard, moveAny),
            new PlayableMove(DrawNumeralWildCard, moveAny),
        ], (1 / 108) * 4 * 2),
        new Blueprint(WildCard, [ColorVariant.Black], "*", [
            new PlayableMove(NumeralCard, moveEqualVt),
            new PlayableMove(DrawNumeralCard, moveEqualVt),
            new PlayableMove(ReverseDirectionCard, moveEqualVt),
            new PlayableMove(SkipTurnCard, moveEqualVt),
            new PlayableMove(WildCard, moveAny),
            new PlayableMove(DrawNumeralWildCard, moveAny),
        ], (1 / 108) * 4),
        new Blueprint(DrawNumeralWildCard, [ColorVariant.Black], "*", [
            new PlayableMove(NumeralCard, moveEqualVt, true),
            new PlayableMove(DrawNumeralCard, moveEqualVt, true),
            new PlayableMove(ReverseDirectionCard, moveEqualVt, true),
            new PlayableMove(SkipTurnCard, moveEqualVt, true),
            new PlayableMove(WildCard, moveAny, true),
            new PlayableMove(DrawNumeralWildCard, moveAny),
        ], (1 / 108) * 4),
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