import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError, validateRequest } from '@hritik-microservice-ticket-app/common';
import {  } from '@hritik-microservice-ticket-app/common';
import { User } from '../models/user';
import { Password } from '../services/password';
const router = express.Router();


router.post('/api/users/signin',
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('You must provide a password')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const existingUser = await User.findOne({ email });
            if (!existingUser) {
                throw new BadRequestError('Invalid Credentials');
            }
            const comparePassword = await Password.compare(existingUser.password, password);
            if (!comparePassword) {
                throw new BadRequestError('Invalid Credentials');
            }
            const userJwt = jwt.sign({
                id: existingUser.id,
                email: existingUser.email
            }, process.env.JWT_KEY!);
            req.session = {
                jwt: userJwt
            };
            res.status(200).send(existingUser);
        } catch (error) {
            throw new Error('something went wrong');
        }
        res.send('hi there !');
    })

export { router as signinRoute };