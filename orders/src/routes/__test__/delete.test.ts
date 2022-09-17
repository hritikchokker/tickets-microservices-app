import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/tickets';
import { natsWraper } from '../../nats-wrapper';



it('marks an order as deleted/cancelled', async () => {
    const ticket = Ticket.build({
        title: 'ss',
        price: 42,
        id: new mongoose.Types.ObjectId().toHexString() 
    });
    await ticket.save();
    const user = global.signin();
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});


it('emit a order cancel event', async () => {
    const ticket = Ticket.build({
        title: 'ss',
        price: 42,
        id: new mongoose.Types.ObjectId().toHexString() 
    });
    await ticket.save();
    const user = global.signin();
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);

    expect(natsWraper.client.publish).toHaveBeenCalled();
})



