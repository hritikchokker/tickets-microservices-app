import { TicketUpdatedEvent } from "@hritik-microservice-ticket-app/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/tickets";
import { natsWraper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";

const setup = async () => {
    const listener = new TicketUpdatedListener(natsWraper.client);
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'sds',
        price: 20
    })
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: ticket.title,
        price: ticket.price,
        userId: new mongoose.Types.ObjectId().toHexString(),
    };

    // @ts-ignore
    const message: Message = {
        ack: jest.fn()
    }
    return { listener, data, message, ticket };
};


it('finds, updates, and saves a ticket', async () => {
    const { message, data, ticket, listener } = await setup();
    await listener.onMessage(data, message);
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the mesasge', async () => {
    const { message, data, listener } = await setup();
    await listener.onMessage(data, message);
    expect(message.ack).toHaveBeenCalled();
});

it('does not call acks if the event has a skipped version number', async () => {
    const { message, data, listener } = await setup();
    data.version = 10;

    try {
        await listener.onMessage(data, message);
    } catch (error) {

    }
    expect(message.ack).not.toHaveBeenCalled();
});