import mongoose from 'mongoose';
import { app } from './app';
const bootstrap = async () => {
    process.env.JWT_KEY = 'supersecureprivatekey';
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY is missing');
    }
    try {
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