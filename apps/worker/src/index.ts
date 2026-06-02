import cron from 'node-cron';
import Redis from 'ioredis';
import { db, luckyNumbers } from '@repo/db';

import { fetchLuckyNumbers } from './scrapers/luckyNumbers';

const isDev = process.env.NODE_ENV === 'development';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(REDIS_URL);

console.log('Worker started.');

// 18:00:30
cron.schedule('30 0 18 * * *', async () => {
    console.log('Starting to fetch lucky numbers...');

    const luckyData = await fetchLuckyNumbers();

    if (luckyData) {
        console.log(`Successfully fetched! Date: ${luckyData.dateString}, Numbers: ${luckyData.numbers.join(', ')}`);

        try {
            await db
                .insert(luckyNumbers)
                .values({
                    date: luckyData.date,
                    numbers: luckyData.numbers
                })
                .onConflictDoUpdate({
                    target: luckyNumbers.date,
                    set: { numbers: luckyData.numbers }
                });

            console.log('Saved lucky numbers to database.');

            const eventPayload = {
                date: luckyData.date.toISOString(),
                dateString: luckyData.dateString,
                numbers: luckyData.numbers
            };

            await redis.publish('NEW_LUCKY_NUMBERS', JSON.stringify(eventPayload));
            console.log('Published NEW_LUCKY_NUMBERS event.');

        } catch (error) {
            console.error('Error saving lucky numbers to database or publishing NEW_LUCKY_NUMBERS event:', error);
        }
    }
}, {
    timezone: "Europe/Warsaw"
});

if (isDev) {
    (async () => {
        console.log('Test run...');
        const luckyData = await fetchLuckyNumbers();

        if (luckyData) {
            console.log('Result:', luckyData);

            try {
                await db
                    .insert(luckyNumbers)
                    .values({ date: luckyData.date, numbers: luckyData.numbers })
                    .onConflictDoUpdate({ target: luckyNumbers.date, set: { numbers: luckyData.numbers } });

                await redis.publish('NEW_LUCKY_NUMBERS', JSON.stringify({
                    date: luckyData.date.toISOString(),
                    numbers: luckyData.numbers
                }));
                console.log('Saved lucky numbers to database and published NEW_LUCKY_NUMBERS event.');
            } catch (err) {
                console.error('Error saving lucky numbers to database or publishing to Redis:', err);
            }
        }
    })();
}