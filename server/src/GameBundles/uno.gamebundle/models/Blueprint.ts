import { Card } from "./Card";
import { PlayableMove } from "./PlayableMove";

export class Blueprint<T extends Card> {
    public r?: number;
    public t?: number;
    public vl: number[] = [];
    
    constructor(public f: { new(type: number, ...args: any[]): T; }, public vt: number[] = [0], vl: string = "*", public p: PlayableMove[] = [], public c: number = undefined) {
        vl.trim().split(",").forEach(_ => {
            _ = _.trim();

            if (_.includes("-")) {
                for (let i = +_.split("-")[0]; i <= +_.split("-")[1]; i++) {
                    this.vl.push(i);
                }
            } else {
                this.vl.push(+_);
            }
        })
    }
}