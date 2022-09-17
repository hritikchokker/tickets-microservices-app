import { Request, Response, NextFunction } from "express"
import { CustomError } from "../errors/custom-errors";

export const errorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const code: number = err.statusCode;
    if (err instanceof CustomError) {
        return res.status(code).send({ errors: err.serializeErrors() });
    }
    res.status(code).send({
        errors: [{ message: 'Something went wrong' }]
    })
};