import { Listener, Subjects, TicketCreatedEvent } from "@hritik-microservice-ticket-app/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/tickets";
import { QUEUEGROUPNAME } from "./queue-group-name";


export class TicketCreatedListener extends Listener<TicketCreatedEvent>{
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
    queueGroupName = QUEUEGROUPNAME;
    async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
        const { id, title, price } = data;
        const ticket = Ticket.build({ title, price, id });
        await ticket.save();
        msg.ack();
    }
}