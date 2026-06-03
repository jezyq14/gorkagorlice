import { Hono } from 'hono';
import { authRouter } from './auth';
import { luckyNumbersRouter } from './luckyNumbers';

export const v1Router = new Hono()
    .route('/auth', authRouter)
    .route('/lucky-numbers', luckyNumbersRouter);