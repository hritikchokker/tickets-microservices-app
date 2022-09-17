import { NotAuthorizedError, NotFoundError, OrderStatus, requireAuth } from '@hritik-microservice-ticket-app/common';
import express, { Request, Response } from 'express';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { Order } from '../models/order';
import { natsWraper } from '../nats-wrapper';

const router = express.Router();

router.delete(
    '/api/orders/:orderId',
    requireAuth,
    async (req: Request, res: Response) => {
        const order = await Order.findById(req.params.orderId).populate('ticket');
        if (!order) {
            throw new NotFoundError();
            return;
        }
        if (order.userId !== req.currentUser?.id) {
            throw new NotAuthorizedError('not authorized');
            return
        }
        order.status = OrderStatus.Cancelled;
        await order.save();
        new OrderCancelledPublisher(natsWraper.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        })
        res.status(204).send({});
    }
);

export { router as deleteOrderRouter };