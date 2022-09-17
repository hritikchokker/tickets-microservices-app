import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { currentUserRoute } from './routes/current-user';
import { signinRoute } from './routes/signin';
import { signoutRoute } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandler, NotFoundError } from '@hritik-microservice-ticket-app/common';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test',
        keys: ['x', 'y']
    })
);

app.use(currentUserRoute);
app.use(signinRoute);
app.use(signoutRoute);
app.use(signupRouter);

app.all('*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
