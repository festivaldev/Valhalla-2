import { Card } from "./Card";

export type Blueprint<T extends Card> = {
    f: (...args: any[]) => T;
    p: number;
}