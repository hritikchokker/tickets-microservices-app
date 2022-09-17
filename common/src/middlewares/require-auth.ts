import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { NotAuthorizedError } from "../errors/not-authorizer-error";

export const requireAuth = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.currentUser) {
        throw new NotAuthorizedError('Not Authorised');
    }
    next();
};