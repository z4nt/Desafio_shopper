import * as cors from 'cors';
import * as express from 'express';
import * as logger from 'morgan';

import { router } from './routes/index';
export const app = express()

app.use(cors())
app.use(logger('dev'))
app.use(express.json({limit: '50mb'}));
app.use('/', router)