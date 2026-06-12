import * as Sentry from '@sentry/hono/node';

if (process.env.API_SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.API_SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        sendDefaultPii: true,
        tracesSampleRate: 1,
    });
}

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { v1Router } from './routes/v1';
import { serve } from '@hono/node-server';
import { AuthVariables } from './middleware/auth';
import { sentry } from '@sentry/hono/node';
import { logger } from './utils/logger';

import { openAPIRouteHandler } from 'hono-openapi';
import { Scalar } from '@scalar/hono-api-reference';

const app = new Hono<AuthVariables>();

app.use(sentry(app));

app.use('*', async (c, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;

    logger.info(
        {
            method: c.req.method,
            url: c.req.url,
            status: c.res.status,
            durationMs: ms,
            ip:
                c.req.header('cf-connecting-ip') ||
                c.req.header('x-forwarded-for') ||
                c.req.header('remote-addr') ||
                'unknown',
        },
        'Incoming request',
    );
});

app.use(
    '*',
    cors({
        origin: [process.env.WEB_URL!],
        credentials: true,
    }),
);

app.get('/', (c) => {
    return c.text('👋 Górka Gorlice API!');
});

const routes = app.route('/v1', v1Router);

export type AppType = typeof routes;

// OpenAPI Documentation and API Reference UI
app.get(
    '/openapi',
    openAPIRouteHandler(app, {
        documentation: {
            info: {
                title: 'Górka Gorlice API',
                version: 'v1',
                description: 'Official API for the ZS1 Gorlice platform.',
            },
            servers: [
                { url: 'http://localhost:3000', description: 'Local Development Server' },
                {
                    url: 'https://api.gorkagorlice.pl',
                    description: 'Production Server (not deployed yet)',
                },
            ],
        },
    }),
);

app.get(
    '/docs',
    Scalar({
        url: '/openapi',
        theme: 'default',
        pageTitle: 'Górka Gorlice API Reference',
    }),
);

const PORT = Number(process.env.API_PORT ?? '3000');

serve({ fetch: app.fetch, port: PORT }, (info) => {
    logger.info(`Server is running on http://localhost:${info.port}`);
});

export default app;
