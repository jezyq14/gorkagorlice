import { db, sessions, type User } from '@repo/db';
import { eq } from 'drizzle-orm';
import { deleteCookie, getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';

export type AuthVariables = {
    Variables: {
        user: User;
    };
};

export const requireAuth = createMiddleware<AuthVariables>(async (c, next) => {
    const sessionId = getCookie(c, 'auth_session');

    if (!sessionId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const sessionRecord = await db.query.sessions.findFirst({
        where: eq(sessions.id, sessionId),
        with: {
            user: true
        }
    });

    if (!sessionRecord || sessionRecord.expiresAt < new Date()) {
        deleteCookie(c, 'auth_session');
        return c.json({ error: 'Session expired' }, 401);
    }

    c.set('user', sessionRecord.user);
    await next();
});