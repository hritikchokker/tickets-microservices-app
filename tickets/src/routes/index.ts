import express, { Request, Response } from "express";
import { Ticket } from "../models/tickets";
const router = express.Router();

router.get(
    '/api/tickets',
    async (req: Request, res: Response) => {
        try {
            const tickets = await Ticket.find({
                orderId: undefined
            });
            res.send(tickets);
        } catch (error) {
            throw new Error('something went wrong');
        }
    }
);

export { router as indexTicketRouter };