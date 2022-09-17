import { TicketCreatedEvent, Subjects, Publisher } from '@hritik-microservice-ticket-app/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
    readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
}

// new TicketCreatedPublisher(client).publish(ticket)