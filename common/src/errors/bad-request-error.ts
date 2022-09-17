import { CustomError } from "./custom-errors";

export class BadRequestError extends CustomError {
    statusCode = 400;
    constructor(public message: string) {
        super(message);
        this.statusCode = 400;
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
    serializeErrors(): { message: string; field?: string | undefined; }[] {
        return [{ message: this.message }]
    }
}