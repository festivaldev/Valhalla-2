import { Card } from "./Card";

export class DrawNumeralCard extends Card {
    public static create(...args: any[]): DrawNumeralCard {
        return new DrawNumeralCard();
    }
}

export class NumeralCard extends Card {
    public static create(...args: any[]): NumeralCard {
        return new NumeralCard();
    }
}

export class ReverseCard extends Card {

}

export class SkipCard extends Card {

}

export class WildCard extends Card {

}

export class WildDrawNumeralCard extends Card {

}