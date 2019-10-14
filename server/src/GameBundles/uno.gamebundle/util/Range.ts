export interface Range<A extends number, B extends number> {
    public includes<A extends number, B extends number>(x: number): boolean {
        return x > A && x < B;
    }
}