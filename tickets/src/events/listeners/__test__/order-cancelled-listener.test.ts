import { OrderCancelledEvent, OrderCreatedEvent, OrderStatus } from "@hritik-microservice-ticket-app/common";
import mongoose from "mongoose";
import { Ticket } from "../../../models/tickets";
import { natsWraper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWraper.client);
    const orderId = new mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: 'sds',
        price: 111,
        userId: 'dssss'
    });
    ticket.set({ orderId })
    await ticket.save();
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        }
    }
    // @ts-ignore
    const message: Message = {
        ack: jest.fn()
    };
    return { message, data, ticket, listener, orderId };
};

it('updates the ticket, publishes an even, and acks the message', async () => {
    const { message, data, ticket, listener, orderId } = await setup();
    await listener.onMessage(data, message);
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket?.orderId).not.toBeDefined();
    expect(message.ack).toHaveBeenCalled();
    expect((natsWraper.client.publish)).toHaveBeenCalled();
})


