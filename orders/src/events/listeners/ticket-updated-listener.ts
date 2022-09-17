import { Listener, Subjects, TicketUpdatedEvent } from "@hritik-microservice-ticket-app/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/tickets";
import { QUEUEGROUPNAME } from "./queue-group-name";


export class TicketUpdatedListener extends Listener<TicketUpdatedEvent>{
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName = QUEUEGROUPNAME;
    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        const ticket = await Ticket.findByEvent(data);
        if (!ticket) {
            throw new Error('Ticket not found');
        }
        const { title, price } = data;
        ticket.set({ title, price });
        await ticket.save();
        msg.ack();
    }
}