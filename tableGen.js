import Table from 'cli-table3';

export class TableGenerator {
    generateTable(probabilities, diceOptions) {
        const table = new Table({
            head: ['User dice v', ...diceOptions.map(dice => dice.join(','))],
            colWidths: [15, ...diceOptions.map(() => 15)]
        });

        probabilities.forEach((row, i) => {
            table.push({ [diceOptions[i].join(',')]: row });
        });

        return table.toString();
    }
}