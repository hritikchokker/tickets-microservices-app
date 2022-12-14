import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
let mongo: any;
import { app } from '../app';
declare global {
    var signin: (id?:string) => string[];
}

jest.mock('../nats-wrapper');
beforeAll(async () => {
    process.env.JWT_KEY = 'supersecureprivatekey';
    mongo = await MongoMemoryServer.create();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri);
    console.log('connected to mongodb');
});


beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
})

afterAll(async () => {
    if (mongo) {
        await mongo.stop();
    }
    await mongoose.connection.close();
})

global.signin = (id?: string) => {
    // build jwt payload
    const uid = id || new mongoose.Types.ObjectId().toHexString();
    const payload = { id: uid, email: 'test@test.com' }

    // create the JWT
    const token = jwt.sign(payload, process.env.JWT_KEY!);
    // build session object
    const session = { jwt: token };
    // turn that session into JSON
    const sessionJSON = JSON.stringify(session);
    // take JSON and ecode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');
    // return a string thats the cookie with the encoded data
    return [`session=${base64}`];
}