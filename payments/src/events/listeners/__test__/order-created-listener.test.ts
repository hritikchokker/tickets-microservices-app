import { OrderCreatedEvent, OrderStatus } from "@hritik-microservice-ticket-app/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { natsWraper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";

const setup = async () => {
    const Listener = new OrderCreatedListener(natsWraper.client);
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        expiresAt: 'sdsds',
        userId: 'sdsds',
        status: OrderStatus.Created,
        ticket: {
            id: 'sdsds',
            price: 10
        }
    };
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return { Listener, msg, data };
};

it('replicates the order info', async () => {
    const { Listener, msg, data } = await setup();
    await Listener.onMessage(data, msg);
    const order = await Order.findById(data.id);
    expect(order?.price).toEqual(data.ticket.price);
})

it('acks the message', async () => {
    const { Listener, msg, data } = await setup();
    await Listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});