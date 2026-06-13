import * as Sentry from '@sentry/node';

if (process.env.WORKER_SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.WORKER_SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: 1,
    });
}

import cron from 'node-cron';
import Redis from 'ioredis';
import { db } from '@repo/db';
import { luckyNumbers } from '@repo/db/schema';
import { fetchLuckyNumbers } from './scrapers/luckyNumbers';
import { logger } from './utils/logger';
import { fetchAndSyncTimetable } from './scrapers/timetable';

const isDev = process.env.NODE_ENV === 'development';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(REDIS_URL);

logger.info('Worker started.');

async function runLuckyNumbersJob() {
    logger.info('Starting to fetch lucky numbers...');

    try {
        const luckyData = await fetchLuckyNumbers();

        if (luckyData) {
            logger.info(
                `Successfully fetched! Date: ${luckyData.dateString}, Numbers: ${luckyData.numbers.join(', ')}`,
            );

            await db
                .insert(luckyNumbers)
                .values({ date: luckyData.date, numbers: luckyData.numbers })
                .onConflictDoUpdate({
                    target: luckyNumbers.date,
                    set: { numbers: luckyData.numbers },
                });

            await redis.publish(
                'NEW_LUCKY_NUMBERS',
                JSON.stringify({
                    date: luckyData.date.toISOString(),
                    dateString: luckyData.dateString,
                    numbers: luckyData.numbers,
                }),
            );

            logger.info('Published NEW_LUCKY_NUMBERS event.');
        } else {
            logger.warn(
                "Scraper hasn't found lucky numbers! School website structure may have been changed.",
            );
        }
    } catch (error) {
        logger.error(error, 'Critical error during lucky numbers scraping');
        Sentry.captureException(error);
    }
}

async function runTimetableJob() {
    logger.info('Starting to fetch and sync timetable...');

    try {
        await fetchAndSyncTimetable();
        logger.info('Timetable fetched and synced successfully.');
    } catch (error) {
        logger.error(error, 'Error during timetable scraping');
        Sentry.captureException(error);
    }
}

cron.schedule('30 0 18 * * *', runLuckyNumbersJob, { timezone: 'Europe/Warsaw' });
cron.schedule('0 0 3 * * 0', runTimetableJob, { timezone: 'Europe/Warsaw' });

if (isDev) {
    logger.info('Test run...');
    runLuckyNumbersJob();
    runTimetableJob();
}
