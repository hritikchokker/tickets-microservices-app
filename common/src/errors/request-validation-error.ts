import { ValidationError, validationResult } from 'express-validator';
import { CustomError } from './custom-errors';

export class RequestValidationError extends CustomError {
    statusCode = 400;
    constructor(public errors: Array<ValidationError>) {
        super('invalid request parameters');
        //  extending 
        this.errors = errors;
        Object.setPrototypeOf(this, validationResult.prototype);
    }

    serializeErrors() {
        return this.errors.map(err => {
            return { message: err.msg, field: err.param }
        });
    }

}
