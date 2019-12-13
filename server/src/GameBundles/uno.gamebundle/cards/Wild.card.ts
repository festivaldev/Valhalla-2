import { Card } from "../models/Card";
import UnoGameLogic from "../UnoGameLogic";

export class WildCard extends Card {

    constructor(type: number, ...args: any[]) {
        super(type);
    }

    public handleFollowing(following: Card, logic: UnoGameLogic): void {
        
    }

    public handlePreceding(preceding: Card, logic: UnoGameLogic): void {
        
    }

}