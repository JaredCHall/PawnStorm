export class UciUnexpectedOutputError extends Error {
    constructor(output: string, regex: RegExp) {
        super(`Unexpected UCI output. Regex "${regex} does not match last line of output: "${output}"`);
    }
}