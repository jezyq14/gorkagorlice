import { createApi } from '$lib/api';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const session = event.cookies.get('auth_session');

    event.locals.api = createApi(session);

    return resolve(event);
};