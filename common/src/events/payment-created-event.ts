import { Subjects } from "./subjects";


export interface PaymentCreatedEvent {
    subject: Subjects.PaymentCreated,
    data: {
        id:string,
        token: string,
        orderId: string
    }
}