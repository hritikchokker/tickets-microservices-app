import { requireAuth } from '@hritik-microservice-ticket-app/common';
import express, { Request, Response } from 'express';
import { Order } from '../models/order';

const router = express.Router();

router.get(
    '/api/orders',
    requireAuth,
    async (req: Request, res: Response) => {
        try {
            const orders = Order.find({
                userId: req.currentUser?.id,
            }).populate('ticket');
            res.send(orders)
        } catch (error) {
            throw new Error('something went wrong');
        }
    }
);

export { router as indexOrderRouter };