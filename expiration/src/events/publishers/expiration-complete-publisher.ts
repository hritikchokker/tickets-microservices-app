import { Subjects, Publisher, ExpirationCompleteEvent } from '@hritik-microservice-ticket-app/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
    
}