import { NotFoundError } from "@hritik-microservice-ticket-app/common";
import express, { Request, Response } from "express";
import { Ticket } from "../models/tickets";
const router = express.Router();

router.get(
    '/api/tickets/:id',
    async (req: Request, res: Response) => {
        try {
            const ticket = await Ticket.findById(req.params.id);
            if (!ticket) {
                throw new NotFoundError();
            }
            res.send(ticket);
        } catch (error) {
            throw new Error('something went wrong');
        }

    }
)

export { router as showTicketRouter };
