import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@hritik-microservice-ticket-app/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Ticket } from '../models/tickets';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWraper } from '../nats-wrapper';

const router = express.Router();

router.post(
    '/api/orders',
    requireAuth,
    [
        body('ticketId')
            .not()
            .isEmpty()
            .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
            .withMessage('Ticketid must be provided')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        try {
            const { ticketId } = req.body;
            const ticket = await Ticket.findById(ticketId);
            if (!ticket) {
                throw new NotFoundError();
            }
            const isReserved = await ticket.isReserved();
            if (isReserved) {
                throw new BadRequestError('Ticket is already reserved');
            }
            const expiration = new Date();
            expiration.setSeconds(expiration.getSeconds() + 15 * 60);
            const order = await Order.build({
                userId: req.currentUser!.id,
                status: OrderStatus.Created,
                expiresAt: expiration,
                ticket
            });
            new OrderCreatedPublisher(natsWraper.client).publish({
                id: order.id,
                status: order.status,
                userId: order.userId,
                version: order.version,
                expiresAt: order.expiresAt.toISOString(),
                ticket: {
                    id: ticket.id,
                    price: ticket.price
                }
            })
            res.status(201).send(order)
        } catch (error) {

        }
    }
);

export { router as newOrderRouter };