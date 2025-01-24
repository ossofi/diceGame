import { Errors } from './errors.js';

export class DiceConfiguration {
    parse(args) {
        const errors = [];
        if (args.length === 0) {
            errors.push("No dice provided. You must specify more than two dice. Example: '2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3'.");
        } else if (args.length <= 2) {
            errors.push("You must specify more than two dice! Example: '2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3'.");
        }

        const processedArgs = args.map(arg => {
            const numbers = arg.split(',').map(num => num.trim()).map(Number);
            if (numbers.some(isNaN)) {
                errors.push(`Wrong input! '${arg}'. Dice can only contain integers. Example: '2,2,4,4,9,9'.`);
            }
            if (numbers.some(num => num <= 0)) {
                errors.push(`Wrong input! '${arg}'. Each side should be > 0. Example: '2,2,4,4,9,9'.`);
            }
            return numbers;
        });

        const sidesCount = processedArgs[0]?.length;
        if (processedArgs.some(dice => dice.length !== sidesCount)) {
            errors.push("All dice must have the same number of sides. Example: '2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3'.");
        }

        if (errors.length > 0) {
            for (const error of errors) {
                Errors.printError(error);
            }
            process.exit(1);
        }

        return processedArgs;
    }
}