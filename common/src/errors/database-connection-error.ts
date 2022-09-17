import { CustomError } from "./custom-errors";

export class DatabaseConnectionError extends CustomError {
    reason = 'Error connecting to database';
    statusCode = 500;
    constructor() {
        super('error connecting to db');
        Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
    }
    serializeErrors() {
        return [
            {
                message: this.reason,
                statusCode: this.statusCode
            }
        ]
    }
}
