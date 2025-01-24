export class ProbabilityCalculator {
    calculateProbabilities(diceOptions) {
        const probabilities = [];
        for (let i = 0; i < diceOptions.length; i++) {
            const row = [];
            for (let j = 0; j < diceOptions.length; j++) {
                const probability = this.calculateProbability(diceOptions[i], diceOptions[j]);
                row.push(probability.toFixed(4));
            }
            probabilities.push(row);
        }
        return probabilities;
    }

    calculateProbability(dice1, dice2) {
        let wins = 0;
        let total = 0;
        for (const side1 of dice1) {
            for (const side2 of dice2) {
                if (side1 > side2) {
                    wins++;
                }
                total++;
            }
        }
        return wins / total;
    }
}