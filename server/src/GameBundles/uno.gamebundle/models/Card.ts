import UnoGameLogic from "../UnoGameLogic";

export abstract class Card {
    protected data: Uint8Array = new Uint8Array(3);

    public get bytes(): Uint8Array {
        return this.data;
    }

    public get type(): number {
        return this.data[0];
    }

    public set type(value: number) {
        this.data[0] = value;
    }

    public get variant(): number {
        return this.data[1];
    }

    public get value(): number {
        return this.data[2];
    }

    constructor(type: number) {
        this.type = type;
    }

    public abstract handleFollowing(following: Card, logic: UnoGameLogic): void;
    public abstract handlePreceding(preceding: Card, logic: UnoGameLogic): void;
}

export class UnknownCard extends Card {
    constructor(...bytes: number[]) {
        super(bytes[0]);

        this.data = new Uint8Array(bytes);
    }

    public handleFollowing(following: Card, logic: UnoGameLogic): void {}
    public handlePreceding(preceding: Card, logic: UnoGameLogic): void {}
}