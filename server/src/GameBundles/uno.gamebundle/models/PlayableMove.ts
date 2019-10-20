import { Card } from "./Card";

const specialValues: { [char: string]: number; } = {
    "!": Number.NEGATIVE_INFINITY,
    "=": Number.POSITIVE_INFINITY,
}

export class PlayableMove {
    public on: { variants: number[], values: number[] } = { variants: [], values: [] };
    public allow: { variants: number[], values: number[] } = { variants: [], values: [] };

    constructor(public p: { new(type: number, ...args: any[]): Card; }, m: string, public u: boolean = false) {
        const played = m.trim().split(">")[0].trim().split("|");
        const playable = m.trim().split(">")[1].trim().split("|");

        played[0].trim().split(",").forEach(_ => {
            _ = _.trim();

            if (_.includes("-")) {
                for (let i = +_.split("-")[0]; i <= +_.split("-")[1]; i++) {
                    this.on.variants.push(i);
                }
            } else {
                this.on.variants.push(+_);
            }
        });

        played[1].trim().split(",").forEach(_ => {
            _ = _.trim();

            if (_.includes("-")) {
                for (let i = +_.split("-")[0]; i <= +_.split("-")[1]; i++) {
                    this.on.values.push(i);
                }
            } else {
                this.on.values.push(+_);
            }
        });

        if (Object.keys(specialValues).includes(playable[0].trim())) {
            this.allow.variants.push(specialValues[playable[0].trim()]);
        } else {
            playable[0].trim().split(",").forEach(_ => {
                _ = _.trim();

                if (_.includes("-")) {
                    for (let i = +_.split("-")[0]; i <= +_.split("-")[1]; i++) {
                        this.allow.variants.push(i);
                    }
                } else {
                    this.allow.variants.push(+_);
                }
            });
        }

        if (Object.keys(specialValues).includes(playable[1].trim())) {
            this.allow.values.push(specialValues[playable[1].trim()]);
        } else {
            playable[1].trim().split(",").forEach(_ => {
                _ = _.trim();

                if (_.includes("-")) {
                    for (let i = +_.split("-")[0]; i <= +_.split("-")[1]; i++) {
                        this.allow.values.push(i);
                    }
                } else {
                    this.allow.values.push(+_);
                }
            });
        }
    }
}