import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { passportConfig } from './passport';
import { TwitterController } from './twitter.controller';

passportConfig();

const app = express();

const corsOption = {
    credentials: true,
    exposedHeaders: ['x-auth-token'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    origin: true,
};

app.use(cors(corsOption));

app.use(bodyParser.json());

app.use('/api/v1', new TwitterController().router);

app.listen(4000);

console.log('Server running at http://localhost:4000/');
