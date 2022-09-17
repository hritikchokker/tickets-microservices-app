import { BadRequestError, NotAuthorizedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@hritik-microservice-ticket-app/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { natsWraper } from '../nats-wrapper';
import { stripe } from '../stripe';

const router = express.Router();

router.post(
    '/api/payments',
    requireAuth,
    [
        body('token')
            .not()
            .isEmpty(),
        body('orderId')
            .not()
            .isEmpty()
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        try {
            const { token, orderId } = await req.body;
            const order = await Order.findById(orderId);
            if (!order) {
                throw new NotFoundError();
            }
            if (order.userId !== req.currentUser?.id) {
                throw new NotAuthorizedError('Not Authorised');
            }
            if (order.status === OrderStatus.Cancelled) {
                throw new BadRequestError('order is already cancelled');
            }

            const charge = await stripe.charges.create({
                currency: 'inr',
                amount: order.price * 100,
                source: token
            });
            const payment = Payment.build({
                orderId,
                token: charge.id
            });
            await payment.save();
            new PaymentCreatedPublisher(natsWraper.client).publish({
                id: payment.id,
                orderId: payment.orderId,
                token: payment.token
            })
            res.status(201).send({ success: true, id: payment.id })
        } catch (error) {
            throw new Error('something went wrong');
        }
    }
)

export { router as createChargeRouter };