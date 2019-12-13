import { Card } from "../models/Card";
import UnoGameLogic from "../UnoGameLogic";

export class DrawNumeralCard extends Card {

    constructor(type: number, ...args: any[]) {
        super(type);
    }

    public handleFollowing(following: Card, logic: UnoGameLogic): void {
        switch (following.constructor.name) {
            case "DrawNumeralCard":
            case "DrawNumeralWildCard":
                break;
            default: 
        }
    }

    public handlePreceding(preceding: Card, logic: UnoGameLogic): void {
        logic.drawStack += this.value;
    }

}