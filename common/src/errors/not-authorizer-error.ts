import { CustomError } from "./custom-errors";

export class NotAuthorizedError extends CustomError {
    statusCode = 401;
    constructor(public message: string) {
        super(message);
        Object.setPrototypeOf(this, NotAuthorizedError.prototype);
    }
    serializeErrors(): { message: string; field?: string | undefined; }[] {
        return [{ message: 'Not Authorized' }]
    }
}