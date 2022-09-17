import { Ticket } from "../tickets";

it('implements optimistic concurrency control', async () => {
    const ticket = Ticket.build({
        title: 'ads',
        price: 10,
        userId: '12222'
    })
    await ticket.save();
    // save the second fetched ticket and expect an error
    try {
        const firstInstance = await Ticket.findById(ticket.id);
        const secondInstance = await Ticket.findById(ticket.id);
        firstInstance?.set({ price: 10 });
        secondInstance?.set({ price: 15 });
        await firstInstance?.save();
        await secondInstance?.save();
    } catch (err) {
        return;
    }
    throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'sdaa',
        price: 12,
        userId: '1322'
    });
    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1)
    await ticket.save();
    expect(ticket.version).toEqual(2);
});