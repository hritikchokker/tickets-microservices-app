import { OrderStatus } from '@hritik-microservice-ticket-app/common';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Payment } from '../../models/payment';
import { stripe } from '../../stripe';

// remove this to test realistic stripe test(with api key)
jest.mock('../../stripe');

it('returns a 404 when purchasing an order that does not exits', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'asdsadas',
            orderId: new mongoose.Types.ObjectId().toHexString()
        })
        .expect(404)
});

it('retuns a 401 when purchasing an order that doesnt belong to the user', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        status: OrderStatus.Created
    });
    await order.save();
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'asdsadas',
            orderId: order.id
        })
        .expect(401)
});

it('returns a 400 when purchasing a cancelled order', async () => {

    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price: 20,
        status: OrderStatus.Cancelled
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'asdsadas',
            orderId: order.id
        })
        .expect(400)
});

it('returns a 201 with valid inputs', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price: 20,
        status: OrderStatus.Created
    });
    await order.save();
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id
        }).expect(201);
    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    expect(chargeOptions.source).toEqual('tok_visa');
    expect(chargeOptions.amount).toEqual(order.price * 100);
    expect(chargeOptions.currency).toEqual('inr');
});


it.todo('returns a 201 with valid inputs stripe realistic test ', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price,
        status: OrderStatus.Created
    });
    await order.save();
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id
        }).expect(201);
    const stripeCharges = await stripe.charges.list({ limit: 50 });
    const stripeCharge = stripeCharges.data.find(charge => {
        return charge.amount === (price * 100)
    });
    expect(stripeCharge).toBeDefined();
    expect(stripeCharge?.currency).toEqual('inr');

});


it.todo('should test payment stored in db', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price,
        status: OrderStatus.Created
    });
    await order.save();
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id
        }).expect(201);
    const stripeCharges = await stripe.charges.list({ limit: 50 });
    const stripeCharge = stripeCharges.data.find(charge => {
        return charge.amount === (price * 100)
    });
    expect(stripeCharge).toBeDefined();
    expect(stripeCharge?.currency).toEqual('inr');

    const payment = await Payment.findOne({
        orderId: order.id,
        token: stripeCharge!.id
    })
    expect(payment).not.toBeNull();
});


