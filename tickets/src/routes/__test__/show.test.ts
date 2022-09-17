import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
it('returns a 404 if a ticket is not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .get(`/api/tickets/${id}`)
        .send()
        .expect(404)
});

it('return the ticket if the ticket is found', async () => {
    const payload = {
        title: 'dumm',
        price: 21
    }
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send(payload)
        .expect(201)
    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200)
    expect(ticketResponse.body.title).toEqual(payload.title);
    expect(ticketResponse.body.price).toEqual(payload.price);
});

