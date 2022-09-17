import { Publisher, OrderCreatedEvent, Subjects } from "@hritik-microservice-ticket-app/common";


export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}