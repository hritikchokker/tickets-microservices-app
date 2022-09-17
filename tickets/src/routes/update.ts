import express, { Request, Response } from "express";
import { BadRequestError, NotAuthorizedError, NotFoundError, requireAuth, validateRequest } from '@hritik-microservice-ticket-app/common';
import { body } from 'express-validator';
import { Ticket } from "../models/tickets";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { natsWraper } from "../nats-wrapper";
const router = express.Router();

router.put(
    '/api/tickets/:id',
    requireAuth,
    [
        body('title')
            .not()
            .isEmpty()
            .withMessage('Title is required'),
        body('price')
            .isFloat({ gt: 0 })
            .withMessage('Price must be provided and must be greater than 0'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        try {
            const ticket = await Ticket.findById(req.params.id);
            if (!ticket) {
                throw new NotFoundError();
            }
            if (ticket.userId !== req.currentUser!.id) {
                throw new NotAuthorizedError('not authorized');
            }
            if (ticket.orderId) {
                throw new BadRequestError('ticket already reserved');
            }
            ticket.set({
                title: req.body.title,
                price: req.body.price
            });
            await ticket.save();
            new TicketUpdatedPublisher(natsWraper.client).publish({
                id: ticket.id,
                title: ticket.title,
                price: ticket.price,
                userId: ticket.userId,
                version: ticket.version
            });
            res.send(ticket);
        } catch (error) {
            throw new Error('something went wrong');
        }
    }
);

export { router as updateTicketRouter };