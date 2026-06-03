import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import Redis from 'ioredis';
import { EventEmitter } from 'node:events';
import { desc } from 'drizzle-orm';

import { db, luckyNumbers } from '@repo/db';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const redisSubscriber = new Redis(REDIS_URL);
const eventEmitter = new EventEmitter();

eventEmitter.setMaxListeners(1000);

// Redis NEW_LUCKY_NUMBERS channel subscriber
redisSubscriber.subscribe('NEW_LUCKY_NUMBERS');
redisSubscriber.on('message', (channel, message) => {
    if (channel === 'NEW_LUCKY_NUMBERS') {
        console.log('Backend received new lucky numbers from Redis. Sending to clients...');
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
            console.error('Error fetching lucky numbers:', error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
    })
    // GET /v1/lucky-numbers/stream
    .get('/stream', async (c) => {
        return streamSSE(c, async (stream) => {
            const onUpdate = async (message: string) => {
                try {
                    await stream.writeSSE({
                        event: 'update',
                        data: message,
                    });
                } catch (err) {
                    console.error('Error sending SSE:', err);
                }
            };

            eventEmitter.on('update', onUpdate);

            stream.onAbort(() => {
                eventEmitter.off('update', onUpdate);
            });

            while (true) {
                await stream.sleep(15000);
            }
        });
    });