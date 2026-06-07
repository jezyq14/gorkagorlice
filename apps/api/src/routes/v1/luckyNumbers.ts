import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import Redis from 'ioredis';
import { EventEmitter } from 'node:events';
import { desc } from 'drizzle-orm';

import { db, luckyNumbers } from '@repo/db';
import { logger } from '../../utils/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const redisSubscriber = new Redis(REDIS_URL);
const eventEmitter = new EventEmitter();

eventEmitter.setMaxListeners(1000);

redisSubscriber.on('error', (err) => {
    logger.error({ err }, 'Redis connection error.');
});

// Redis NEW_LUCKY_NUMBERS channel subscriber
redisSubscriber.subscribe('NEW_LUCKY_NUMBERS');
redisSubscriber.on('message', (channel, message) => {
    if (channel === 'NEW_LUCKY_NUMBERS') {
        logger.info('Backend received new lucky numbers from Redis. Sending to clients...');
        eventEmitter.emit('update', message);
    }
});

export const luckyNumbersRouter = new Hono()
    // GET /v1/lucky-numbers
    .get('/', async (c) => {
        try {
            const latestNumbers = await db.query.luckyNumbers.findFirst({
                orderBy: [desc(luckyNumbers.date)]
            });

            if (!latestNumbers) {
                return c.json({ date: null, numbers: [] }, 404);
            }

            return c.json({
                date: latestNumbers.date,
                numbers: latestNumbers.numbers
            });
        } catch (error) {
            logger.error({ error }, 'Error fetching lucky numbers');
            return c.json({ error: 'Internal Server Error' }, 500);
        }
    })
    // GET /v1/lucky-numbers/stream
    .get('/stream', async (c) => {
        return streamSSE(c, async (stream) => {
            let isAborted = false;

            const onUpdate = async (message: string) => {
                if (isAborted) return;
                try {
                    await stream.writeSSE({
                        event: 'update',
                        data: message,
                    });
                } catch (err) {
                    logger.error({ err }, 'Error sending SSE');
                }
            };

            eventEmitter.on('update', onUpdate);

            stream.onAbort(() => {
                isAborted = true;
                eventEmitter.off('update', onUpdate);
            });

            await stream.writeSSE({ event: 'ping', data: 'connected' });

            while (!isAborted) {
                await stream.sleep(15000);
                if (!isAborted) {
                    await stream.writeSSE({ event: 'ping', data: 'alive' });
                }
            }
        });
    });