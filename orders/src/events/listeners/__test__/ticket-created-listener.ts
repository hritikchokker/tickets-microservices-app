import { TicketCreatedListener } from "../ticket-created-listener";
import { TicketCreatedEvent } from '@hritik-microservice-ticket-app/common';
import { natsWraper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/tickets";

const setup = async () => {
    const listener = new TicketCreatedListener(natsWraper.client);
    const data: TicketCreatedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'css',
        price: 33,
        userId: new mongoose.Types.ObjectId().toHexString(),
    };

    // @ts-ignore
    const message: Message = {
        ack: jest.fn()
    }
    return { listener, data, message };
};

it('creates and save a ticket', async () => {
    const { listener, data, message } = await setup();
    await listener.onMessage(data, message);

    const ticket = await Ticket.findById(data.id);
    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);

});

it('acks the message', async () => {
    const { listener, data, message } = await setup();
    await listener.onMessage(data, message);
    expect(message.ack).toHaveBeenCalled();
});
