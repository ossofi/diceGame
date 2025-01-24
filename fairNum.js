import { RandomGenerator } from './randomGen.js';

export class FairNumberProtocol {
    constructor() {
        this.randomGenerator = new RandomGenerator();
    }

    async createRandom(value) {
        const key = this.randomGenerator.generateKey();
        const n = this.randomGenerator.getRandomInt(value);
        return { n, key };
    }
}