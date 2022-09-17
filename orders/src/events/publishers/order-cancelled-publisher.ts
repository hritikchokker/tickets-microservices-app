import { Publisher, OrderCancelledEvent, Subjects } from "@hritik-microservice-ticket-app/common";


export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}