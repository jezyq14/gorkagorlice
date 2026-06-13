import { Hono } from 'hono';
import { authRouter } from './auth';
import { luckyNumbersRouter } from './luckyNumbers';
import { timetableRouter } from './timetable';

export const v1Router = new Hono()
    .route('/auth', authRouter)
    .route('/lucky-numbers', luckyNumbersRouter)
    .route('/timetable', timetableRouter);
