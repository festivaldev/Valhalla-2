import { Card } from "../models/Card";

export class SkipTurnCard extends Card {

    constructor(type: number, ...args: any[]) {
        super(type);
    }

    public handle(preceding: Card): void {
        
    }

}