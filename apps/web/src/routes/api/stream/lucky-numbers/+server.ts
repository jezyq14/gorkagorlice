import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
    const streamUrl = locals.api.v1['lucky-numbers'].stream.$url();

    try {
        const response = await fetch(streamUrl, {
            headers: {
                'Accept': 'text/event-stream'
            }
        });

        if (!response.ok) {
            return new Response('Error connecting to backend', { status: 502 });
        }

        return response;

    } catch (error) {
        console.error('Error proxying SSE for lucky numbers:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};