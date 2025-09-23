export declare class SeededRandom {
    private state;
    constructor(seed: number);
    next(): number;
    nextInt(min: number, max: number): number;
    nextFloat(min: number, max: number): number;
    pick<T>(array: T[]): T;
    shuffle<T>(array: T[]): T[];
}
//# sourceMappingURL=random.d.ts.map