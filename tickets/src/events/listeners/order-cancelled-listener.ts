import { Listener, OrderCancelledEvent, Subjects } from "@hritik-microservice-ticket-app/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/tickets";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { QUEUE_GROUP_NAME } from './queue-group-name';
export class OrderCancelledListener extends Listener<OrderCancelledEvent>{
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = QUEUE_GROUP_NAME;
    async onMessage(data: OrderCancelledEvent['data'], msg: Message): Promise<void> {
        // find the ticket that the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);
        //  if no tickets through error
        if (!ticket) {
            throw new Error('Ticket Not Found');
        }
        // mark the ticket as being reserved by adding the orderid
        ticket.set({ orderId: undefined });
        // save the ticket
        await ticket.save();
        await new TicketUpdatedPublisher(this.client)
            .publish({
                id: ticket.id,
                orderId: ticket.orderId,
                userId: ticket.userId,
                price: ticket.price,
                title: ticket.title,
                version: ticket.version
            })
        msg.ack();
    }
}