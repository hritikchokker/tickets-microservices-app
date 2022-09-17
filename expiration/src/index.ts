import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { natsWraper } from './nats-wrapper';

const bootstrap = async () => {
    try {
        await natsWraper.connect(process.env.NATS_CLUSTER_ID!, process.env.NATS_CLIENT_ID!, process.env.NATS_URL!)
        natsWraper.client.on('close', () => {
            console.log('NATS connection closed');
            process.exit();
        });
        new OrderCreatedListener(natsWraper.client).listen();
        process.on('SIGINT', () => natsWraper.client.close());
        process.on('SIGTERM', () => natsWraper.client.close());

        console.log('connected to mongodb !!!');
    } catch (error) {
        console.log(error, 'errirr')
    }
};
bootstrap();


// kubectl create secret generic jwt-secret --from-literal=JWT_KEY=supersecureprivatekey


// port forwarding

// kubectl port-forward pods-name port:port
// example
// kubectl port-forward nats-depl-5h4fh453d 4222:4222