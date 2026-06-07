import type { Handle, HandleServerError } from '@sveltejs/kit';
import * as Sentry from '@sentry/sveltekit';
import { sequence } from '@sveltejs/kit/hooks';
import { env } from '$env/dynamic/public';

import { createApi } from '$lib/server/api';

if (env.PUBLIC_FRONTEND_SENTRY_DSN) {
    Sentry.init({
        dsn: env.PUBLIC_FRONTEND_SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: 1.0,
    });
}

export const handleAuth: Handle = async ({ event, resolve }) => {
    const session = event.cookies.get('auth_session');

    event.locals.api = createApi(session);

    return resolve(event);
};

export const handle: Handle = sequence(Sentry.sentryHandle(), handleAuth);

export const handleError: HandleServerError = Sentry.handleErrorWithSentry();