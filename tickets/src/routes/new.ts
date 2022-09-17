import express, { Request, Response } from "express";
import { requireAuth, validateRequest } from '@hritik-microservice-ticket-app/common';
import { body } from 'express-validator';
import { Ticket } from "../models/tickets";
import { natsWraper } from '../nats-wrapper';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
const router = express.Router();

router.post(
    '/api/tickets',
    requireAuth,
    [
        body('title')
            .not()
            .isEmpty()
            .withMessage('title is required'),
        body('price')
            .isFloat({
                gt: 0
            })
            .withMessage('Price must be greater than 0')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        try {
            const { title, price } = req.body;
            const ticket = Ticket.build({
                title,
                price,
                userId: req.currentUser!.id
            })
            res.sendStatus(200)
            await ticket.save();
            new TicketCreatedPublisher(natsWraper.client).publish({
                id: ticket.id,
                title: ticket.title,
                price: ticket.price,
                userId: ticket.userId,
                version: ticket.version
            })
            res.status(201).send(ticket);
        } catch (error) {
            throw new Error('something went wrong');
        }

    }
)

export { router as createTicketRouter };
