import mongoose from 'mongoose';
import { app } from './app';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { natsWraper } from './nats-wrapper';

const bootstrap = async () => {
    process.env.JWT_KEY = 'supersecureprivatekey';
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY is missing');
    }
    try {
        await natsWraper.connect(process.env.NATS_CLUSTER_ID!, process.env.NATS_CLIENT_ID!, process.env.NATS_URL!)
        natsWraper.client.on('close', () => {
            console.log('NATS connection closed');
            process.exit();
        });
        process.on('SIGINT', () => natsWraper.client.close());
        process.on('SIGTERM', () => natsWraper.client.close());

        new OrderCreatedListener(natsWraper.client).listen();
        new OrderCancelledListener(natsWraper.client).listen();
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('connected to mongodb !!!');
    } catch (error) {
        console.log(error, 'errirr')
    }
    app.listen(3000, () => {
        console.log('listening on port 3000');
    })
};
bootstrap();


// kubectl create secret generic jwt-secret --from-literal=JWT_KEY=supersecureprivatekey


// port forwarding

// kubectl port-forward pods-name port:port
// example
// kubectl port-forward nats-depl-5h4fh453d 4222:4222