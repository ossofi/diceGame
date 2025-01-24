export class Errors {
    static formatErrorMessage(message) {
        return `\x1B[35;4mOops\x1B[m: ${message}`;
    }

    static async printError(message) {
        return new Promise((resolve) => {
            console.error(Errors.formatErrorMessage(message));
            console.error();
            resolve();
        });
    }

    static async delayedLog(message) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(message);
                resolve();
            }, 800);
        });
    }
}