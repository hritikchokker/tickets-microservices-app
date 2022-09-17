import { OrderCancelledEvent, OrderStatus } from "@hritik-microservice-ticket-app/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { natsWraper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
    const Listener = new OrderCancelledListener(natsWraper.client);
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        price: 10,
        userId: 'sd3d3d'
    })
    await order.save();
    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: order.version + 1,
        ticket: {
            id: 'dsdsdsd'
        }
    }
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return { Listener, msg, data, order };
};


it('updates the status of the order', async () => {
    const { msg, order, Listener, data } = await setup();
    await Listener.onMessage(data, msg);
    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
})


it('acks the message', async () => {
    const { msg, Listener, data } = await setup();
    await Listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
})