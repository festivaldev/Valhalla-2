export abstract class Card {
    private _data: Uint8Array = new Uint8Array(3);

    constructor(variant?: number, value?: number) {
        if (variant)
            this._data[1] = variant;
        
        if (value)
            this._data[2] = value;
    }

    public get bytes(): Uint8Array {
        return this._data;
    }

    protected set data(data: number[]) {
        if (data.length > 1)
            this._data[1] = data[0] > -1 ? data[0] : this._data[1];
        
        if (data.length > 2)
            this._data[2] = data[1] > -1 ? data[1] : this._data[2];
    }

    public get type(): number {
        return this._data[0];
    }

    public get variant(): number {
        return this._data[1];
    }

    public get value(): number {
        return this._data[2];
    }
}