import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

const stan = nats.connect('ticketing', 'abc', {
    url: 'http://localhost:4222'
});

stan.on('connect', async () => {
    try {
        stan.on('close', () => {
            console.log('NATS connection closed');
            process.exit();
        })
        console.log('publisher connected to NATS');
        const publisher = new TicketCreatedPublisher(stan);
        await publisher.publish({
            id: '123',
            title: 'conce',
            price: 20
        })
    } catch (error) {

    }

    // const data = JSON.stringify({
    //     id: '123',
    //     title: 'concert',
    //     price: 20
    // });
    // stan.publish('ticket:created', data, () => {
    //     console.log('event published')
    // });
})

process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());

// kubectl port-forward nats-depl-idss 4222:4222
// development setting to connect to a pod
// kubectl port-forward nats-depl-idss 8222:8222

// localhost:8222/streaming