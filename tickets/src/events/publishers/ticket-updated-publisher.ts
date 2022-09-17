import { TicketUpdatedEvent, Subjects, Publisher } from '@hritik-microservice-ticket-app/common';
import { natsWraper } from '../../nats-wrapper';
import { TicketCreatedPublisher } from '../publishers/ticket-created-publisher';


export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
    readonly subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}

// new TicketUpdatedPublisher(client).publish(ticket)