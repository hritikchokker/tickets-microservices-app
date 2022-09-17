import { Publisher, PaymentCreatedEvent,Subjects } from "@hritik-microservice-ticket-app/common";


export class PaymentCreatedPublisher extends  Publisher<PaymentCreatedEvent>{
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
    
}