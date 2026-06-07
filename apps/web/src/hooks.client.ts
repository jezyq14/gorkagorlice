import * as Sentry from '@sentry/sveltekit';
import { env } from '$env/dynamic/public';
import type { HandleClientError } from '@sveltejs/kit';

if (env.PUBLIC_FRONTEND_SENTRY_DSN) {
    Sentry.init({
        dsn: env.PUBLIC_FRONTEND_SENTRY_DSN,
        environment: import.meta.env.MODE || 'development',
        tracesSampleRate: 1.0,

        integrations: [
            Sentry.browserTracingIntegration(),
            // Turn off session replay for respecting privacy of users
            // Sentry.replayIntegration(),
        ],

        replaysOnErrorSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
    });
}

export const handleError: HandleClientError = Sentry.handleErrorWithSentry();