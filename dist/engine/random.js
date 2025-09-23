// Mulberry32 seeded PRNG for deterministic results
export class SeededRandom {
    constructor(seed) {
        this.state = seed;
    }
    // Generate next random number between 0 and 1
    next() {
        this.state = (this.state + 0x6D2B79F5) | 0;
        let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
        t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    // Generate random integer between min and max (inclusive)
    nextInt(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
    // Generate random float between min and max
    nextFloat(min, max) {
        return this.next() * (max - min) + min;
    }
    // Pick random item from array
    pick(array) {
        return array[this.nextInt(0, array.length - 1)];
    }
    // Shuffle array in place
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = this.nextInt(0, i);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}
//# sourceMappingURL=random.js.map