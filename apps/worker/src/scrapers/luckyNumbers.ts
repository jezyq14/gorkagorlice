import * as cheerio from 'cheerio';
import { logger } from '../utils/logger';

export interface LuckyNumbersData {
    date: Date;
    dateString: string;
    numbers: number[];
}

const SCHOOL_WEBSITE = process.env.SCHOOL_WEBSITE!;

function parsePolishDate(dateStr: string): Date {
    const months: Record<string, number> = {
        'stycznia': 0, 'lutego': 1, 'marca': 2, 'kwietnia': 3,
        'maja': 4, 'czerwca': 5, 'lipca': 6, 'sierpnia': 7,
        'września': 8, 'października': 9, 'listopada': 10, 'grudnia': 11
    };

    const match = dateStr.match(/(\d+)\s+([a-ząćęłńóśźż]+)\s+(\d{4})/i);

    if (!match) {
        return new Date();
    }

    const day = parseInt(match[1], 10);
    const monthName = match[2].toLowerCase() as keyof typeof months;
    const year = parseInt(match[3], 10);

    const month = months[monthName] ?? new Date().getMonth();

    // year, month, day, 00, 00, 00
    return new Date(Date.UTC(year, month, day));
}

export async function fetchLuckyNumbers(): Promise<LuckyNumbersData | null> {
    try {
        const response = await fetch(SCHOOL_WEBSITE);

        if (!response.ok) {
            throw new Error(`Error fetching page: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const dateText = $('.lucky-date-new').text().replace(/\n/g, '').trim();

        const numbers = $('.lucky-num-new')
            .map((_, el) => $(el).text().trim())
            .get()
            .map(Number);

        if (!dateText || numbers.length === 0) {
            logger.warn('No lucky numbers found on the page.');
            return null;
        }

        const parsedDate = parsePolishDate(dateText);

        return {
            date: parsedDate,
            dateString: dateText,
            numbers
        };
    } catch (error) {
        logger.error({ error }, 'Error scraping lucky numbers:');
        return null;
    }
}