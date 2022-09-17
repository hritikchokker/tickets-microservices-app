import { OrderCreatedEvent, OrderStatus } from "@hritik-microservice-ticket-app/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/tickets";
import { natsWraper } from "../../../nats-wrapper"
import { OrderCreatedListener } from "../order-created-listener"

const setup = async () => {
    const listener = new OrderCreatedListener(natsWraper.client);

    const ticket = Ticket.build({
        title: 'sds',
        price: 111,
        userId: 'dssss'
    });
    await ticket.save();
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        version: 0,
        userId: 'sdsadasdas',
        expiresAt: 'asdasd3adas',
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }
    // @ts-ignore
    const message: Message = {
        ack: jest.fn()
    };
    return { message, data, ticket, listener };
}
it('sets the userId of the ticket', async () => {
    const { listener, ticket, data, message } = await setup();
    await listener.onMessage(data, message);
    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(data.id);

});

it('acks the message', async () => {
    const { listener, data, message } = await setup();
    await listener.onMessage(data, message);

    expect(message.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
    const { listener, ticket, data, message } = await setup();
    await listener.onMessage(data, message);

    expect(natsWraper.client.publish).toHaveBeenCalled();
    const ticketUpdatedData = JSON.parse((natsWraper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(data.id).toEqual(ticketUpdatedData.orderId);
});