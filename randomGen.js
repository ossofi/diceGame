import crypto from 'crypto';

export class RandomGenerator {
    generateKey() {
        return crypto.randomBytes(32);
    }

    getRandomInt(max) {
        const randomBytes = crypto.randomBytes(4);
        const randomInt = randomBytes.readUInt32BE(0);
        return randomInt % (max + 1);
    }

    generateHMAC(key, message) {
        return crypto.createHmac('sha3-256', key).update(message).digest('hex');
    }

    async diceRandomChoice(diceOptions) {
        const randomChoiceIndex = this.getRandomInt(diceOptions.length - 1);
        const randomChoice = diceOptions[randomChoiceIndex];
        return randomChoice;
    }
}