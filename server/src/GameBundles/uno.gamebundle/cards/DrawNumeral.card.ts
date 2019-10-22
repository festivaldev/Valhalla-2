import { Card } from "../models/Card";

export class DrawNumeralCard extends Card {

    constructor(type: number, ...args: any[]) {
        super(type);
    }

    public handleFollowing(following: Card): void {
        
    }

    public handlePreceding(preceding: Card): void {
        
    }

}