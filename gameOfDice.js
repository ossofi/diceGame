import { DiceConfiguration } from './diceConfig.js';
import { RandomGenerator } from './randomGen.js';
import { FairNumberProtocol } from './fairNum.js';
import { ProbabilityCalculator } from './probability.js';
import { TableGenerator } from './tableGen.js';
import { Errors } from './errors.js';
import promptSync from 'prompt-sync';

const prompt = promptSync();
const args = process.argv.slice(2);

class DiceGame {
    constructor() {
        this.diceConfiguration = new DiceConfiguration();
        this.randomGenerator = new RandomGenerator();
        this.fairNumberProtocol = new FairNumberProtocol();
        this.probabilityCalculator = new ProbabilityCalculator();
        this.tableGenerator = new TableGenerator();
        this.diceOptions = [];
    }

    async start() {
        if (args.length === 0) {
            await Errors.printError("No input found! Provide your choice of dice in the following format: '2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3'.");
            process.exit(1);
        }

        this.diceOptions = this.diceConfiguration.parse(args);
        const value = 1;
        await this.askRandom(value, this.diceOptions);
    }

    async askRandom(value, diceOptions) {
        console.log("Let's determine who makes the first move.");
        const { n, key } = await this.fairNumberProtocol.createRandom(value);
        await Errors.delayedLog(`\nI've chosen a random number in the range 0..${value} (HMAC=${this.randomGenerator.generateHMAC(key, n.toString())}).`);
        await Errors.delayedLog("\nTry to guess my number! ;)");
        this.printOptions(value);
        console.log("X - exit");
        console.log("? - help");

        await this.handleUserSelection(n, key, diceOptions);
    }

    printOptions(value) {
        for (let i = 0; i <= value; i++) {
            console.log(`${i} - ${i}`);
        }
    }

    async handleSelection(value, promptMessage) {
        while (true) {
            console.log();
            const answer = prompt(promptMessage);
            if (answer.toLowerCase() === 'x') {
                console.log("Exiting...");
                process.exit(0);
            } else if (answer === '?') {
                this.showHelp();
            } else {
                const selection = parseInt(answer, 10);
                if (isNaN(selection) || selection < 0 || selection > value) {
                    await Errors.delayedLog(`\nWrrroong! Please enter a number between 0 and ${value}.`);
                } else {
                    return selection;
                }
            }
        }
    }

    showHelp() {
        console.log("\nHey there! :)\nHere's how you can play the game:\nFirstly, you need to guess a number I've randomly chosen in the range 0..5.\nThen, if you guess correctly you can choose any dice you want!\nIf you didn't guess it, i choose the dice first and you get pick from the remaining ones >;)\nAfter that, we'll take turns throwing our dice and adding the results modulo 6.\nWhoever has the highest score wins!\nAre you ready to play? Let's go!\n");
        const probabilities = this.probabilityCalculator.calculateProbabilities(this.diceOptions);
        const table = this.tableGenerator.generateTable(probabilities, this.diceOptions);
        console.log(table);
        console.log("p.s.modulo 6 is simply the remainder of the division by 6. For example, 7 % 6 = 1, 8 % 6 = 2, 9 % 6 = 3, and so on.");
        console.log("to continue, make a selection or type 'X' to exit.");
    }

    async handleUserSelection(n, key, diceOptions) {
        const userSelection = await this.handleSelection(1, "Your selection: ");
        await Errors.delayedLog(`\nMy choice: ${n} (KEY=${key.toString('hex')})`);
        if (userSelection === n) {
            await Errors.delayedLog("\nYou've guessed correctly! Make the first move.");
            const userDiceSelection = await this.diceChoice(diceOptions);
            await Errors.delayedLog(`Your dice: ${diceOptions[userDiceSelection]}`);
            const remainingChoices = diceOptions.filter((_, index) => index !== userDiceSelection);
            const randomChoice = await this.randomGenerator.diceRandomChoice(remainingChoices);
            await Errors.delayedLog(`\nMy dice choice: ${randomChoice}`);

            await this.alternateThrows(randomChoice, userDiceSelection);
        } else {
            await Errors.delayedLog("\nYou didn't guess it! >:)");
            const randomChoice = await this.randomGenerator.diceRandomChoice(diceOptions);
            const remainingChoices = diceOptions.filter(choice => choice !== randomChoice);
            await Errors.delayedLog(`\nI make the first move and choose the [${randomChoice}] dice.`);
            const userDiceSelection = await this.diceChoice(remainingChoices);
            await Errors.delayedLog(`\nYour choice: ${remainingChoices[userDiceSelection]}`);

            await this.alternateThrows(randomChoice, userDiceSelection);
        }
    }

    async alternateThrows(randomChoice, userDiceSelection) {
        let isUserTurn = true;
        let computerThrowValue, userThrowValue;
        while (true) {
            const computerSelection = this.randomGenerator.getRandomInt(5);
            const newKey = this.randomGenerator.generateKey();
            const { total, throwValue } = await this.handleThrow(randomChoice, userDiceSelection, computerSelection, newKey, isUserTurn);
            if (isUserTurn) {
                userThrowValue = throwValue;
                isUserTurn = false;
            } else {
                computerThrowValue = throwValue;
                break;
            }
        }

        if (userThrowValue > computerThrowValue) {
            await Errors.delayedLog(`\nYou win (${userThrowValue} > ${computerThrowValue})!\nImpressive for a human! ;)`);
        } else if (userThrowValue < computerThrowValue) {
            await Errors.delayedLog(`\nI win (${computerThrowValue} > ${userThrowValue})!\nBetter luck next time!`);
        } else {
            await Errors.delayedLog(`\nIt's a tie (${userThrowValue} = ${computerThrowValue})!\nYou're a worthy opponent!`);
        }
    }

    async handleThrow(randomChoice, userSelection, computerSelection, newKey, isUserTurn) {
        if (isUserTurn) {
            await Errors.delayedLog("\nIt's time for your throw.");
        } else {
            await Errors.delayedLog("\nTime for my throw!");
        }
        await Errors.delayedLog(`\nI've chosen a random value in the range 0..5 (HMAC=${this.randomGenerator.generateHMAC(newKey, computerSelection.toString())}).`);
        await Errors.delayedLog(`\nAdd your number modulo 6.`);
        this.printOptions(6);
        console.log("X - exit");
        console.log("? - help");
        const newUserSelection = await this.handleSelection(6, "Your selection: ");
        await Errors.delayedLog(`\nMy choice: ${computerSelection} (KEY=${newKey.toString('hex')})`);
        const total = this.score(newUserSelection, computerSelection);
        if (isUserTurn) {
            await Errors.delayedLog(`\nYour throw is ${randomChoice[total]}`);
        } else {
            await Errors.delayedLog(`\nMy throw is ${randomChoice[total]}`);
        }
        return { total, throwValue: randomChoice[total] };
    }

    async diceChoice(diceOptions) {
        console.log("\nChoose your dice:");
        diceOptions.forEach((option, index) => {
            console.log(`${index} - ${option}`);
        });
        console.log("X - exit");
        console.log("? - help");

        while (true) {
            console.log();
            const answer = prompt("Your choice: ");
            if (answer.toLowerCase() === 'x') {
                console.log("Exiting...");
                process.exit(0);
            } else if (answer === '?') {
                this.showHelp();
            } else {
                const userSelection = parseInt(answer, 10);
                if (isNaN(userSelection) || userSelection < 0 || userSelection >= diceOptions.length) {
                    await Errors.delayedLog(`\nWrrroong! Please enter a number between 0 and ${diceOptions.length - 1}.`);
                } else {
                    return userSelection;
                }
            }
        }
    }

    score(userSelection, computerSelection) {
        const total = (userSelection + computerSelection) % 6;
        console.log(`\nThe result is: ${userSelection} + ${computerSelection} % 6 = ${total}`);
        return total;
    }
}

const game = new DiceGame();
game.start();