import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { natsWraper } from '../../nats-wrapper';
import { Ticket } from '../../models/tickets';
it('returns a 404 if the provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', signin())
        .send({
            title: 'asdfg',
            price: 20
        })
        .expect(404)
});

it('returns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'asdfg',
            price: 20
        })
        .expect(404)
});

it('returns a 401 if the user does not own a ticket', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({ title: 'asdas', price: 13 })
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', signin())
        .send({ title: 'asdas', price: 130 })
        .expect(401)
});

it('returns a 400 if the user provides an invalid title or price', async () => {
    const cookie = signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({ title: 'asdas', price: 13 })
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({ title: '', price: 20 })
        .expect(400)
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({ title: 'valid', price: -10 })
        .expect(400)
});

it('updates the ticket  provided valid inputs', async () => {
    const cookie = signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({ title: 'asdas', price: 13 })
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'latest title',
            price: 50
        })
        .expect(200)
    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send();
    expect(ticketResponse.body.title).toEqual('latest title')
    expect(ticketResponse.body.price).toEqual(13)
});


it('publishes an event ', async () => {
    const cookie = signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({ title: 'asdas', price: 13 })
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'latest title',
            price: 50
        })
        .expect(200)
    expect(natsWraper.client.publish).toHaveBeenCalled();
});

it('rejects updates if the ticket is reserved', async () => {
    const cookie = signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({ title: 'asdas', price: 13 })
    const ticket = await Ticket.findById(response.body.id);
    ticket?.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
    await ticket?.save();
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'latest title',
            price: 50
        })
        .expect(400)
});